"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/libs/authFetch";
import RecordingCalendar from "./RecordingCalendar";

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAllTimezones(getAllTimezones());
  }, []);

  // Load existing availability from DB
  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch("/api/admin/calendar?weeks=1");
        if (!res.ok) return;
        const data = await res.json();

        if (data.availabilities?.length > 0) {
          const savedTz = data.timezone;
          if (savedTz) setTimezone(savedTz);

          setDays((prev) =>
            prev.map((d) => {
              const match = data.availabilities.find(
                (a) => a.dayOfWeek === d.dayOfWeek
              );
              if (match) {
                return { ...d, active: match.active, slots: match.slots || [] };
              }
              return d;
            })
          );
        } else {
          setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      } catch {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } finally {
        setLoading(false);
      }
    }
    load();
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
          return { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) };
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = days.map((d) => ({ ...d, timezone }));
      const res = await authFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ days: payload }),
      });
      if (res.ok) {
        setSaved(true);
        // Reload the shared calendar
        if (typeof window !== "undefined" && window.__reloadCalendar) {
          window.__reloadCalendar();
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#FACC15] italic font-bold animate-pulse">
          LOADING...
        </p>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://futurecast.fm/schedule/open");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Booking link */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-xs italic">
          https://futurecast.fm/schedule/open
        </p>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 border border-[#FACC15]/20 text-white/40 rounded-lg text-[10px] font-bold italic uppercase hover:text-[#FACC15] hover:border-[#FACC15]/40 transition-all"
        >
          {copied ? "COPIED" : "COPY BOOKING LINK"}
        </button>
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <RecordingCalendar />
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
