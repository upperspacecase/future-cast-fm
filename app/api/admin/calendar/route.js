import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";

// GET: Full calendar view for admin — all slots + bookings for next 4 weeks
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

    // Get all bookings in range with guest info
    const bookings = await Booking.find({
      date: { $gte: now, $lte: endDate },
    }).lean();

    const bookedMap = {};
    for (const b of bookings) {
      bookedMap[b.date.toISOString()] = {
        guestName: b.guestName,
        guestEmail: b.guestEmail,
        guestTimezone: b.guestTimezone,
        bookingId: b._id.toString(),
        guestId: b.guestId.toString(),
      };
    }

    // Build full slot list (available + booked)
    const slots = [];
    const current = new Date(now);
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvail = availabilities.find((a) => a.dayOfWeek === dayOfWeek);

      if (dayAvail && dayAvail.active && dayAvail.slots.length > 0) {
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

          if (slotUTC > now) {
            const iso = slotUTC.toISOString();
            const booking = bookedMap[iso] || null;

            slots.push({
              date: iso,
              hostTime: timeSlot,
              dayOfWeek,
              booked: !!booking,
              booking,
            });
          }
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

// DELETE: Remove a specific availability slot
export async function DELETE(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { dayOfWeek, slotTime } = await req.json();

    await connectMongo();

    const avail = await Availability.findOne({ dayOfWeek });
    if (avail) {
      avail.slots = avail.slots.filter((s) => s !== slotTime);
      if (avail.slots.length === 0) {
        avail.active = false;
      }
      await avail.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete slot error:", error);
    return NextResponse.json(
      { error: "Failed to delete slot" },
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
