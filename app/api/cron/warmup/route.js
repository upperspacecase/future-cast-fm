import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Tay at FutureCast.fm <tay@futurecast.fm>";

const RECIPIENTS = [
  "taytoddpattison@gmail.com",
  "hi@life-time.co",
  "hi@nature-club.co",
  "hi@weareanimates.com",
];

const TEMPLATES = [
  {
    subject: "Quick thought on the podcast",
    body: "Had an idea for the next episode — want to explore how people are rethinking work-life balance in the age of AI. Might be a good one. What do you think?",
  },
  {
    subject: "Episode notes",
    body: "Just finished reviewing the notes from last week. Some really strong themes came through around optimism and what it actually means to build for the future. Going to pull some clips.",
  },
  {
    subject: "Guest list update",
    body: "Updated the guest pipeline. A few strong candidates came through this week — people doing genuinely interesting work in tech and culture. Will share more soon.",
  },
  {
    subject: "Re: scheduling",
    body: "Looks like next week is wide open for recording. Going to lock in a couple of sessions. Let me know if there are any conflicts on your end.",
  },
  {
    subject: "Content ideas",
    body: "Been thinking about doing a series on the intersection of technology and human connection. There's so much happening right now that feels worth exploring in long-form conversation.",
  },
  {
    subject: "Follow up",
    body: "Just following up on the last conversation. Really appreciated the perspective — it gave me a lot to think about for how we frame the show going forward.",
  },
  {
    subject: "New episode draft",
    body: "Rough cut of the next episode is coming together nicely. The conversation went in some unexpected directions, which I think makes it better. Should be ready to review by end of week.",
  },
  {
    subject: "Podcast analytics",
    body: "Downloads are trending up this month. The episodes on future-thinking topics are consistently outperforming. Worth doubling down on that angle.",
  },
  {
    subject: "Quick update",
    body: "Just a heads up — making some improvements to the website and email setup this week. Nothing major, just tightening things up behind the scenes.",
  },
  {
    subject: "Thinking out loud",
    body: "The more conversations I have, the more I realize the best episodes come from genuine curiosity rather than a rigid format. Going to lean into that more.",
  },
  {
    subject: "Week ahead",
    body: "Looking at next week — planning to finalize the episode edit and start outreach for some new guests. The pipeline is looking healthy.",
  },
  {
    subject: "Interesting read",
    body: "Came across an article about the future of independent media that really resonated. A lot of parallels to what we're building with FutureCast. Will share the link when I find it again.",
  },
  {
    subject: "Recording setup",
    body: "Tested some new audio settings today. The quality improvement is noticeable. Small details like this make a difference over time.",
  },
  {
    subject: "End of week notes",
    body: "Good week overall. Got a lot of the backend work done, a couple of promising guest conversations lined up, and the content calendar is filling in nicely.",
  },
  {
    subject: "Morning thoughts",
    body: "Starting the day thinking about what makes a conversation genuinely worth having. It always comes back to the same thing — asking better questions.",
  },
];

// Warmup schedule: ramp up over 14 days
// Day 1-3: 1 recipient per run (3/day)
// Day 4-7: 2 recipients per run (6/day)
// Day 8-14: all 4 recipients per run (12/day)
// After day 14: done automatically
const START_DATE = process.env.WARMUP_START_DATE || "2026-04-08";
const WARMUP_DAYS = 14;

function getRecipientsForToday() {
  const start = new Date(START_DATE);
  const now = new Date();
  const dayNumber = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

  if (dayNumber > WARMUP_DAYS) {
    return { recipients: [], dayNumber, done: true };
  }

  let count;
  if (dayNumber <= 3) {
    count = 1;
  } else if (dayNumber <= 7) {
    count = 2;
  } else {
    count = RECIPIENTS.length;
  }

  const shuffled = [...RECIPIENTS].sort(
    () => Math.sin(dayNumber * 7 + now.getHours()) > 0 ? 1 : -1
  );

  return {
    recipients: shuffled.slice(0, count),
    dayNumber,
    done: false,
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipients, dayNumber, done } = getRecipientsForToday();

  if (done) {
    return NextResponse.json({
      message: "Warmup complete — 14 days done. Remove this cron from vercel.json when ready.",
      dayNumber,
    });
  }

  if (recipients.length === 0) {
    return NextResponse.json({ message: "No recipients for this run", dayNumber });
  }

  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const log = [];

  for (const to of recipients) {
    try {
      const result = await getResend().emails.send({
        from: FROM,
        to,
        subject: template.subject,
        text: `${template.body}\n\n- Tay\nFutureCast.fm`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px;max-width:520px;"><p>${template.body}</p><p style="margin-top:24px;">- Tay<br/><span style="color:#999;">FutureCast.fm</span></p></div>`,
      });
      log.push({ to, id: result.data.id, status: "sent" });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      log.push({ to, status: "failed", error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    dayNumber,
    warmupDaysRemaining: WARMUP_DAYS - dayNumber,
    template: template.subject,
    log,
  });
}
