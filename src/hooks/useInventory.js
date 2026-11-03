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

export const toTotalPieces = (trays, pieces) => trays * EGGS_PER_TRAY + pieces;

export const toTraysAndPieces = (totalPieces) => ({
  trays: Math.floor(totalPieces / EGGS_PER_TRAY),
  pieces: totalPieces % EGGS_PER_TRAY,
});

export const useBodegaStock = () => {
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "bodegaStock"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((d) => { data[d.id] = { id: d.id, ...d.data() }; });
        setStock(data);
        setLoading(false);
      },
      (err) => { setError("Cannot load bodega stock."); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return { stock, loading, error };
};

export const useTindahanStock = () => {
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tindahanStock"),
      (snapshot) => {
        const data = {};
        snapshot.forEach((d) => { data[d.id] = { id: d.id, ...d.data() }; });
        setStock(data);
        setLoading(false);
      },
      (err) => { setError("Cannot load tindahan stock."); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return { stock, loading, error };
};

export const logDelivery = async (sizeId, trays, pieces, userId) => {
  if (trays === 0 && pieces === 0) throw new Error("Enter at least 1 tray or piece.");
  const bodegaRef = doc(db, "bodegaStock", sizeId);

  await runTransaction(db, async (transaction) => {
    const bodegaDoc = await transaction.get(bodegaRef);
    if (!bodegaDoc.exists()) throw new Error(`"${sizeId}" not found.`);
    const current = bodegaDoc.data();
    const newTotal = toTotalPieces(current.trays, current.pieces) + toTotalPieces(trays, pieces);
    const newStock = toTraysAndPieces(newTotal);
    transaction.update(bodegaRef, { trays: newStock.trays, pieces: newStock.pieces, lastUpdated: new Date().toISOString() });
  });

  await addDoc(collection(db, "deliveries"), {
    eggSize: sizeId, trays, pieces, totalPieces: toTotalPieces(trays, pieces),
    loggedBy: userId, timestamp: serverTimestamp(), date: new Date().toISOString().split("T")[0],
  });
  return { success: true };
};

export const transferStock = async (sizeId, trays, pieces, userId) => {
  if (trays === 0 && pieces === 0) throw new Error("Enter at least 1 tray or piece.");
  const bodegaRef = doc(db, "bodegaStock", sizeId);
  const tindahanRef = doc(db, "tindahanStock", sizeId);
  const transferTotal = toTotalPieces(trays, pieces);

  await runTransaction(db, async (transaction) => {
    const bodegaDoc = await transaction.get(bodegaRef);
    const tindahanDoc = await transaction.get(tindahanRef);
    if (!bodegaDoc.exists() || !tindahanDoc.exists()) throw new Error(`"${sizeId}" not found.`);
    const bodegaTotal = toTotalPieces(bodegaDoc.data().trays, bodegaDoc.data().pieces);
    if (transferTotal > bodegaTotal) throw new Error(`Not enough! Bodega has ${bodegaDoc.data().trays}T ${bodegaDoc.data().pieces}p.`);
    const newBodega = toTraysAndPieces(bodegaTotal - transferTotal);
    const tData = tindahanDoc.data();
    const newTindahan = toTraysAndPieces(toTotalPieces(tData.trays, tData.pieces) + transferTotal);
    transaction.update(bodegaRef, { trays: newBodega.trays, pieces: newBodega.pieces, lastUpdated: new Date().toISOString() });
    transaction.update(tindahanRef, { trays: newTindahan.trays, pieces: newTindahan.pieces, lastUpdated: new Date().toISOString() });
  });

  await addDoc(collection(db, "transfers"), {
    eggSize: sizeId, trays, pieces, totalPieces: transferTotal,
    transferredBy: userId, timestamp: serverTimestamp(), date: new Date().toISOString().split("T")[0],
  });
  return { success: true };
};

// ============================================
// NEW: Adjust Bodega Stock Directly (Admin)
// ============================================
export const adjustBodegaStock = async (sizeId, newTrays, newPieces, reason, userId) => {
  const bodegaRef = doc(db, "bodegaStock", sizeId);

  await runTransaction(db, async (transaction) => {
    const bodegaDoc = await transaction.get(bodegaRef);
    if (!bodegaDoc.exists()) throw new Error(`"${sizeId}" not found.`);

    const old = bodegaDoc.data();
    const oldTotal = toTotalPieces(old.trays, old.pieces);
    const newTotal = toTotalPieces(newTrays, newPieces);

    transaction.update(bodegaRef, {
      trays: newTrays,
      pieces: newPieces,
      lastUpdated: new Date().toISOString(),
    });

    // Log the adjustment for audit trail
    await addDoc(collection(db, "adjustments"), {
      eggSize: sizeId,
      oldTrays: old.trays,
      oldPieces: old.pieces,
      oldTotal,
      newTrays,
      newPieces,
      newTotal,
      difference: newTotal - oldTotal,
      reason,
      adjustedBy: userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split("T")[0],
    });
  });

  return { success: true };
};