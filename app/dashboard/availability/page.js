"use client";

import { useState, useEffect } from "react";
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

const DEFAULT_TIMEZONE = "America/Los_Angeles";

const PRESET_SCHEDULES = [
  { label: "WEEKDAYS ONLY", days: [1, 2, 3, 4, 5] },
  { label: "MON / WED / FRI", days: [1, 3, 5] },
  { label: "TUE / THU", days: [2, 4] },
  { label: "EVERY DAY", days: [0, 1, 2, 3, 4, 5, 6] },
];

const PRESET_TIMES = [
  { label: "MORNING", slots: ["09:00"] },
  { label: "AFTERNOON", slots: ["14:00"] },
  { label: "EVENING", slots: ["18:00"] },
  { label: "MORNING + AFTERNOON", slots: ["09:00", "14:00"] },
  { label: "MORNING + AFTERNOON + EVENING", slots: ["09:00", "14:00", "18:00"] },
];

export default function AvailabilityPage() {
  const [days, setDays] = useState(
    DAY_NAMES.map((_, i) => ({
      dayOfWeek: i,
      active: i >= 1 && i <= 5,
      slots: [],
      timezone: DEFAULT_TIMEZONE,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing availability on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/availability?weeks=0");
        const data = await res.json();
        if (data.timezone) {
          setLoaded(true);
        }
      } catch {
        // Use defaults
      }
    }
    load();
  }, []);

  const applyDayPreset = (activeDays) => {
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        active: activeDays.includes(d.dayOfWeek),
      }))
    );
    setSaved(false);
  };

  const applyTimePreset = (presetSlots) => {
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        slots: d.active ? [...presetSlots] : d.slots,
      }))
    );
    setSaved(false);
  };

  const applyToAll = (sourceDayIndex) => {
    const source = days.find((d) => d.dayOfWeek === sourceDayIndex);
    if (!source) return;
    setDays((prev) =>
      prev.map((d) =>
        d.active ? { ...d, slots: [...source.slots] } : d
      )
    );
    setSaved(false);
  };

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

  const clearAll = () => {
    setDays((prev) =>
      prev.map((d) => ({ ...d, slots: [], active: false }))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ days }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Count active days with slots for the summary
  const activeDaysWithSlots = days.filter(
    (d) => d.active && d.slots.length > 0
  ).length;
  const totalSlots = days
    .filter((d) => d.active)
    .reduce((sum, d) => sum + d.slots.length, 0);

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

      <div className="max-w-2xl">
        {/* Quick Setup */}
        <div className="border border-[#FACC15]/20 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-bold italic text-[#FACC15] uppercase tracking-wider">
            QUICK SETUP
          </h2>

          {/* Day presets */}
          <div>
            <p className="text-white/40 text-xs italic uppercase tracking-wider mb-2">
              Which days?
            </p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_SCHEDULES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyDayPreset(preset.days)}
                  className="px-3 py-1.5 border border-[#FACC15]/20 text-white/60 rounded-lg text-xs font-bold italic uppercase hover:border-[#FACC15] hover:text-[#FACC15] transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time presets */}
          <div>
            <p className="text-white/40 text-xs italic uppercase tracking-wider mb-2">
              Apply times to all active days
            </p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyTimePreset(preset.slots)}
                  className="px-3 py-1.5 border border-[#FACC15]/20 text-white/60 rounded-lg text-xs font-bold italic uppercase hover:border-[#FACC15] hover:text-[#FACC15] transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-white/50 text-sm italic uppercase">
            {activeDaysWithSlots} days, {totalSlots} slots per week -- Pacific Time (PT)
          </p>
          <button
            onClick={clearAll}
            className="text-red-400/50 text-xs font-bold italic uppercase hover:text-red-400 transition-colors"
          >
            CLEAR ALL
          </button>
        </div>

        {/* Days */}
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`border rounded-xl p-4 transition-all ${
                day.active
                  ? "border-[#FACC15]/30 bg-[#FACC15]/5"
                  : "border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggleDay(day.dayOfWeek)}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 transition-all ${
                      day.active
                        ? "bg-[#FACC15] border-[#FACC15]"
                        : "border-white/30"
                    }`}
                  />
                  <span className="text-white font-bold italic uppercase">
                    {DAY_NAMES[day.dayOfWeek]}
                  </span>
                </button>
                <div className="flex items-center gap-3">
                  {day.active && day.slots.length > 0 && (
                    <button
                      onClick={() => applyToAll(day.dayOfWeek)}
                      className="text-white/30 text-[10px] font-bold italic uppercase hover:text-[#FACC15] transition-colors tracking-wider"
                    >
                      APPLY TO ALL
                    </button>
                  )}
                  {day.active && day.slots.length < 3 && (
                    <button
                      onClick={() => addSlot(day.dayOfWeek)}
                      className="text-[#FACC15] text-xs font-bold italic uppercase hover:underline"
                    >
                      + ADD SLOT
                    </button>
                  )}
                </div>
              </div>

              {day.active && day.slots.length > 0 && (
                <div className="flex gap-2 flex-wrap ml-7">
                  {day.slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, i, e.target.value)
                        }
                        className="bg-black border border-[#FACC15]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FACC15]"
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

              {day.active && day.slots.length === 0 && (
                <p className="text-white/30 text-xs italic ml-7">
                  No slots -- click + ADD SLOT or use quick setup above
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#FACC15] hover:bg-yellow-300 text-black font-black italic text-lg py-4 rounded-xl tracking-wide transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "SAVING..." : saved ? "SAVED" : "SAVE AVAILABILITY"}
          </button>
        </div>
      </div>
    </div>
  );
}
