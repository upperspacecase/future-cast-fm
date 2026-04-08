# FutureCast Guest Discovery & Outreach System

## Overview
Automated pipeline that discovers podcast hosts via Apple Podcasts, scores them with AI, sends outreach emails, and lets accepted guests book a recording slot.

## Design Language
- Black background, gold (#FFD700) accent
- Archivo Black font — bold, uppercase, italic
- Inter for body text
- Cards: black with gold borders, subtle gold glow shadows
- No emojis anywhere — use SVG icons or text

## Architecture

```
future-cast-fm (Next.js 15, existing app)
├── /app
│   ├── /dashboard          (NextAuth Google login, existing route)
│   │   ├── page.js         (pipeline board + stats overview)
│   │   ├── /discover       (search iTunes, review AI-scored results)
│   │   └── /availability   (set recurring time slots)
│   ├── /schedule/[guestId] (public guest booking page)
│   ├── /waitlist           (public "I WANT THIS" product waitlist page)
│   └── /api
│       ├── /discover       (iTunes search + RSS parse + Claude score + email extract)
│       ├── /send           (Resend single send to one guest)
│       ├── /book           (guest books a slot)
│       ├── /waitlist       (product waitlist signup)
│       └── /webhook/resend (open/bounce/click tracking)
├── /models
│   ├── Guest.js            (NEW)
│   ├── Booking.js          (NEW)
│   ├── Availability.js     (NEW)
│   └── Waitlist.js         (NEW)
├── /lib
│   ├── itunes.js           (NEW - iTunes Search API + RSS feed parser)
│   ├── scorer.js           (NEW - Claude API scoring)
│   └── ics.js              (NEW - .ics calendar invite generation)
└── /libs
    ├── resend.js           (EXISTING - extend with template + webhooks)
    └── anthropic.js        (NEW - Claude API client)
```

## Tech Stack
- **App**: Next.js 15 (existing)
- **DB**: MongoDB + Mongoose (existing)
- **Auth**: NextAuth v5 + Google OAuth (existing)
- **Email**: Resend (existing dep, sending from tay@futurecast.fm)
- **AI**: Claude API via @anthropic-ai/sdk (NEW dep)
- **Calendar**: ics npm package (NEW dep)
- **Podcast discovery**: iTunes Search API (no auth, no dep)

## Data Models

### Guest
```
{
  name: String (required),
  email: String (required, unique),
  podcastName: String (required),
  podcastDescription: String,
  podcastUrl: String (Apple Podcasts link),
  feedUrl: String (RSS feed URL),
  artworkUrl: String,
  genres: [String],
  aiScore: Number (0-100),
  aiReason: String (why they scored high),
  status: enum [
    "discovered",   // found via search, scored, has email
    "emailed",      // outreach sent
    "opened",       // opened the email
    "clicked",      // clicked YES button
    "accepted",     // clicked YES on landing page
    "scheduled",    // booked a time slot
    "recorded",     // episode recorded (manual status update)
    "rejected"      // manually rejected by admin
  ],
  resendMessageId: String,
  emailSentAt: Date,
  emailOpenedAt: Date,
  emailClickedAt: Date,
  acceptedAt: Date,
  scheduledAt: Date,
  bookingId: ObjectId (ref Booking),
  createdAt: Date,
  updatedAt: Date
}
Indexes: { email: 1 }, { status: 1 }, { aiScore: -1 }
```

### Booking
```
{
  guestId: ObjectId (ref Guest, required),
  guestName: String,
  guestEmail: String,
  date: Date (required, the slot date+time in UTC),
  guestTimezone: String (e.g. "America/New_York"),
  hostTimezone: String (default "America/Los_Angeles"),
  confirmed: Boolean (default true, auto-confirmed on booking),
  createdAt: Date,
  updatedAt: Date
}
Indexes: { date: 1 }, { guestId: 1 }
```

### Availability
```
{
  dayOfWeek: Number (0=Sunday, 6=Saturday, required),
  slots: [String] (time strings in HH:mm format, e.g. ["10:00", "14:00", "18:00"]),
  timezone: String (default "America/Los_Angeles"),
  active: Boolean (default true),
  createdAt: Date,
  updatedAt: Date
}
Index: { dayOfWeek: 1 }
```

### Waitlist
```
{
  email: String (required, unique),
  source: String (default "i-want-this"),
  createdAt: Date,
  updatedAt: Date
}
Index: { email: 1 }
```

## Build Order

### Phase 0: Dependencies & Config
- [ ] Install @anthropic-ai/sdk, ics
- [ ] Create libs/anthropic.js (Claude API client)
- [ ] Update config.js: domainName, resend fromAdmin/fromNoReply for futurecast.fm
- [ ] Verify Resend DNS for futurecast.fm domain (may need namecheap setup)

### Phase 1: Data Models
- [ ] Create models/Guest.js
- [ ] Create models/Booking.js
- [ ] Create models/Availability.js
- [ ] Create models/Waitlist.js

### Phase 2: Discovery Engine
- [ ] Create lib/itunes.js — searchPodcasts(query, limit) using iTunes Search API
- [ ] Extend lib/itunes.js — fetchAndParseRSS(feedUrl) to extract email, description, author
- [ ] Create lib/scorer.js — scorePodcast({ name, description, genres }) using Claude API
- [ ] Create /api/discover/route.js — POST: runs search + parse + score, saves to DB
  - Accepts: { query, genreId?, limit? }
  - For each result: fetch RSS, extract email, if no email skip entirely
  - Score with Claude, save guests with score >= threshold
  - Returns: array of discovered guests

### Phase 3: Email Outreach
- [ ] Create static HTML email template (black + gold card design, no JS)
  - YES button links to /schedule/[guestId]
  - "I WANT THIS" button links to /waitlist
  - Footer: TAY - FUTURECAST.FM
- [ ] Create /api/send/route.js — POST: sends email to one guest via Resend
  - Accepts: { guestId }
  - Updates guest status to "emailed", stores resendMessageId
  - Auth required (admin only)
- [ ] Create /api/webhook/resend/route.js — POST: handles Resend webhooks
  - Events: email.opened, email.clicked, email.bounced, email.delivered
  - Updates guest record with timestamps
  - No auth (webhook signature verification)

### Phase 4: Scheduler
- [ ] Create lib/ics.js — generateICS({ title, start, duration, guestName, guestEmail, hostEmail })
- [ ] Create /app/schedule/[guestId]/page.js — public booking page
  - Server component: fetch guest from DB, fetch availability + existing bookings
  - Show next 2 weeks of available slots
  - Display guest's timezone (detected via Intl) + host timezone side by side
  - Client component for slot selection + booking confirmation
- [ ] Create /api/book/route.js — POST: guest books a slot
  - Accepts: { guestId, date, guestTimezone }
  - Creates Booking, updates Guest status to "scheduled"
  - Sends confirmation email to both guest and host with .ics attachment
  - Confirmation email in black + gold style

### Phase 5: Admin Dashboard
- [ ] Rebuild /app/dashboard/page.js — pipeline board
  - Stats bar: total discovered, emailed, open rate, bounce rate, click rate, acceptance rate, scheduled
  - Pipeline table: all guests, sortable/filterable by status
  - Row actions: send email, reject, mark as recorded
  - Click guest to see full detail
- [ ] Create /app/dashboard/discover/page.js — discovery interface
  - Search form: keyword input, genre dropdown, limit slider
  - Trigger discovery via /api/discover
  - Show results with AI scores, approve/reject before saving
- [ ] Create /app/dashboard/availability/page.js — availability settings
  - Set days of week active/inactive
  - Set time slots per day (up to 3)
  - Set timezone
  - Preview upcoming available slots

### Phase 6: Waitlist
- [ ] Create models/Waitlist.js (if not done in Phase 1)
- [ ] Create /api/waitlist/route.js — POST: saves email
- [ ] Create /app/waitlist/page.js — "I WANT THIS" landing page
  - Shows the card design
  - Email input + submit
  - Black + gold styling

## Email Template Structure (Static HTML)
The email is a table-based HTML email that visually matches the React card component:
- Black background
- Gold (#FFD700) border, text, accents
- "FUTURECAST.FM" header in small gold italic caps
- "WANT TO COME ON THE POD?" large gold italic heading
- Description paragraph in white
- Gold-bordered callout: "Based on your transcripts, my AI thinks we would have an interesting conversation."
- Yellow CTA button: "YES!" linking to /schedule/[guestId]
- Footer: "TAY - FUTURECAST.FM"
- Below card: "I WANT THIS" outline button linking to /waitlist

## Scheduler UX
1. Guest clicks YES in email -> lands on /schedule/[guestId]
2. Page detects guest timezone via browser Intl API
3. Shows calendar grid: next 14 days
4. Each day shows available slots (minus already booked)
5. Each slot shows: "10:00 AM PT / 1:00 PM ET" (host tz / guest tz)
6. Guest clicks slot -> confirmation modal with name/email prefilled from guest record
7. Guest confirms -> booking created, confirmation emails sent with .ics

## Admin Pipeline UX
Single-page dashboard at /dashboard with three tabs/sections:
1. **Pipeline** — table of all guests with status badges, email stats, actions
2. **Discover** — search and import new potential guests
3. **Availability** — manage recording slots

Stats bar always visible at top:
- Discovered: X | Emailed: X | Open Rate: X% | Click Rate: X% | Scheduled: X

## Testing Checklist
- [ ] iTunes API search returns results with feedUrls
- [ ] RSS feed parsing extracts email from itunes:owner
- [ ] Guests without emails are skipped (not saved)
- [ ] Claude API scores podcasts and returns score + reason
- [ ] Discovery API saves valid guests to MongoDB
- [ ] HTML email renders correctly (test with Resend preview)
- [ ] Send API dispatches email and updates guest status
- [ ] Resend webhook updates guest with open/click/bounce events
- [ ] Schedule page shows available slots correctly
- [ ] Timezone conversion displays correctly for different guest timezones
- [ ] Booking API creates booking and marks slot as taken
- [ ] Confirmation emails sent to both parties with .ics attachment
- [ ] .ics file opens correctly in Apple Calendar / Google Calendar
- [ ] Dashboard shows all guests with correct stats
- [ ] Discovery page triggers search and shows scored results
- [ ] Availability page saves/updates slot configuration
- [ ] Waitlist page collects emails
- [ ] Auth: all /dashboard routes require Google login
- [ ] Auth: public routes (/schedule, /waitlist) work without login
