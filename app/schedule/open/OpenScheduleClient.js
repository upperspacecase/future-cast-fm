"use client";

import { useState, useEffect, useMemo } from "react";

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
  ]},
  { group: "Europe", zones: [
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
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
    { value: "Asia/Makassar", label: "Bali / Makassar (WITA)" },
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

export default function OpenScheduleClient() {
  const [slots, setSlots] = useState([]);
  const [hostTimezone, setHostTimezone] = useState("America/Los_Angeles");
  const [guestTimezone, setGuestTimezone] = useState("");
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGuestTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

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
    if (!selectedSlot || !name.trim() || !email.trim()) return;

    setIsBooking(true);
    setError(null);

    try {
      const res = await fetch("/api/book/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
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
      {/* Timezone */}
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

      {/* Slots */}
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
                  <span className={`font-bold italic ${isSelected ? "text-[#FACC15]" : "text-white/80"}`}>
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

      {error && (
        <p className="text-red-400 text-sm italic text-center">{error}</p>
      )}

      {/* Name + Email + Book */}
      {selectedSlot && (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FACC15] italic"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FACC15] italic"
          />
          <button
            onClick={handleBook}
            disabled={isBooking || !name.trim() || !email.trim()}
            className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-xl py-4 rounded-xl tracking-wide transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:opacity-50"
          >
            {isBooking ? "BOOKING..." : "LOCK IT IN"}
          </button>
        </div>
      )}
    </div>
  );
}
