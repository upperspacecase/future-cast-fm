"use client";

import { useState, useEffect, useMemo } from "react";
import { authFetch } from "@/libs/authFetch";

const FULL_DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function getAllTimezones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["America/Los_Angeles", "America/New_York", "Europe/London", "Asia/Tokyo"];
  }
}

function formatTzLabel(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const city = tz.split("/").pop().replace(/_/g, " ");
    return `${city} (${offset})`;
  } catch {
    return tz;
  }
}

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
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `FutureCast.fm Recording - ${guestName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Podcast recording with ${guestName} for FutureCast.fm`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Get the Monday of the week containing a date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function AvailabilityTab() {
  const [allTimezones, setAllTimezones] = useState([]);
  const [timezone, setTimezone] = useState("");
  const [days, setDays] = useState(
    FULL_DAY_NAMES.map((_, i) => ({
      dayOfWeek: i,
      active: false,
      slots: [],
    }))
  );
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAllTimezones(getAllTimezones());
  }, []);

  const loadCalendar = async () => {
    try {
      const res = await authFetch("/api/admin/calendar");
      if (!res.ok) return;
      const data = await res.json();

      setCalendarSlots(data.slots || []);

      if (data.availabilities?.length > 0) {
        // Use saved timezone from DB, not browser detection
        const savedTz = data.timezone;
        if (savedTz) {
          if (!timezone) setTimezone(savedTz);
        }

        setDays((prev) =>
          prev.map((d) => {
            const match = data.availabilities.find(
              (a) => a.dayOfWeek === d.dayOfWeek
            );
            if (match) {
              return {
                ...d,
                active: match.active,
                slots: match.slots || [],
              };
            }
            return d;
          })
        );
      } else if (!timezone) {
        // No saved availability, use browser timezone as initial
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    } catch {
      if (!timezone) {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = (dayIndex) => {
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, active: !d.active } : d
      )
    );
    setSaved(false);
  };

  const addSlot = (dayIndex) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex && d.slots.length < 3) {
          return { ...d, slots: [...d.slots, "10:00"] };
        }
        return d;
      })
    );
    setSaved(false);
  };

  const updateSlot = (dayIndex, slotIndex, value) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          const newSlots = [...d.slots];
          newSlots[slotIndex] = value;
          return { ...d, slots: newSlots };
        }
        return d;
      })
    );
    setSaved(false);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          const newSlots = d.slots.filter((_, i) => i !== slotIndex);
          return { ...d, slots: newSlots };
        }
        return d;
      })
    );
    setSaved(false);
  };

  const copyToAllActive = (sourceDayIndex) => {
    const source = days.find((d) => d.dayOfWeek === sourceDayIndex);
    if (!source || source.slots.length === 0) return;
    setDays((prev) =>
      prev.map((d) =>
        d.active && d.dayOfWeek !== sourceDayIndex
          ? { ...d, slots: [...source.slots] }
          : d
      )
    );
    setSaved(false);
  };

  const removeCalendarSlot = async (calendarDate, hostTime) => {
    try {
      await authFetch("/api/admin/calendar", {
        method: "DELETE",
        body: JSON.stringify({ calendarDate, slotTime: hostTime }),
      });
      loadCalendar();
    } catch (err) {
      console.error("Failed to remove slot:", err);
    }
  };

  const restoreCalendarSlot = async (calendarDate, hostTime) => {
    try {
      await authFetch("/api/admin/calendar", {
        method: "PATCH",
        body: JSON.stringify({ calendarDate, slotTime: hostTime }),
      });
      loadCalendar();
    } catch (err) {
      console.error("Failed to restore slot:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = days.map((d) => ({
        ...d,
        timezone,
      }));
      const res = await authFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ days: payload }),
      });
      if (res.ok) {
        setSaved(true);
        loadCalendar();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Build week grid data: 4 weeks, Mon-Sun columns
  const weekGrid = useMemo(() => {
    const weeks = [];
    const today = new Date();
    let weekStart = getWeekStart(today);

    for (let w = 0; w < 4; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        // day index: Mon=1..Sun=0, but our array is Mon(0)..Sun(6)
        const dayOfWeek = date.getDay();

        const daySlots = calendarSlots.filter(
          (s) => s.calendarDate === calendarDate
        );

        week.push({
          date,
          calendarDate,
          dayOfWeek,
          dayNum: date.getDate(),
          month: date.toLocaleDateString("en-US", { month: "short" }),
          isToday:
            date.toDateString() === today.toDateString(),
          isPast: date < today && date.toDateString() !== today.toDateString(),
          slots: daySlots,
        });
      }
      weeks.push(week);
      weekStart = new Date(weekStart);
      weekStart.setDate(weekStart.getDate() + 7);
    }
    return weeks;
  }, [calendarSlots]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#FACC15] italic font-bold animate-pulse">
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <div>

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider">
            CALENDAR — {timezone ? formatTzShort(timezone) : ""}
          </h2>
          <div className="flex items-center gap-4 text-[10px] italic uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]/30 border border-[#FACC15]/40" />
              <span className="text-white/40">Open</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500/30 border border-green-500/40" />
              <span className="text-white/40">Booked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10" />
              <span className="text-white/40">Removed</span>
            </span>
          </div>
        </div>

        {/* Day headers: Mon-Sun */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-white/30 italic uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weekGrid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day) => (
              <div
                key={day.calendarDate}
                className={`border rounded-lg p-2 min-h-[80px] transition-all ${
                  day.isPast
                    ? "border-white/5 opacity-30"
                    : day.isToday
                    ? "border-[#FACC15]/40 bg-[#FACC15]/5"
                    : "border-white/10"
                }`}
              >
                <p
                  className={`text-[10px] mb-1 ${
                    day.isToday
                      ? "text-[#FACC15] font-bold"
                      : "text-white/30"
                  }`}
                >
                  {day.dayNum} {day.month}
                </p>
                <div className="space-y-1">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.date + slot.hostTime}
                      className={`rounded px-1.5 py-1 text-[10px] flex items-center justify-between gap-1 ${
                        slot.booked
                          ? "bg-green-500/20 border border-green-500/30"
                          : slot.removed
                          ? "bg-white/5 border border-white/10 line-through opacity-50"
                          : slot.dayBlocked
                          ? "bg-white/5 border border-white/10 opacity-30"
                          : "bg-[#FACC15]/10 border border-[#FACC15]/20"
                      }`}
                    >
                      <div className="min-w-0">
                        <span
                          className={`font-bold italic ${
                            slot.booked
                              ? "text-green-400"
                              : slot.removed
                              ? "text-white/30"
                              : "text-white/60"
                          }`}
                        >
                          {slot.hostTime}
                        </span>
                        {slot.booked && slot.booking && (
                          <span className="text-green-400/70 ml-1 truncate">
                            {slot.booking.guestName.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      {!day.isPast && (
                        <div className="flex-shrink-0">
                          {slot.booked && slot.booking ? (
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
                          ) : slot.removed ? (
                            <button
                              onClick={() =>
                                restoreCalendarSlot(
                                  day.calendarDate,
                                  slot.hostTime
                                )
                              }
                              className="text-[#FACC15]/50 hover:text-[#FACC15]"
                              title="Restore slot"
                            >
                              +
                            </button>
                          ) : !slot.dayBlocked ? (
                            <button
                              onClick={() =>
                                removeCalendarSlot(
                                  day.calendarDate,
                                  slot.hostTime
                                )
                              }
                              className="text-red-400/40 hover:text-red-400"
                              title="Remove this slot"
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
        ))}
      </div>

      {/* Recurring Schedule Editor */}
      <div className="max-w-2xl">
        <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider mb-3">
          RECURRING SCHEDULE
        </h2>

        {/* Timezone */}
        <div className="mb-4">
          <label className="text-white/40 text-xs italic uppercase tracking-wider block mb-1">
            Your timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setSaved(false);
            }}
            className="bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white text-sm italic focus:outline-none focus:border-[#FACC15] w-full max-w-sm"
          >
            {allTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {formatTzLabel(tz)}
              </option>
            ))}
          </select>
        </div>

        {/* Days */}
        <div className="space-y-2">
          {days.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`border rounded-xl p-3 transition-all ${
                day.active
                  ? "border-[#FACC15]/30 bg-[#FACC15]/5"
                  : "border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleDay(day.dayOfWeek)}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 transition-all ${
                      day.active
                        ? "bg-[#FACC15] border-[#FACC15]"
                        : "border-white/30"
                    }`}
                  />
                  <span className="text-white font-bold italic uppercase text-sm">
                    {FULL_DAY_NAMES[day.dayOfWeek]}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {day.active && day.slots.length > 0 && (
                    <button
                      onClick={() => copyToAllActive(day.dayOfWeek)}
                      className="text-white/30 text-[10px] font-bold italic uppercase hover:text-[#FACC15] transition-colors"
                    >
                      COPY TO ALL
                    </button>
                  )}
                  {day.active && day.slots.length < 3 && (
                    <button
                      onClick={() => addSlot(day.dayOfWeek)}
                      className="text-[#FACC15] text-xs font-bold italic uppercase hover:underline"
                    >
                      + ADD
                    </button>
                  )}
                </div>
              </div>

              {day.active && day.slots.length > 0 && (
                <div className="flex gap-2 flex-wrap ml-6 mt-2">
                  {day.slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, i, e.target.value)
                        }
                        className="bg-black border border-[#FACC15]/20 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#FACC15]"
                      />
                      <button
                        onClick={() => removeSlot(day.dayOfWeek, i)}
                        className="text-red-400/50 hover:text-red-400 text-xs px-1"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-base py-3 rounded-xl tracking-wide transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "SAVING..." : saved ? "SAVED" : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
