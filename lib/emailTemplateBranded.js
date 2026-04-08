import config from "@/config";

/**
 * Generate the static HTML email template for guest outreach
 * @param {string} guestId - The guest's MongoDB ID (for the schedule link)
 * @returns {Object} { html, text } - HTML and plaintext versions
 */
export function generateOutreachEmail(guestId) {
  const scheduleUrl = `https://${config.domainName}/schedule/${guestId}`;
  const waitlistUrl = `https://${config.domainName}/waitlist`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FutureCast.fm Invite</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Card -->
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; font-style: italic; color: #FACC15; line-height: 0.95; letter-spacing: -0.5px;">
                WANT TO COME ON THE POD?
              </h1>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding: 16px 24px;">
              <p style="margin: 0 0 16px 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; text-transform: uppercase; font-style: italic; font-weight: bold;">
                FutureCast is a series of long conversations about how we navigate being human in a world that's accelerating.
              </p>
            </td>
          </tr>

          <!-- Callout -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(250, 204, 21, 0.1); border-left: 4px solid #FACC15; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #FACC15; font-size: 15px; line-height: 1.6; text-transform: uppercase; font-style: italic; font-weight: bold;">
                      Based on your transcripts, my AI thinks we would have an interesting conversation.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 8px 24px 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${scheduleUrl}" target="_blank" style="display: block; width: 100%; padding: 16px 0; background-color: #FACC15; color: #000000; font-size: 20px; font-weight: 900; font-style: italic; text-decoration: none; text-align: center; border-radius: 12px; letter-spacing: 1px;">
                      YES!
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(250, 204, 21, 0.2); padding: 12px 24px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-style: italic; letter-spacing: 3px;">
                TAY &middot; FUTURECAST.FM
              </p>
            </td>
          </tr>
        </table>

        <!-- I Want This Button (below card) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin-top: 24px;">
          <tr>
            <td align="center">
              <a href="${waitlistUrl}" target="_blank" style="display: block; width: 100%; padding: 16px 0; background-color: transparent; color: #FACC15; font-size: 16px; font-weight: 900; font-style: italic; text-decoration: none; text-align: center; border: 2px solid #FACC15; border-radius: 12px; letter-spacing: 1px;">
                I WANT THIS &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-style: italic;">
                Custom invite card built for your podcast. Reply to this email and we'll set it up.
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

WANT TO COME ON THE POD?

FutureCast is a series of long conversations about how we navigate being human in a world that's accelerating.

Based on your transcripts, my AI thinks we would have an interesting conversation.

Click here to book a time: ${scheduleUrl}

---
TAY - FUTURECAST.FM

---
Want a custom invite card like this for your podcast? Visit: ${waitlistUrl}`;

  return { html, text };
}
