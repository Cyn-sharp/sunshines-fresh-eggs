import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import { EGG_SIZES } from "../utils/constants";

const RESET_HOUR = 17; // 5:00 PM

export const useDailyReset = () => {
  const [lastReset, setLastReset] = useState(null);
  const [justReset, setJustReset] = useState(false);

  useEffect(() => {
    const checkAndReset = async () => {
      try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const settingsRef = doc(db, "settings", "dailyReset");
        const snap = await getDoc(settingsRef);

        const alreadyResetToday = snap.exists() && snap.data().lastResetDate === today;

        if (snap.exists()) {
          setLastReset(snap.data().lastResetDate);
        }

        // If past 5 PM and not yet reset today
        if (now.getHours() >= RESET_HOUR && !alreadyResetToday) {
          const batch = writeBatch(db);
          EGG_SIZES.forEach((size) => {
            const ref = doc(db, "tindahanStock", size.id);
            batch.set(ref, { trays: 0, pieces: 0, lastUpdated: now.toISOString() }, { merge: true });
          });
          await batch.commit();

          await setDoc(settingsRef, {
            lastResetDate: today,
            resetAt: now.toISOString(),
          });

          setLastReset(today);
          setJustReset(true);
          setTimeout(() => setJustReset(false), 5000);
        }
      } catch (err) {
        console.error("Daily reset error:", err);
      }
    };

    checkAndReset();
    const interval = setInterval(checkAndReset, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  return { lastReset, justReset };
};