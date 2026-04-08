"use client";

import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* The Card */}
      <div className="max-w-md w-full bg-black border border-[#FACC15]/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(250,204,21,0.15)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic">
            FUTURECAST.FM
          </p>
        </div>

        {/* Title */}
        <div className="px-6 py-4">
          <h1 className="text-4xl font-black italic text-[#FACC15] leading-[0.95] tracking-tight">
            WANT THIS FOR YOUR POD&#63;
          </h1>
        </div>

        {/* Description */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-white/90 leading-relaxed text-base uppercase italic font-bold">
            AI-powered guest discovery. One-click outreach. Automated
            scheduling. All in your brand.
          </p>
          <div className="border-l-4 border-[#FACC15] bg-[#FACC15]/10 px-4 py-3 rounded-r-lg">
            <p className="text-[#FACC15] leading-relaxed text-base uppercase italic font-bold">
              Drop your email and we&apos;ll build one for your podcast.
            </p>
          </div>
        </div>

        {/* Form or Success */}
        <div className="px-6 pb-6 pt-2">
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-[#FACC15] font-black italic text-xl mb-2">
                YOU&apos;RE IN
              </p>
              <p className="text-white/50 text-xs italic">
                We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FACC15] italic"
              />
              {error && (
                <p className="text-red-400 text-xs italic">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-xl py-4 rounded-xl tracking-wide transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? "..." : "I WANT THIS"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#FACC15]/20 px-6 py-3 text-center">
          <p className="text-white/40 text-xs italic tracking-widest">
            TAY &middot; FUTURECAST.FM
          </p>
        </div>
      </div>
    </div>
  );
}
