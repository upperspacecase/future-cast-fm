import { createEvent } from "ics";

/**
 * Generate an .ics calendar invite
 * @param {Object} params
 * @param {string} params.guestName
 * @param {string} params.guestEmail
 * @param {string} params.hostEmail
 * @param {Date} params.start - Start time as Date object (UTC)
 * @param {number} params.durationMinutes - Duration in minutes (default 60)
 * @returns {Promise<string>} The .ics file content as a string
 */
export async function generateICS({
  guestName,
  guestEmail,
  hostEmail,
  start,
  durationMinutes = 60,
}) {
  const startDate = new Date(start);

  const event = {
    title: `FutureCast.fm Recording - ${guestName}`,
    description: `Podcast recording session with ${guestName} for FutureCast.fm`,
    start: [
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + 1,
      startDate.getUTCDate(),
      startDate.getUTCHours(),
      startDate.getUTCMinutes(),
    ],
    startInputType: "utc",
    duration: {
      hours: Math.floor(durationMinutes / 60),
      minutes: durationMinutes % 60,
    },
    organizer: { name: "Tay at FutureCast.fm", email: hostEmail },
    attendees: [
      {
        name: guestName,
        email: guestEmail,
        rsvp: true,
        partstat: "ACCEPTED",
        role: "REQ-PARTICIPANT",
      },
    ],
    status: "CONFIRMED",
    busyStatus: "BUSY",
    productId: "futurecast-fm/scheduler",
  };

  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}
