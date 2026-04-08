import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";

// GET: Fetch availability (public for schedule page, returns open slots)
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

    // Build available slots for the next N weeks
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + weeks * 7);

    // Get all existing bookings in this range
    const existingBookings = await Booking.find({
      date: { $gte: now, $lte: endDate },
    });
    const bookedTimes = new Set(
      existingBookings.map((b) => b.date.toISOString())
    );

    const slots = [];
    const current = new Date(now);
    // Start from tomorrow
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvailability = availabilities.find(
        (a) => a.dayOfWeek === dayOfWeek
      );

      if (dayAvailability && dayAvailability.slots.length > 0) {
        for (const timeSlot of dayAvailability.slots) {
          const [hours, minutes] = timeSlot.split(":").map(Number);

          // Convert host local time to UTC
          const slotUTC = hostLocalToUTC(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
            hours,
            minutes,
            timezone
          );

          // Skip if already booked or in the past
          if (
            slotUTC > now &&
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

// POST: Update availability (admin only)
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    // Upsert each day
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

/**
 * Convert a date/time in a host timezone to UTC
 */
function hostLocalToUTC(year, month, day, hours, minutes, timezone) {
  // Create a date string and parse it relative to the timezone
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  // Get the UTC offset for this timezone at this date
  const tempDate = new Date(dateStr + "Z");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  // Use the offset approach: format the UTC date in the target timezone,
  // find the difference, and apply it
  const parts = formatter.formatToParts(tempDate);
  const tzYear = parseInt(parts.find((p) => p.type === "year").value);
  const tzMonth = parseInt(parts.find((p) => p.type === "month").value) - 1;
  const tzDay = parseInt(parts.find((p) => p.type === "day").value);
  const tzHour = parseInt(parts.find((p) => p.type === "hour").value);
  const tzMinute = parseInt(parts.find((p) => p.type === "minute").value);

  const tzDate = new Date(
    Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0)
  );
  const offsetMs = tzDate.getTime() - tempDate.getTime();

  // The actual UTC time is the local time minus the offset
  const localAsUTC = new Date(
    Date.UTC(year, month, day, hours, minutes, 0)
  );
  return new Date(localAsUTC.getTime() - offsetMs);
}
