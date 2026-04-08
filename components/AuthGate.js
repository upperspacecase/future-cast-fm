"use client";

import { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
  firebaseSignOut,
} from "@/libs/firebase";

const ALLOWED_EMAIL = "taytoddpattison@gmail.com";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email === ALLOWED_EMAIL) {
        setUser(firebaseUser);
      } else if (firebaseUser) {
        // Signed in but not authorized
        firebaseSignOut(auth);
        setError("Unauthorized. This dashboard is private.");
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#FACC15] italic font-bold animate-pulse">
          LOADING...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full bg-black border border-[#FACC15]/40 rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(250,204,21,0.15)]">
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic mb-6">
            FUTURECAST.FM
          </p>
          <h1 className="text-2xl font-black italic text-[#FACC15] mb-6">
            ADMIN
          </h1>
          {error && (
            <p className="text-red-400 text-sm italic mb-4">{error}</p>
          )}
          <button
            onClick={handleSignIn}
            className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-lg py-4 rounded-xl tracking-wide transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.4)]"
          >
            SIGN IN WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Auth header bar */}
      <div className="bg-black border-b border-[#FACC15]/10 px-6 py-2 flex items-center justify-between">
        <span className="text-white/40 text-xs italic">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="text-white/30 text-xs italic hover:text-[#FACC15] transition-colors"
        >
          SIGN OUT
        </button>
      </div>
      {children}
    </div>
  );
}
