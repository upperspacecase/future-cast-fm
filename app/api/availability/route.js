import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";
import DateOverride from "@/models/DateOverride";

const MIN_NOTICE_MS = 48 * 60 * 60 * 1000; // 48 hours

// GET: Public — returns only bookable slots for guests
export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const weeks = parseInt(searchParams.get("weeks") || "2", 10);

    const availabilities = await Availability.find({ active: true });

    if (availabilities.length === 0) {
      return NextResponse.json({ slots: [], timezone: "America/Los_Angeles" });
    }

    const timezone = availabilities[0]?.timezone || "America/Los_Angeles";

    const now = new Date();
    const minBookTime = new Date(now.getTime() + MIN_NOTICE_MS);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + weeks * 7);

    // Load bookings
    const bookings = await Booking.find({
      date: { $gte: now, $lte: endDate },
    });
    const bookedTimes = new Set(bookings.map((b) => b.date.toISOString()));

    // Get dates that already have a booking (one per day)
    const bookedDates = new Set();
    for (const b of bookings) {
      const dateStr = b.date.toLocaleDateString("en-CA", { timeZone: timezone });
      bookedDates.add(dateStr);
    }

    // Load date overrides
    const overrides = await DateOverride.find().lean();
    const overrideSet = new Set(
      overrides.map((o) => `${o.date}|${o.slotTime}`)
    );

    const slots = [];
    const current = new Date(now);
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvail = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
      const calendarDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      if (dayAvail && dayAvail.slots.length > 0) {
        // Skip entire day if already booked
        if (bookedDates.has(calendarDate)) {
          current.setDate(current.getDate() + 1);
          continue;
        }

        for (const timeSlot of dayAvail.slots) {
          // Skip if date override exists
          if (overrideSet.has(`${calendarDate}|${timeSlot}`)) continue;

          const [hours, minutes] = timeSlot.split(":").map(Number);
          const slotUTC = hostLocalToUTC(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
            hours,
            minutes,
            timezone
          );

          // Skip if in the past, within minimum notice, or already booked
          if (
            slotUTC > minBookTime &&
            !bookedTimes.has(slotUTC.toISOString())
          ) {
            slots.push({
              date: slotUTC.toISOString(),
              hostTime: timeSlot,
              dayOfWeek,
            });
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({ slots, timezone });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST: Update recurring availability (admin only)
export async function POST(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { days } = await req.json();

    if (!Array.isArray(days)) {
      return NextResponse.json(
        { error: "Days array is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const results = [];
    for (const day of days) {
      const result = await Availability.findOneAndUpdate(
        { dayOfWeek: day.dayOfWeek },
        {
          dayOfWeek: day.dayOfWeek,
          slots: day.slots || [],
          timezone: day.timezone || "America/Los_Angeles",
          active: day.active !== false,
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }

    return NextResponse.json({ success: true, availability: results });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

function hostLocalToUTC(year, month, day, hours, minutes, timezone) {
  const tempDate = new Date(
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`
  );
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(tempDate);
  const tzYear = parseInt(parts.find((p) => p.type === "year").value);
  const tzMonth = parseInt(parts.find((p) => p.type === "month").value) - 1;
  const tzDay = parseInt(parts.find((p) => p.type === "day").value);
  const tzHour = parseInt(parts.find((p) => p.type === "hour").value);
  const tzMinute = parseInt(parts.find((p) => p.type === "minute").value);
  const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0));
  const offsetMs = tzDate.getTime() - tempDate.getTime();
  const localAsUTC = new Date(Date.UTC(year, month, day, hours, minutes, 0));
  return new Date(localAsUTC.getTime() - offsetMs);
}
