// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbError, setDbError] = useState(""); // NEW: track database errors

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setDbError("");

        // Try to fetch user profile with retry logic
        let retries = 3;
        let profileFetched = false;

        while (retries > 0 && !profileFetched) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
              setUserProfile(userDoc.data());
              profileFetched = true;
              setDbError("");
            } else {
              // User exists in Auth but NOT in Firestore
              // This means the seed script wasn't run!
              console.warn("⚠️ User document not found in Firestore!");
              console.warn("Did you run the seed script? Go to /setup");
              setUserProfile(null);
              setDbError(
                "Your account exists but has no profile. " +
                "Please contact the admin or run the setup."
              );
              profileFetched = true; // Don't retry — the doc just doesn't exist
            }
          } catch (err) {
            retries--;
            console.error(
              `❌ Firestore error (${retries} retries left):`,
              err.message
            );

            if (retries === 0) {
              // All retries failed — likely ad blocker or network issue
              setUserProfile(null);
              setDbError(
                "Cannot connect to the database. " +
                "Please disable your ad blocker and refresh."
              );
            } else {
              // Wait 1 second before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setDbError("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError("");
    setDbError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      let message = "Login failed. Please try again.";
      if (err.code === "auth/user-not-found")
        message = "No account found with this email.";
      if (err.code === "auth/wrong-password")
        message = "Incorrect password.";
      if (err.code === "auth/invalid-email")
        message = "Invalid email format.";
      if (err.code === "auth/invalid-credential")
        message = "Invalid email or password.";
      if (err.code === "auth/too-many-requests")
        message = "Too many attempts. Try again later.";
      if (err.code === "auth/network-request-failed")
        message = "Network error. Check your internet connection.";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    setError("");
    setDbError("");
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole: userProfile?.role || null,
    loading,
    error,
    dbError,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};