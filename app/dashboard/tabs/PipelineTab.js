"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/libs/authFetch";
import GuestModal from "./GuestModal";
import RecordingCalendar from "./RecordingCalendar";

const COLUMNS = [
  { id: "discovered", label: "DISCOVERED", color: "border-white/20" },
  { id: "emailed", label: "EMAILED", color: "border-blue-500/30" },
  { id: "opened", label: "OPENED", color: "border-purple-500/30" },
  { id: "clicked", label: "CLICKED", color: "border-[#FACC15]/30" },
  { id: "accepted", label: "ACCEPTED", color: "border-green-500/30" },
  { id: "scheduled", label: "SCHEDULED", color: "border-green-600/30" },
  { id: "recorded", label: "RECORDED", color: "border-emerald-500/30" },
];

export default function PipelineTab() {
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);

  const fetchGuests = async () => {
    try {
      const res = await authFetch("/api/guests");
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
  }, []);

  const handleSend = async (guestId) => {
    setSendingId(guestId);
    try {
      const res = await authFetch("/api/send", {
        method: "POST",
        body: JSON.stringify({ guestId }),
      });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (guestId) => {
    try {
      const res = await authFetch("/api/guests", {
        method: "DELETE",
        body: JSON.stringify({ guestId }),
      });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = async (guestId, status) => {
    try {
      const res = await authFetch("/api/guests", {
        method: "PATCH",
        body: JSON.stringify({ guestId, status }),
      });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await authFetch("/api/admin/backfill", { method: "POST" });
      if (res.ok) fetchGuests();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const guestsByStatus = (status) =>
    guests.filter((g) => g.status === status);

  if (loading) {
    return (
      <p className="text-[#FACC15] italic font-bold animate-pulse text-center py-12">
        LOADING PIPELINE...
      </p>
    );
  }

  return (
    <div>
      {/* Sync + Stats */}
      <div className="flex justify-end mb-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-3 py-1.5 border border-[#FACC15]/20 text-white/40 rounded-lg text-[10px] font-bold italic uppercase hover:text-[#FACC15] hover:border-[#FACC15]/40 transition-all disabled:opacity-50"
        >
          {syncing ? "SYNCING..." : "SYNC WITH RESEND"}
        </button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {[
          { label: "TOTAL", value: stats.total || 0 },
          { label: "EMAILED", value: stats.emailed || 0 },
          { label: "OPEN RATE", value: `${stats.openRate || 0}%` },
          { label: "CLICK RATE", value: `${stats.clickRate || 0}%` },
          { label: "BOUNCE", value: `${stats.bounceRate || 0}%` },
          { label: "SCHEDULED", value: stats.scheduled || 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-black border border-[#FACC15]/15 rounded-lg p-3 text-center"
          >
            <p className="text-xl font-black italic text-[#FACC15]">
              {stat.value}
            </p>
            <p className="text-[9px] text-white/30 tracking-widest italic">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colGuests = guestsByStatus(col.id);
          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-56 border rounded-xl ${col.color} bg-white/[0.02]`}
            >
              {/* Column header */}
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold italic text-white/40 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold italic text-white/20">
                    {colGuests.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                {colGuests.length === 0 ? (
                  <p className="text-white/10 text-[10px] italic text-center py-4">
                    Empty
                  </p>
                ) : (
                  colGuests.map((guest) => (
                    <div
                      key={guest.id || guest._id}
                      className="bg-black border border-white/10 rounded-lg p-3 hover:border-[#FACC15]/30 transition-all cursor-pointer"
                      onClick={() => setSelectedGuest(guest)}
                    >
                      <p className="text-white font-bold text-xs truncate">
                        {guest.name}
                      </p>
                      <p className="text-white/30 text-[10px] truncate">
                        {guest.podcastName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#FACC15] text-[10px] font-black italic">
                          {guest.aiScore}
                        </span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {col.id === "discovered" && (
                            <>
                              <button
                                onClick={() =>
                                  handleSend(guest.id || guest._id)
                                }
                                disabled={
                                  sendingId === (guest.id || guest._id)
                                }
                                className="px-2 py-0.5 bg-[#FACC15] text-black rounded text-[9px] font-bold italic uppercase disabled:opacity-50"
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
                                className="px-2 py-0.5 border border-red-500/20 text-red-400/50 rounded text-[9px] font-bold italic uppercase hover:text-red-400"
                              >
                                x
                              </button>
                            </>
                          )}
                          {col.id === "scheduled" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  guest.id || guest._id,
                                  "recorded"
                                )
                              }
                              className="px-2 py-0.5 border border-green-500/20 text-green-400 rounded text-[9px] font-bold italic uppercase hover:bg-green-500/10"
                            >
                              DONE
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(guest.id || guest._id)
                            }
                            className="px-2 py-0.5 text-red-400/30 rounded text-[9px] italic hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            DEL
                          </button>
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

      {/* Recording Calendar */}
      <div className="mt-8">
        <RecordingCalendar compact />
      </div>

      {/* Guest Detail Modal */}
      {selectedGuest && (
        <GuestModal
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onSend={(id) => {
            handleSend(id);
            setSelectedGuest(null);
          }}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedGuest(null);
          }}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status);
            setSelectedGuest(null);
          }}
          sendingId={sendingId}
        />
      )}
    </div>
  );
}
