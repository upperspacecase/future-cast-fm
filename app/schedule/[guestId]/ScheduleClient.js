"use client";

import { useState, useEffect, useMemo } from "react";

export default function ScheduleClient({ guestId }) {
  const [slots, setSlots] = useState([]);
  const [hostTimezone, setHostTimezone] = useState("America/Los_Angeles");
  const [guestTimezone, setGuestTimezone] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detect guest timezone
  useEffect(() => {
    setGuestTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Fetch available slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch("/api/availability?weeks=2");
        const data = await res.json();
        setSlots(data.slots || []);
        if (data.timezone) setHostTimezone(data.timezone);
      } catch {
        setError("Failed to load available times");
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, []);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const groups = {};
    for (const slot of slots) {
      const date = new Date(slot.date);
      const dateKey = date.toLocaleDateString("en-US", {
        timeZone: guestTimezone || "UTC",
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    }
    return groups;
  }, [slots, guestTimezone]);

  const formatTime = (isoDate, timezone) => {
    return new Date(isoDate).toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTzShort = (timezone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || timezone;
  };

  const handleBook = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          date: selectedSlot,
          guestTimezone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      setIsBooked(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (isBooked) {
    return (
      <div className="bg-black border border-[#FACC15]/40 rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(250,204,21,0.15)]">
        <h2 className="text-3xl font-black italic text-[#FACC15] mb-4">
          LOCKED IN
        </h2>
        <p className="text-white/70 text-sm italic uppercase font-bold mb-2">
          Check your email for a calendar invite.
        </p>
        <p className="text-white/50 text-xs italic">
          {formatTime(selectedSlot, guestTimezone)} {formatTzShort(guestTimezone)} / {formatTime(selectedSlot, hostTimezone)} {formatTzShort(hostTimezone)}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black border border-[#FACC15]/40 rounded-2xl p-8 text-center">
        <p className="text-[#FACC15] italic font-bold animate-pulse">
          LOADING AVAILABLE TIMES...
        </p>
      </div>
    );
  }

  const dateKeys = Object.keys(groupedSlots);

  if (dateKeys.length === 0) {
    return (
      <div className="bg-black border border-[#FACC15]/40 rounded-2xl p-8 text-center">
        <p className="text-white/70 italic font-bold uppercase">
          No available times right now. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timezone display */}
      <div className="flex justify-between text-xs text-white/50 italic uppercase tracking-wider px-1">
        <span>Your time ({formatTzShort(guestTimezone)})</span>
        <span>Host time ({formatTzShort(hostTimezone)})</span>
      </div>

      {/* Slot groups by date */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey}>
          <h3 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider mb-3">
            {dateKey}
          </h3>
          <div className="space-y-2">
            {groupedSlots[dateKey].map((slot) => {
              const isSelected = selectedSlot === slot.date;
              return (
                <button
                  key={slot.date}
                  onClick={() => setSelectedSlot(slot.date)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#FACC15] bg-[#FACC15]/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                      : "border-[#FACC15]/20 bg-black hover:border-[#FACC15]/50"
                  }`}
                >
                  <span
                    className={`font-bold italic ${
                      isSelected ? "text-[#FACC15]" : "text-white/80"
                    }`}
                  >
                    {formatTime(slot.date, guestTimezone)}
                  </span>
                  <span className="text-white/40 text-sm italic">
                    {formatTime(slot.date, hostTimezone)} {formatTzShort(hostTimezone)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm italic text-center">{error}</p>
      )}

      {/* Book button */}
      {selectedSlot && (
        <button
          onClick={handleBook}
          disabled={isBooking}
          className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-xl py-4 rounded-xl tracking-wide transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:opacity-50"
        >
          {isBooking ? "BOOKING..." : "LOCK IT IN"}
        </button>
      )}
    </div>
  );
}
