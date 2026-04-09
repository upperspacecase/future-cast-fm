"use client";

import { useState, useEffect, useMemo } from "react";

// Common timezones grouped by region
const TIMEZONE_OPTIONS = [
  { group: "Americas", zones: [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
    { value: "America/Toronto", label: "Toronto (ET)" },
    { value: "America/Vancouver", label: "Vancouver (PT)" },
    { value: "America/Mexico_City", label: "Mexico City (CST)" },
    { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)" },
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)" },
    { value: "America/Bogota", label: "Bogota (COT)" },
  ]},
  { group: "Europe", zones: [
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
    { value: "Europe/Madrid", label: "Madrid (CET)" },
    { value: "Europe/Rome", label: "Rome (CET)" },
    { value: "Europe/Stockholm", label: "Stockholm (CET)" },
    { value: "Europe/Helsinki", label: "Helsinki (EET)" },
    { value: "Europe/Moscow", label: "Moscow (MSK)" },
    { value: "Europe/Istanbul", label: "Istanbul (TRT)" },
  ]},
  { group: "Asia & Pacific", zones: [
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Bangkok", label: "Bangkok (ICT)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Seoul", label: "Seoul (KST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "Australia/Melbourne", label: "Melbourne (AEST)" },
    { value: "Australia/Perth", label: "Perth (AWST)" },
    { value: "Pacific/Auckland", label: "Auckland (NZST)" },
  ]},
  { group: "Africa & Middle East", zones: [
    { value: "Africa/Cairo", label: "Cairo (EET)" },
    { value: "Africa/Lagos", label: "Lagos (WAT)" },
    { value: "Africa/Johannesburg", label: "Johannesburg (SAST)" },
    { value: "Africa/Nairobi", label: "Nairobi (EAT)" },
    { value: "Asia/Jerusalem", label: "Jerusalem (IST)" },
    { value: "Asia/Riyadh", label: "Riyadh (AST)" },
  ]},
];

export default function ScheduleClient({ guestId }) {
  const [slots, setSlots] = useState([]);
  const [hostTimezone, setHostTimezone] = useState("America/Los_Angeles");
  const [guestTimezone, setGuestTimezone] = useState("");
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-detect guest timezone from browser
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
          CAN&apos;T WAIT TO SPEAK
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
      {/* Timezone display + picker */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-white/50 italic uppercase tracking-wider px-1">
          <button
            onClick={() => setShowTzPicker(!showTzPicker)}
            className="flex items-center gap-1 hover:text-[#FACC15] transition-colors"
          >
            <span>Your time ({formatTzShort(guestTimezone)})</span>
            <span className="text-[10px]">CHANGE</span>
          </button>
          <span>Host time ({formatTzShort(hostTimezone)})</span>
        </div>

        {showTzPicker && (
          <select
            value={guestTimezone}
            onChange={(e) => {
              setGuestTimezone(e.target.value);
              setShowTzPicker(false);
              setSelectedSlot(null);
            }}
            className="w-full bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white text-sm italic focus:outline-none focus:border-[#FACC15]"
          >
            {TIMEZONE_OPTIONS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.zones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-6">
        {/* Slots — left side */}
        <div className="flex-1 space-y-6">
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
        </div>

        {/* Submit — right side, sticky */}
        <div className="w-52 flex-shrink-0">
          <div className="sticky top-8">
            {selectedSlot ? (
              <div className="space-y-3">
                <p className="text-[#FACC15] text-xs font-bold italic uppercase">
                  {new Date(selectedSlot).toLocaleDateString("en-US", {
                    timeZone: guestTimezone || "UTC",
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {formatTime(selectedSlot, guestTimezone)} {formatTzShort(guestTimezone)}
                </p>
                {error && (
                  <p className="text-red-400 text-xs italic">{error}</p>
                )}
                <button
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-base py-3 rounded-xl tracking-wide transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:opacity-50"
                >
                  {isBooking ? "..." : "SUBMIT"}
                </button>
              </div>
            ) : (
              <p className="text-white/20 text-xs italic uppercase">
                Select a time slot
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
