"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = [
  { id: "", label: "ALL GENRES" },
  { id: "1318", label: "TECHNOLOGY" },
  { id: "1321", label: "BUSINESS" },
  { id: "1533", label: "SCIENCE" },
  { id: "1311", label: "NEWS" },
  { id: "1304", label: "EDUCATION" },
  { id: "1324", label: "SOCIETY & CULTURE" },
  { id: "1512", label: "HEALTH & FITNESS" },
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [genreId, setGenreId] = useState("");
  const [limit, setLimit] = useState(30);
  const [scoreThreshold, setScoreThreshold] = useState(60);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          genreId: genreId || undefined,
          limit,
          scoreThreshold,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Discovery failed");
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic mb-2">
            FUTURECAST.FM
          </p>
          <h1 className="text-3xl font-black italic text-[#FACC15] tracking-tight">
            DISCOVER
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-[#FACC15]/40 text-[#FACC15] rounded-lg text-sm font-bold italic uppercase hover:bg-[#FACC15]/10 transition-all"
        >
          PIPELINE
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search podcasts (e.g., future technology optimism)"
            className="flex-1 bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FACC15] italic"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-[#FACC15] text-black font-black italic rounded-xl uppercase disabled:opacity-50 hover:bg-yellow-300 transition-all"
          >
            {isSearching ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className="bg-black border border-[#FACC15]/20 rounded-lg px-3 py-2 text-white/70 text-sm italic focus:outline-none focus:border-[#FACC15]"
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-white/40 text-xs italic uppercase tracking-wider">
              Limit:
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) =>
                setLimit(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))
              }
              className="w-16 bg-black border border-[#FACC15]/20 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/40 text-xs italic uppercase tracking-wider">
              Min Score:
            </label>
            <input
              type="number"
              value={scoreThreshold}
              onChange={(e) =>
                setScoreThreshold(
                  Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-16 bg-black border border-[#FACC15]/20 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-[#FACC15]"
            />
          </div>
        </div>
      </form>

      {/* Search Progress */}
      {isSearching && (
        <div className="border border-[#FACC15]/20 rounded-xl p-12 text-center">
          <p className="text-[#FACC15] italic font-bold animate-pulse">
            SEARCHING APPLE PODCASTS, FETCHING RSS FEEDS, SCORING WITH AI...
          </p>
          <p className="text-white/40 text-xs italic mt-2">
            This can take a minute depending on how many results
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-red-500/30 rounded-xl p-6 text-center mb-6">
          <p className="text-red-400 italic font-bold">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !isSearching && (
        <div>
          {/* Summary */}
          <div className="flex gap-4 mb-6">
            <div className="bg-black border border-green-500/30 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-black italic text-green-400">
                {results.discovered}
              </p>
              <p className="text-[10px] text-white/40 tracking-widest italic">
                ADDED
              </p>
            </div>
            <div className="bg-black border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-black italic text-white/50">
                {results.skipped}
              </p>
              <p className="text-[10px] text-white/40 tracking-widest italic">
                SKIPPED
              </p>
            </div>
          </div>

          {/* Discovered Guests */}
          {results.guests?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider mb-3">
                ADDED TO PIPELINE
              </h2>
              <div className="space-y-2">
                {results.guests.map((guest) => (
                  <div
                    key={guest.id || guest._id}
                    className="border border-[#FACC15]/20 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-bold text-sm">
                        {guest.name}
                      </p>
                      <p className="text-white/50 text-xs">
                        {guest.podcastName}
                      </p>
                      <p className="text-white/30 text-xs mt-1 italic">
                        {guest.aiReason}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#FACC15] font-black italic text-xl">
                        {guest.aiScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped */}
          {results.skippedDetails?.length > 0 && (
            <div>
              <h2 className="text-sm font-bold italic text-white/30 uppercase tracking-wider mb-3">
                SKIPPED
              </h2>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {results.skippedDetails.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs text-white/30 italic px-2 py-1"
                  >
                    <span>{s.name}</span>
                    <span>{s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
