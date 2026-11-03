// src/hooks/useInventory.js
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { EGGS_PER_TRAY } from "../utils/constants";

// ============================================
// Helper: Convert trays + pieces to total pieces
// ============================================
export const toTotalPieces = (trays, pieces) => {
  return trays * EGGS_PER_TRAY + pieces;
};

// ============================================
// Helper: Convert total pieces back to trays + pieces
// ============================================
export const toTraysAndPieces = (totalPieces) => {
  return {
    trays: Math.floor(totalPieces / EGGS_PER_TRAY),
    pieces: totalPieces % EGGS_PER_TRAY,
  };
};

// ============================================
// Hook: Real-time Bodega Stock
// ============================================
export const useBodegaStock = () => {
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "bodegaStock"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          data[doc.id] = { id: doc.id, ...doc.data() };
        });
        setStock(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Bodega stock listener error:", err);
        setError("Cannot load bodega stock. Check your connection.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { stock, loading, error };
};

// ============================================
// Hook: Real-time Tindahan Stock
// ============================================
export const useTindahanStock = () => {
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tindahanStock"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          data[doc.id] = { id: doc.id, ...doc.data() };
        });
        setStock(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Tindahan stock listener error:", err);
        setError("Cannot load tindahan stock. Check your connection.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { stock, loading, error };
};

// ============================================
// Action: Log Delivery to Bodega (Admin only)
// ============================================
export const logDelivery = async (sizeId, trays, pieces, userId) => {
  if (trays === 0 && pieces === 0) {
    throw new Error("Please enter at least 1 tray or 1 piece.");
  }

  const bodegaRef = doc(db, "bodegaStock", sizeId);

  try {
    // Use a transaction for safety
    await runTransaction(db, async (transaction) => {
      const bodegaDoc = await transaction.get(bodegaRef);

      if (!bodegaDoc.exists()) {
        throw new Error(`Egg size "${sizeId}" not found in bodega.`);
      }

      const current = bodegaDoc.data();
      const currentTotal = toTotalPieces(current.trays, current.pieces);
      const addTotal = toTotalPieces(trays, pieces);
      const newTotal = currentTotal + addTotal;
      const newStock = toTraysAndPieces(newTotal);

      transaction.update(bodegaRef, {
        trays: newStock.trays,
        pieces: newStock.pieces,
        lastUpdated: new Date().toISOString(),
      });
    });

    // Log the delivery record
    await addDoc(collection(db, "deliveries"), {
      eggSize: sizeId,
      trays,
      pieces,
      totalPieces: toTotalPieces(trays, pieces),
      loggedBy: userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split("T")[0],
    });

    return { success: true };
  } catch (err) {
    console.error("Delivery error:", err);
    throw err;
  }
};

// ============================================
// Action: Transfer Bodega → Tindahan
// ============================================
export const transferStock = async (sizeId, trays, pieces, userId) => {
  if (trays === 0 && pieces === 0) {
    throw new Error("Please enter at least 1 tray or 1 piece.");
  }

  const bodegaRef = doc(db, "bodegaStock", sizeId);
  const tindahanRef = doc(db, "tindahanStock", sizeId);
  const transferTotal = toTotalPieces(trays, pieces);

  try {
    await runTransaction(db, async (transaction) => {
      // Read both documents
      const bodegaDoc = await transaction.get(bodegaRef);
      const tindahanDoc = await transaction.get(tindahanRef);

      if (!bodegaDoc.exists() || !tindahanDoc.exists()) {
        throw new Error(`Egg size "${sizeId}" not found.`);
      }

      const bodegaData = bodegaDoc.data();
      const tindahanData = tindahanDoc.data();

      const bodegaTotal = toTotalPieces(bodegaData.trays, bodegaData.pieces);

      // VALIDATION: Can't transfer more than bodega has!
      if (transferTotal > bodegaTotal) {
        throw new Error(
          `Not enough stock! Bodega only has ${bodegaData.trays} trays and ${bodegaData.pieces} pieces.`
        );
      }

      // Calculate new values
      const newBodegaTotal = bodegaTotal - transferTotal;
      const newBodega = toTraysAndPieces(newBodegaTotal);

      const tindahanTotal = toTotalPieces(tindahanData.trays, tindahanData.pieces);
      const newTindahanTotal = tindahanTotal + transferTotal;
      const newTindahan = toTraysAndPieces(newTindahanTotal);

      // Update both atomically
      transaction.update(bodegaRef, {
        trays: newBodega.trays,
        pieces: newBodega.pieces,
        lastUpdated: new Date().toISOString(),
      });

      transaction.update(tindahanRef, {
        trays: newTindahan.trays,
        pieces: newTindahan.pieces,
        lastUpdated: new Date().toISOString(),
      });
    });

    // Log the transfer record
    await addDoc(collection(db, "transfers"), {
      eggSize: sizeId,
      trays,
      pieces,
      totalPieces: transferTotal,
      transferredBy: userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split("T")[0],
    });

    return { success: true };
  } catch (err) {
    console.error("Transfer error:", err);
    throw err;
  }
};