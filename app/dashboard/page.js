"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STATUS_LABELS = {
  discovered: "DISCOVERED",
  emailed: "EMAILED",
  opened: "OPENED",
  clicked: "CLICKED",
  accepted: "ACCEPTED",
  scheduled: "SCHEDULED",
  recorded: "RECORDED",
  rejected: "REJECTED",
};

const STATUS_COLORS = {
  discovered: "bg-white/10 text-white/70",
  emailed: "bg-blue-500/20 text-blue-400",
  opened: "bg-purple-500/20 text-purple-400",
  clicked: "bg-[#FACC15]/20 text-[#FACC15]",
  accepted: "bg-green-500/20 text-green-400",
  scheduled: "bg-green-600/20 text-green-300",
  recorded: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  const fetchGuests = async () => {
    try {
      const url = filter ? `/api/guests?status=${filter}` : "/api/guests";
      const res = await fetch(url);
      const data = await res.json();
      setGuests(data.guests || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to fetch guests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleSend = async (guestId) => {
    setSendingId(guestId);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (res.ok) {
        fetchGuests();
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSendingId(null);
    }
  };

  const handleStatusChange = async (guestId, status) => {
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, status }),
      });
      if (res.ok) {
        fetchGuests();
      }
    } catch (err) {
      console.error("Status update failed:", err);
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
            PIPELINE
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/discover"
            className="px-4 py-2 border border-[#FACC15]/40 text-[#FACC15] rounded-lg text-sm font-bold italic uppercase hover:bg-[#FACC15]/10 transition-all"
          >
            DISCOVER
          </Link>
          <Link
            href="/dashboard/availability"
            className="px-4 py-2 border border-[#FACC15]/40 text-[#FACC15] rounded-lg text-sm font-bold italic uppercase hover:bg-[#FACC15]/10 transition-all"
          >
            AVAILABILITY
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "DISCOVERED", value: stats.total || 0 },
          { label: "EMAILED", value: stats.emailed || 0 },
          { label: "OPEN RATE", value: `${stats.openRate || 0}%` },
          { label: "CLICK RATE", value: `${stats.clickRate || 0}%` },
          { label: "BOUNCE RATE", value: `${stats.bounceRate || 0}%` },
          { label: "SCHEDULED", value: stats.scheduled || 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-black border border-[#FACC15]/20 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-black italic text-[#FACC15]">
              {stat.value}
            </p>
            <p className="text-[10px] text-white/40 tracking-widest italic mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-lg text-xs font-bold italic uppercase transition-all ${
            filter === ""
              ? "bg-[#FACC15] text-black"
              : "border border-[#FACC15]/20 text-white/50 hover:text-[#FACC15]"
          }`}
        >
          ALL
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-lg text-xs font-bold italic uppercase transition-all ${
              filter === key
                ? "bg-[#FACC15] text-black"
                : "border border-[#FACC15]/20 text-white/50 hover:text-[#FACC15]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Guest Table */}
      {loading ? (
        <p className="text-[#FACC15] italic font-bold animate-pulse text-center py-12">
          LOADING PIPELINE...
        </p>
      ) : guests.length === 0 ? (
        <div className="border border-[#FACC15]/20 rounded-xl p-12 text-center">
          <p className="text-white/50 italic font-bold uppercase">
            No guests found.{" "}
            <Link
              href="/dashboard/discover"
              className="text-[#FACC15] underline"
            >
              Discover some
            </Link>
          </p>
        </div>
      ) : (
        <div className="border border-[#FACC15]/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FACC15]/20">
                <th className="text-left p-4 text-[10px] text-white/40 tracking-widest italic uppercase">
                  GUEST
                </th>
                <th className="text-left p-4 text-[10px] text-white/40 tracking-widest italic uppercase hidden md:table-cell">
                  PODCAST
                </th>
                <th className="text-left p-4 text-[10px] text-white/40 tracking-widest italic uppercase hidden lg:table-cell">
                  SCORE
                </th>
                <th className="text-left p-4 text-[10px] text-white/40 tracking-widest italic uppercase">
                  STATUS
                </th>
                <th className="text-right p-4 text-[10px] text-white/40 tracking-widest italic uppercase">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr
                  key={guest.id || guest._id}
                  className="border-b border-[#FACC15]/10 hover:bg-[#FACC15]/5 transition-all"
                >
                  <td className="p-4">
                    <p className="text-white font-bold text-sm">{guest.name}</p>
                    <p className="text-white/40 text-xs">{guest.email}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-white/70 text-sm">{guest.podcastName}</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[#FACC15] font-black italic">
                      {guest.aiScore}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-[10px] font-bold italic uppercase tracking-wider ${
                        STATUS_COLORS[guest.status] || "text-white/50"
                      }`}
                    >
                      {STATUS_LABELS[guest.status] || guest.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {guest.status === "discovered" && (
                        <>
                          <button
                            onClick={() => handleSend(guest.id || guest._id)}
                            disabled={sendingId === (guest.id || guest._id)}
                            className="px-3 py-1 bg-[#FACC15] text-black rounded text-xs font-bold italic uppercase disabled:opacity-50"
                          >
                            {sendingId === (guest.id || guest._id)
                              ? "..."
                              : "SEND"}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                guest.id || guest._id,
                                "rejected"
                              )
                            }
                            className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-xs font-bold italic uppercase hover:bg-red-500/10"
                          >
                            SKIP
                          </button>
                        </>
                      )}
                      {guest.status === "scheduled" && (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              guest.id || guest._id,
                              "recorded"
                            )
                          }
                          className="px-3 py-1 border border-green-500/30 text-green-400 rounded text-xs font-bold italic uppercase hover:bg-green-500/10"
                        >
                          RECORDED
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
