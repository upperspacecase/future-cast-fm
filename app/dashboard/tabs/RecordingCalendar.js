"use client";

import { useState, useEffect, useMemo } from "react";
import { authFetch } from "@/libs/authFetch";

function formatTzShort(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || tz;
  } catch {
    return tz;
  }
}

function generateGoogleCalendarUrl({ guestName, date, durationMinutes = 60 }) {
  const start = new Date(date);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `FutureCast.fm Recording - ${guestName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Podcast recording with ${guestName} for FutureCast.fm\n\nJoin: https://riverside.com/studio/tay-pattisons-studio-LUhKY?t=6473b6bbef5845aa4ed2`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function RecordingCalendar({ compact = false, onRemoveSlot, onRestoreSlot }) {
  const [slots, setSlots] = useState([]);
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);

  const loadSlots = async () => {
    try {
      const res = await authFetch("/api/admin/calendar?weeks=16");
      if (!res.ok) return;
      const data = await res.json();
      setSlots(data.slots || []);
      if (data.timezone) setTimezone(data.timezone);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose reload for parent
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__reloadCalendar = loadSlots;
    }
  }, []);

  const handleRemove = async (calendarDate, hostTime) => {
    if (onRemoveSlot) {
      await onRemoveSlot(calendarDate, hostTime);
    } else {
      try {
        await authFetch("/api/admin/calendar", {
          method: "DELETE",
          body: JSON.stringify({ calendarDate, slotTime: hostTime }),
        });
      } catch { /* ignore */ }
    }
    loadSlots();
  };

  const handleRestore = async (calendarDate, hostTime) => {
    if (onRestoreSlot) {
      await onRestoreSlot(calendarDate, hostTime);
    } else {
      try {
        await authFetch("/api/admin/calendar", {
          method: "PATCH",
          body: JSON.stringify({ calendarDate, slotTime: hostTime }),
        });
      } catch { /* ignore */ }
    }
    loadSlots();
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await authFetch("/api/book", {
        method: "DELETE",
        body: JSON.stringify({ bookingId }),
      });
      loadSlots();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  // Build month calendar
  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday of the week containing the 1st
    const startDay = new Date(firstDay);
    const dow = startDay.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    startDay.setDate(startDay.getDate() + diff);

    const days = [];
    const current = new Date(startDay);

    // Always show 6 weeks for consistent grid
    for (let i = 0; i < 42; i++) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === now.toDateString();
      const isPast = current < now && !isToday;

      const daySlots = slots.filter((s) => s.calendarDate === dateStr);

      days.push({
        date: new Date(current),
        dateStr,
        dayNum: current.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        slots: daySlots,
      });

      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [year, month, slots]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#FACC15] italic font-bold animate-pulse text-sm">
          LOADING CALENDAR...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthOffset(monthOffset - 1)}
          className="text-white/30 hover:text-[#FACC15] text-sm px-2 transition-colors"
        >
          &larr;
        </button>
        <h3 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider">
          {MONTH_NAMES[month]} {year}
          {timezone ? ` -- ${formatTzShort(timezone)}` : ""}
        </h3>
        <button
          onClick={() => setMonthOffset(monthOffset + 1)}
          className="text-white/30 hover:text-[#FACC15] text-sm px-2 transition-colors"
        >
          &rarr;
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-white/30 italic uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={`${compact ? "min-h-[60px]" : "min-h-[80px]"} p-1.5 transition-all ${
              !day.isCurrentMonth
                ? "bg-black/50 opacity-30"
                : day.isToday
                ? "bg-[#FACC15]/5"
                : day.isPast
                ? "bg-black opacity-40"
                : "bg-black"
            }`}
          >
            <p
              className={`text-[10px] mb-1 ${
                day.isToday
                  ? "text-[#FACC15] font-bold"
                  : "text-white/30"
              }`}
            >
              {day.dayNum}
            </p>
            <div className="space-y-0.5">
              {day.slots.map((slot) => (
                <div
                  key={slot.date + slot.hostTime}
                  className={`rounded px-1 py-0.5 text-[9px] flex items-center justify-between ${
                    slot.booked
                      ? "bg-green-500/20 border border-green-500/30"
                      : slot.removed
                      ? "bg-white/5 border border-white/5 line-through opacity-40"
                      : slot.dayBlocked
                      ? "bg-white/5 border border-white/5 opacity-20"
                      : "bg-[#FACC15]/10 border border-[#FACC15]/15"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-1">
                    <span
                      className={`font-bold italic ${
                        slot.booked ? "text-green-400" : slot.removed ? "text-white/20" : "text-white/50"
                      }`}
                    >
                      {slot.hostTime}
                    </span>
                    {slot.booked && slot.booking && (
                      <span className="text-green-400/70 truncate">
                        {slot.booking.guestName.split(" ")[0]}
                      </span>
                    )}
                  </div>
                  {!day.isPast && day.isCurrentMonth && (
                    <div className="flex-shrink-0 ml-1">
                      {slot.booked && slot.booking ? (
                        <div className="flex items-center gap-1">
                          <a
                            href={generateGoogleCalendarUrl({
                              guestName: slot.booking.guestName,
                              date: slot.date,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300"
                            title="Add to Google Calendar"
                          >
                            +
                          </a>
                          <button
                            onClick={() => handleCancelBooking(slot.booking.bookingId)}
                            className="text-red-400/30 hover:text-red-400"
                            title="Cancel booking"
                          >
                            x
                          </button>
                        </div>
                      ) : slot.removed ? (
                        <button
                          onClick={() => handleRestore(day.dateStr, slot.hostTime)}
                          className="text-[#FACC15]/40 hover:text-[#FACC15]"
                          title="Restore"
                        >
                          +
                        </button>
                      ) : !slot.dayBlocked ? (
                        <button
                          onClick={() => handleRemove(day.dateStr, slot.hostTime)}
                          className="text-red-400/30 hover:text-red-400"
                          title="Remove"
                        >
                          x
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex items-center gap-4 mt-2 justify-end">
          <span className="flex items-center gap-1 text-[9px] italic text-white/30">
            <span className="w-2 h-2 rounded-sm bg-[#FACC15]/20 border border-[#FACC15]/30" />
            Open
          </span>
          <span className="flex items-center gap-1 text-[9px] italic text-white/30">
            <span className="w-2 h-2 rounded-sm bg-green-500/20 border border-green-500/30" />
            Booked
          </span>
          <span className="flex items-center gap-1 text-[9px] italic text-white/30">
            <span className="w-2 h-2 rounded-sm bg-white/5 border border-white/10" />
            Removed
          </span>
        </div>
      )}
    </div>
  );
}
