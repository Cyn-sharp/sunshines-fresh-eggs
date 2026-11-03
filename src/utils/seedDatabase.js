// src/utils/seedDatabase.js
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { EGG_SIZES } from "./constants";

/**
 * SEED FUNCTION — Run this ONCE to set up the database.
 * 
 * HOW TO USE:
 * 1. Open your browser's Developer Console (F12)
 * 2. Import and call this function
 * OR
 * 3. Temporarily call it from a component (see instructions below)
 */

export const seedDatabase = async (adminUid, adminName, adminEmail) => {
  try {
    console.log("🌱 Starting database seed...");

    // 1. Create Admin user document
    await setDoc(doc(db, "users", adminUid), {
      name: adminName,
      email: adminEmail,
      role: "admin",
      phone: "",
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Admin user created");

    // 2. Create egg sizes with default prices (0 = not set yet)
    for (const size of EGG_SIZES) {
      await setDoc(doc(db, "eggSizes", size.id), {
        name: size.name,
        short: size.short,
        pricePerTray: 0,
        pricePerPiece: 0,
      });
    }
    console.log("✅ Egg sizes created");

    // 3. Initialize empty bodega stock
    for (const size of EGG_SIZES) {
      await setDoc(doc(db, "bodegaStock", size.id), {
        trays: 0,
        pieces: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    console.log("✅ Bodega stock initialized");

    // 4. Initialize empty tindahan stock
    for (const size of EGG_SIZES) {
      await setDoc(doc(db, "tindahanStock", size.id), {
        trays: 0,
        pieces: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    console.log("✅ Tindahan stock initialized");

    console.log("🎉 Database seed complete!");
    return true;
  } catch (error) {
    console.error("❌ Seed failed:", error);
    return false;
  }
};

/**
 * Helper: Seed a tindero user
 * Call this for each employee
 */
export const seedTindero = async (tinderoUid, tinderoName, tinderoEmail) => {
  try {
    await setDoc(doc(db, "users", tinderoUid), {
      name: tinderoName,
      email: tinderoEmail,
      role: "tindero",
      phone: "",
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Tindero "${tinderoName}" created`);
    return true;
  } catch (error) {
    console.error("❌ Failed to create tindero:", error);
    return false;
  }
};