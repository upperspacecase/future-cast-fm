"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { authFetch } from "@/libs/authFetch";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

export default function AvailabilityPage() {
  const [allTimezones, setAllTimezones] = useState([]);
  const [timezone, setTimezone] = useState("");
  const [days, setDays] = useState(
    DAY_NAMES.map((_, i) => ({
      dayOfWeek: i,
      active: false,
      slots: [],
    }))
  );
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load timezone list + detect
  useEffect(() => {
    setAllTimezones(getAllTimezones());
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Load existing availability + calendar from DB
  const loadCalendar = async () => {
    try {
      const res = await authFetch("/api/admin/calendar");
      if (!res.ok) return;
      const data = await res.json();

      setCalendarSlots(data.slots || []);

      if (data.availabilities?.length > 0) {
        const tz = data.timezone || timezone;
        if (tz) setTimezone(tz);

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
      }
    } catch {
      // First time, no availability set
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timezone) loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone]);

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

  const removeCalendarSlot = async (dayOfWeek, hostTime) => {
    try {
      await authFetch("/api/admin/calendar", {
        method: "DELETE",
        body: JSON.stringify({ dayOfWeek, slotTime: hostTime }),
      });
      // Refresh
      loadCalendar();
      // Also update local days state
      setDays((prev) =>
        prev.map((d) => {
          if (d.dayOfWeek === dayOfWeek) {
            return { ...d, slots: d.slots.filter((s) => s !== hostTime) };
          }
          return d;
        })
      );
    } catch (err) {
      console.error("Failed to remove slot:", err);
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

  // Group calendar slots by date for the calendar view
  const calendarByDate = useMemo(() => {
    const groups = {};
    for (const slot of calendarSlots) {
      const d = new Date(slot.date);
      const dateKey = d.toLocaleDateString("en-US", {
        timeZone: timezone || "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    }
    return groups;
  }, [calendarSlots, timezone]);

  const calendarDates = Object.keys(calendarByDate);

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
    <div className="min-h-screen bg-black p-6 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic mb-2">
            FUTURECAST.FM
          </p>
          <h1 className="text-3xl font-black italic text-[#FACC15] tracking-tight">
            AVAILABILITY
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-[#FACC15]/40 text-[#FACC15] rounded-lg text-sm font-bold italic uppercase hover:bg-[#FACC15]/10 transition-all"
        >
          PIPELINE
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Set recurring availability */}
        <div>
          <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider mb-4">
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
              className="bg-black border border-[#FACC15]/30 rounded-xl px-4 py-3 text-white text-sm italic focus:outline-none focus:border-[#FACC15] w-full"
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
                      {DAY_NAMES[day.dayOfWeek]}
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

        {/* Right: Calendar view */}
        <div>
          <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider mb-4">
            UPCOMING SLOTS — NEXT 4 WEEKS
          </h2>

          {calendarDates.length === 0 ? (
            <div className="border border-[#FACC15]/10 rounded-xl p-8 text-center">
              <p className="text-white/30 italic text-sm uppercase">
                No slots set. Configure your recurring schedule and save.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {calendarDates.map((dateKey) => (
                <div key={dateKey}>
                  <h3 className="text-xs font-bold italic text-white/40 uppercase tracking-wider mb-1.5">
                    {dateKey}
                  </h3>
                  <div className="space-y-1.5">
                    {calendarByDate[dateKey].map((slot) => (
                      <div
                        key={slot.date}
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-all ${
                          slot.booked
                            ? "border-green-500/40 bg-green-500/10"
                            : "border-[#FACC15]/15 bg-[#FACC15]/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold italic text-sm ${
                              slot.booked ? "text-green-400" : "text-white/70"
                            }`}
                          >
                            {slot.hostTime}
                          </span>
                          <span className="text-white/30 text-xs italic">
                            {formatTzShort(timezone)}
                          </span>
                          {slot.booked && (
                            <span className="text-green-400 text-xs font-bold italic uppercase">
                              {slot.booking.guestName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.booked ? (
                            <a
                              href={generateGoogleCalendarUrl({
                                guestName: slot.booking.guestName,
                                date: slot.date,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 text-[10px] font-bold italic uppercase hover:underline"
                            >
                              ADD TO CALENDAR
                            </a>
                          ) : (
                            <button
                              onClick={() =>
                                removeCalendarSlot(slot.dayOfWeek, slot.hostTime)
                              }
                              className="text-red-400/40 text-[10px] font-bold italic uppercase hover:text-red-400 transition-colors"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
