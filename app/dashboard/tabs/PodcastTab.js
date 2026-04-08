"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/libs/authFetch";

const GOAL = 100;
const YEAR = 2026;

const COLUMNS = [
  { id: "planned", label: "PLANNED" },
  { id: "scheduled", label: "SCHEDULED" },
  { id: "recorded", label: "RECORDED" },
  { id: "edited", label: "EDITED" },
  { id: "published", label: "PUBLISHED" },
];

const NEXT_STATUS = {
  planned: "scheduled",
  scheduled: "recorded",
  recorded: "edited",
  edited: "published",
};

const PREV_STATUS = {
  scheduled: "planned",
  recorded: "scheduled",
  edited: "recorded",
  published: "edited",
};

export default function PodcastTab() {
  const [episodes, setEpisodes] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newGuest, setNewGuest] = useState("");

  const fetchEpisodes = async () => {
    try {
      const res = await authFetch("/api/episodes");
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setCounts(data.counts || {});
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newGuest.trim()) return;
    try {
      await authFetch("/api/episodes", {
        method: "POST",
        body: JSON.stringify({ guestName: newGuest.trim() }),
      });
      setNewGuest("");
      setShowAdd(false);
      fetchEpisodes();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const moveEpisode = async (episodeId, newStatus) => {
    try {
      await authFetch("/api/episodes", {
        method: "PATCH",
        body: JSON.stringify({ episodeId, status: newStatus }),
      });
      fetchEpisodes();
    } catch (err) {
      console.error("Move failed:", err);
    }
  };

  const episodesByStatus = (status) =>
    episodes.filter((e) => e.status === status);

  const published = counts.published || 0;
  const now = new Date();
  const daysLeft = Math.ceil(
    (new Date(`${YEAR}-12-31`) - now) / (1000 * 60 * 60 * 24)
  );
  const remaining = GOAL - published;
  const perWeek =
    daysLeft > 0 ? (remaining / (daysLeft / 7)).toFixed(1) : "0";
  const progress = Math.round((published / GOAL) * 100);

  if (loading) {
    return (
      <p className="text-[#FACC15] italic font-bold animate-pulse text-center py-12">
        LOADING...
      </p>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-4xl font-black italic text-[#FACC15]">
              {published}
            </span>
            <span className="text-white/30 text-lg italic ml-1">/ {GOAL}</span>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs italic">
              {remaining} remaining -- {perWeek}/week needed
            </p>
            <p className="text-white/20 text-[10px] italic">
              {daysLeft} days left in {YEAR}
            </p>
          </div>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-white/20 text-[10px] italic mt-1 text-right">
          {progress}%
        </p>
      </div>

      {/* Add episode */}
      <div className="mb-4">
        {showAdd ? (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newGuest}
              onChange={(e) => setNewGuest(e.target.value)}
              placeholder="Guest name"
              autoFocus
              className="flex-1 bg-black border border-[#FACC15]/30 rounded-lg px-3 py-2 text-white text-sm italic placeholder:text-white/20 focus:outline-none focus:border-[#FACC15]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FACC15] text-black rounded-lg text-xs font-bold italic uppercase"
            >
              ADD
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setNewGuest("");
              }}
              className="px-3 py-2 text-white/30 text-xs italic hover:text-white/60"
            >
              CANCEL
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="text-[#FACC15] text-xs font-bold italic uppercase hover:underline"
          >
            + ADD EPISODE
          </button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colEpisodes = episodesByStatus(col.id);
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-52 border border-white/10 rounded-xl bg-white/[0.02]"
            >
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold italic text-white/40 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold italic text-white/20">
                    {colEpisodes.length}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-2 max-h-[50vh] overflow-y-auto">
                {colEpisodes.length === 0 ? (
                  <p className="text-white/10 text-[10px] italic text-center py-4">
                    Empty
                  </p>
                ) : (
                  colEpisodes.map((ep) => (
                    <div
                      key={ep.id || ep._id}
                      className="bg-black border border-white/10 rounded-lg p-3 hover:border-[#FACC15]/30 transition-all"
                    >
                      <p className="text-white font-bold text-xs truncate">
                        {ep.guestName}
                      </p>
                      {ep.title && (
                        <p className="text-white/30 text-[10px] truncate">
                          {ep.title}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Move back */}
                        <div>
                          {PREV_STATUS[col.id] && (
                            <button
                              onClick={() =>
                                moveEpisode(
                                  ep.id || ep._id,
                                  PREV_STATUS[col.id]
                                )
                              }
                              className="text-white/20 text-[10px] italic hover:text-white/50"
                            >
                              &larr;
                            </button>
                          )}
                        </div>
                        {/* Move forward */}
                        <div>
                          {NEXT_STATUS[col.id] && (
                            <button
                              onClick={() =>
                                moveEpisode(
                                  ep.id || ep._id,
                                  NEXT_STATUS[col.id]
                                )
                              }
                              className="px-2 py-0.5 bg-[#FACC15]/10 text-[#FACC15] rounded text-[9px] font-bold italic uppercase hover:bg-[#FACC15]/20"
                            >
                              {NEXT_STATUS[col.id].toUpperCase()} &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
