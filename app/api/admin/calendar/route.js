import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";
import DateOverride from "@/models/DateOverride";

const MIN_NOTICE_MS = 48 * 60 * 60 * 1000; // 48 hours

// GET: Full calendar for admin — slots, bookings, overrides for next 4 weeks
export async function GET(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const availabilities = await Availability.find();
    const timezone =
      availabilities.find((a) => a.active)?.timezone || "America/Los_Angeles";

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 28);

    // Load bookings
    const bookings = await Booking.find({
      date: { $gte: now, $lte: endDate },
    }).lean();

    // Map bookings by ISO date string AND by calendar date (YYYY-MM-DD in host tz)
    const bookedByIso = {};
    const bookedDates = new Set();
    for (const b of bookings) {
      bookedByIso[b.date.toISOString()] = {
        guestName: b.guestName,
        guestEmail: b.guestEmail,
        guestTimezone: b.guestTimezone,
        bookingId: b._id.toString(),
        guestId: b.guestId.toString(),
      };
      // Get the calendar date in host timezone
      const dateStr = b.date.toLocaleDateString("en-CA", { timeZone: timezone });
      bookedDates.add(dateStr);
    }

    // Load date overrides
    const overrides = await DateOverride.find().lean();
    const overrideSet = new Set(
      overrides.map((o) => `${o.date}|${o.slotTime}`)
    );

    // Build slots
    const slots = [];
    const current = new Date(now);
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvail = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
      const calendarDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      if (dayAvail && dayAvail.active && dayAvail.slots.length > 0) {
        // Check if this date already has a booking (one per day rule)
        const dayIsBooked = bookedDates.has(calendarDate);

        for (const timeSlot of dayAvail.slots) {
          const [hours, minutes] = timeSlot.split(":").map(Number);
          const slotUTC = hostLocalToUTC(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
            hours,
            minutes,
            timezone
          );

          if (slotUTC <= now) continue;

          const iso = slotUTC.toISOString();
          const booking = bookedByIso[iso] || null;
          const isOverridden = overrideSet.has(`${calendarDate}|${timeSlot}`);

          // For admin view: show everything including overridden/blocked
          slots.push({
            date: iso,
            calendarDate,
            hostTime: timeSlot,
            dayOfWeek,
            booked: !!booking,
            booking,
            removed: isOverridden,
            dayBlocked: dayIsBooked && !booking,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      slots,
      timezone,
      availabilities: availabilities.map((a) => a.toJSON()),
    });
  } catch (error) {
    console.error("Admin calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

// DELETE: Add a date override (remove a specific slot on a specific date)
export async function DELETE(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { calendarDate, slotTime } = await req.json();

    if (!calendarDate || !slotTime) {
      return NextResponse.json(
        { error: "calendarDate and slotTime required" },
        { status: 400 }
      );
    }

    await connectMongo();

    await DateOverride.findOneAndUpdate(
      { date: calendarDate, slotTime },
      { date: calendarDate, slotTime },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Date override error:", error);
    return NextResponse.json(
      { error: "Failed to add override" },
      { status: 500 }
    );
  }
}

// PATCH: Restore a previously removed slot (undo date override)
export async function PATCH(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { calendarDate, slotTime } = await req.json();

    await connectMongo();

    await DateOverride.deleteOne({ date: calendarDate, slotTime });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Restore slot error:", error);
    return NextResponse.json(
      { error: "Failed to restore slot" },
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
