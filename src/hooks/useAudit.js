import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { EGGS_PER_TRAY, EGG_SIZES, DISCREPANCY_THRESHOLD } from "../utils/constants";
import { toTotalPieces, toTraysAndPieces } from "./useInventory";

// ============================================
// Hook: Real-time Egg Prices
// ============================================
export const useEggPrices = () => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "eggSizes"), (snapshot) => {
      const data = {};
      snapshot.forEach((d) => {
        data[d.id] = { id: d.id, ...d.data() };
      });
      setPrices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { prices, loading };
};

// ============================================
// Hook: Get today's transfers (summed per size)
// ============================================
export const useTodayTransfers = () => {
  const [transfers, setTransfers] = useState({});
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const q = query(
      collection(db, "transfers"),
      where("date", "==", today)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const summed = {};
      EGG_SIZES.forEach((s) => {
        summed[s.id] = { trays: 0, pieces: 0 };
      });

      snapshot.forEach((d) => {
        const data = d.data();
        const size = data.eggSize;
        if (summed[size]) {
          summed[size].trays += data.trays || 0;
          summed[size].pieces += data.pieces || 0;
        }
      });

      setTransfers(summed);
      setLoading(false);
    });
    return () => unsub();
  }, [today]);

  return { transfers, loading };
};

// ============================================
// Hook: Get today's audit (if exists)
// ============================================
export const useTodayAudit = () => {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const docRef = doc(db, "dailyAudits", today);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setAudit({ id: snap.id, ...snap.data() });
        } else {
          setAudit(null);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [today]);

  return { audit, loading };
};

// ============================================
// Hook: Get latest audit (for opening stock)
// ============================================
export const useLatestAudit = () => {
  const [latestAudit, setLatestAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "dailyAudits"),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const first = snapshot.docs[0];
        setLatestAudit({ id: first.id, ...first.data() });
      } else {
        setLatestAudit(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { latestAudit, loading };
};

// ============================================
// Action: Submit Closing Count + Halin
// ============================================
export const submitClosingAudit = async (closingCounts, actualHalin, prices, openingStock, transfers, userId) => {
  const today = new Date().toISOString().split("T")[0];
  const perSize = {};
  let totalExpectedHalin = 0;
  let totalSoldPieces = 0;

  for (const size of EGG_SIZES) {
    const opening = openingStock[size.id] || { trays: 0, pieces: 0 };
    const transfer = transfers[size.id] || { trays: 0, pieces: 0 };
    const closing = closingCounts[size.id] || { trays: 0, pieces: 0 };
    const price = prices[size.id] || { pricePerTray: 0, pricePerPiece: 0 };

    const openingPcs = toTotalPieces(opening.trays, opening.pieces);
    const transferPcs = toTotalPieces(transfer.trays, transfer.pieces);
    const closingPcs = toTotalPieces(closing.trays, closing.pieces);
    const soldPcs = Math.max(0, openingPcs + transferPcs - closingPcs);
    const sold = toTraysAndPieces(soldPcs);

    // Expected halin for this size
    const expectedHalin = sold.trays * price.pricePerTray + sold.pieces * price.pricePerPiece;
    totalExpectedHalin += expectedHalin;
    totalSoldPieces += soldPcs;

    perSize[size.id] = {
      opening,
      transfers: transfer,
      closing,
      sold,
      soldPieces: soldPcs,
      expectedHalin,
    };
  }

  // Overall discrepancy
  const discrepancyPct = totalExpectedHalin > 0
    ? Math.abs(totalExpectedHalin - actualHalin) / totalExpectedHalin * 100
    : 0;

  const status = discrepancyPct <= DISCREPANCY_THRESHOLD ? "pending" : "flagged";

  const auditData = {
    date: today,
    status,
    countedBy: userId,
    reviewedBy: null,
    perSize,
    totalExpectedHalin,
    actualHalin,
    totalSoldPieces,
    discrepancyPct: Math.round(discrepancyPct * 100) / 100,
    adminNotes: "",
    submittedAt: new Date().toISOString(),
  };

  // Save to Firestore (overwrite if re-submitted)
  await setDoc(doc(db, "dailyAudits", today), auditData);

  return auditData;
};

// ============================================
// Action: Admin approves/flags an audit
// ============================================
export const reviewAudit = async (date, status, adminId, notes = "") => {
  await updateDoc(doc(db, "dailyAudits", date), {
    status,
    reviewedBy: adminId,
    adminNotes: notes,
    reviewedAt: new Date().toISOString(),
  });
};