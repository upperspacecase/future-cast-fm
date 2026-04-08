/**
 * Generate confirmation email HTML for both guest and host
 * @param {Object} params
 * @param {string} params.guestName
 * @param {string} params.dateFormatted - Human-readable date/time string
 * @param {string} params.guestTimezone
 * @param {string} params.hostTimezone
 * @param {boolean} params.isHost - Whether this email is for the host
 * @returns {Object} { html, text }
 */
export function generateConfirmationEmail({
  guestName,
  dateFormatted,
  guestTimezone,
  hostTimezone,
  isHost = false,
}) {
  const heading = isHost
    ? `${guestName} BOOKED A RECORDING`
    : "CAN'T WAIT TO SPEAK";

  const subtext = isHost
    ? `New guest booking for FutureCast.fm`
    : `You're confirmed for FutureCast.fm`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #000000; border: 1px solid rgba(250, 204, 21, 0.4); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 24px 8px 24px;">
              <p style="margin: 0; font-size: 11px; color: #FACC15; letter-spacing: 3px; font-weight: bold; font-style: italic;">
                FUTURECAST.FM
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 16px 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; font-style: italic; color: #FACC15; line-height: 1; letter-spacing: -0.5px;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 16px 24px;">
              <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-style: italic;">
                ${subtext}
              </p>
            </td>
          </tr>

          <!-- Time Block -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(250, 204, 21, 0.1); border-left: 4px solid #FACC15; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px 0; color: #FACC15; font-size: 18px; font-weight: 900; font-style: italic;">
                      ${dateFormatted}
                    </p>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 13px; font-style: italic;">
                      Guest: ${guestTimezone} / Host: ${hostTimezone}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${!isHost ? `
          <!-- Note for guest -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; font-style: italic;">
                A calendar invite is attached. I'll send recording details closer to the date.
              </p>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(250, 204, 21, 0.2); padding: 12px 24px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-style: italic; letter-spacing: 3px;">
                TAY &middot; FUTURECAST.FM
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `FUTURECAST.FM

${heading}

${subtext}

When: ${dateFormatted}
Guest timezone: ${guestTimezone}
Host timezone: ${hostTimezone}

${!isHost ? "A calendar invite is attached. I'll send recording details closer to the date." : ""}

---
TAY - FUTURECAST.FM`;

  return { html, text };
}
