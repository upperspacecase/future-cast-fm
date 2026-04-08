import config from "@/config";

/**
 * Generate the outreach email — personal style for deliverability
 * @param {string} guestId - The guest's MongoDB ID (for the schedule link)
 * @param {string} guestName - The guest's name for personalization
 * @returns {Object} { html, text } - HTML and plaintext versions
 */
export function generateOutreachEmail(guestId, guestName) {
  const scheduleUrl = `https://${config.domainName}/schedule/${guestId}`;
  const firstName = guestName?.split(" ")[0] || "Hey";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #ffffff;">
  <div style="max-width: 520px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a; font-size: 15px; line-height: 1.7;">
    <p style="margin: 0 0 16px 0;">${firstName},</p>

    <p style="margin: 0 0 16px 0;">I run <strong>FutureCast.fm</strong> &mdash; it&rsquo;s a series of long conversations about how we navigate being human in a world that&rsquo;s accelerating.</p>

    <p style="margin: 0 0 16px 0;">I came across your podcast and I think we&rsquo;d have a really interesting conversation. The kind where we go deep and see where it takes us.</p>

    <p style="margin: 0 0 24px 0;">Interested? Pick a time that works for you:</p>

    <p style="margin: 0 0 32px 0;"><a href="${scheduleUrl}" style="color: #b8860b; font-weight: bold; text-decoration: underline;">Book a recording slot</a></p>

    <p style="margin: 0 0 4px 0;">Tay</p>
    <p style="margin: 0; color: #999; font-size: 13px;">FutureCast.fm</p>
  </div>
</body>
</html>`;

  const text = `${firstName},

I run FutureCast.fm -- it's a series of long conversations about how we navigate being human in a world that's accelerating.

I came across your podcast and I think we'd have a really interesting conversation. The kind where we go deep and see where it takes us.

Interested? Pick a time that works for you:
${scheduleUrl}

Tay
FutureCast.fm`;

  return { html, text };
}
