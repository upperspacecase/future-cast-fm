import Link from "next/link";
import Footer from "@/components/Footer";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

const description =
  "Done-for-you podcast guest booking. We find guests who fit your show, draft the invite, and prep you. You approve and show up.";

export const metadata = getSEOTags({
  title: "Future Cast Booking | FutureCast.fm",
  description,
  canonicalUrlRelative: "/booking",
  extraTags: {
    twitter: {
      card: "summary_large_image",
      title: "Future Cast Booking | FutureCast.fm",
      description,
    },
  },
});

const contactEmail = config.resend.supportEmail;

const applyMailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
  "Pilot spot for Future Cast Booking"
)}&body=${encodeURIComponent(
  "Name:\nPodcast:\nLink:\nOne sentence on who the show is for:\n"
)}`;

const loop = [
  {
    step: "01",
    title: "Find",
    text: "We research people against a written profile of your show. Shortlist and Booked each include 20 candidates. On Booked, two public appearances are reviewed for each.",
  },
  {
    step: "02",
    title: "Reach",
    text: "We draft a personalised invite in your voice. On Booked and Full Calendar it sends only after you approve it. On Shortlist, you send it.",
  },
  {
    step: "03",
    title: "Book",
    text: "We follow up twice at most, then schedule a time and send reminders. A no is a no. We do not count it as a booking.",
  },
  {
    step: "04",
    title: "Prep",
    text: "You get a one-page brief before the recording. Who they are, why they fit, and what is worth talking about.",
  },
];

const mustHaves = [
  "A lived practice, not a pitch. They do the thing they talk about.",
  "They can stay in a long conversation and stay honest about the hard parts.",
  "Constructive about the future. Realistic about problems, and leaning toward building.",
  "A concrete through-line. On Future Cast FM that is agency, the body, or how futures get made. Yours will be the through-line of your show.",
  "They will go along with the format. Tangents. A question left for the next guest. No script to approve in advance.",
];

const disqualifiers = [
  "Hype, get-rich-quick, or hustle framing. Pure self-promotion. Paid guest placements.",
  "Doom with no agency in it.",
  "Anyone who needs a pre-approved question list or media-trained soundbites.",
  "Claims they cannot stand behind.",
  "Anyone who has already been on the show.",
];

const plans = [
  {
    name: "Shortlist",
    price: "$450",
    note: "a month",
    summary: "The research and the drafts. You send.",
    featured: false,
    items: [
      "20 researched candidates",
      "Invites drafted in your voice",
      "You send them yourself",
      "Sending, follow-ups, scheduling, and prep briefs stay on your side",
    ],
  },
  {
    name: "Booked",
    price: "$1,250",
    note: "a month",
    summary: "Four confirmed guests. This is the plan to start with.",
    featured: true,
    pilot: "The first 3 hosts get this plan at $750 a month for 2 months.",
    items: [
      "4 confirmed guests a month",
      "$300 credit for each one we miss",
      "20 candidates researched",
      "2 public appearances reviewed for each",
      "Invites drafted in your voice and sent after you approve",
      "Up to 2 follow-ups",
      "Scheduling and reminders",
      "A one-page prep brief for each guest",
    ],
  },
  {
    name: "Full Calendar",
    price: "$2,400",
    note: "a month",
    summary: "Eight guests, plus two things that make the month hang together.",
    featured: false,
    items: [
      "8 guests a month",
      "Research, invites in your voice, your approval, follow-ups, scheduling, reminders, and a prep brief for each guest",
      "A relay question carried from guest to guest",
      "A share kit for each guest",
    ],
  },
];

const included = [
  {
    name: "Prep brief",
    where: "Booked and Full Calendar",
    text: "One page before each recording. Who they are, why they fit the profile, and what is worth talking about. You can walk in without a research rabbit hole the night before.",
  },
  {
    name: "Relay question",
    where: "Full Calendar",
    text: "Each guest leaves a question for the next guest. The month builds, instead of resetting every episode. Future Cast FM already runs this way. On your show, it is part of Full Calendar.",
  },
  {
    name: "Share kit",
    where: "Full Calendar",
    text: "A short pack the guest can send to their own people. What the conversation is, and where to point. We write it. We do not post it, boost it, or chase their audience.",
  },
];

const excluded = [
  "Production and editing",
  "Promotion, clips, and ads",
  "Paid guest placements",
  "Booking you as a guest on other shows",
];

const value = [
  {
    label: "Dream outcome",
    text: "A calendar of guests you are proud to have on. Four confirmed guests a month on Booked. Eight on Full Calendar. People who fit the practice the show is for.",
  },
  {
    label: "Likelihood",
    text: "A profile is written before anyone is emailed. Public work is actually read. On Booked, two appearances per candidate. Every invite waits for your yes. Miss a confirmed guest and Booked credits you $300.",
  },
  {
    label: "Time delay",
    text: "The first shortlist arrives within 7 days of the start. After that, the work runs every month. You are not left waiting on a promise with no date.",
  },
  {
    label: "Effort",
    text: "You approve the people. You approve the words. You show up and record. Research, writing, follow-ups, scheduling, and the brief sit with us.",
  },
];

const faqs = [
  {
    q: "Who is this for?",
    a: "Hosts whose podcast markets a practice. Coaches, authors, consultants, and small B2B brands. The show is how the right people meet the work.",
  },
  {
    q: "Who is it not for?",
    a: "Hobby hosts. If the show is how you spend a Sunday, keep it that way. It is also the wrong fit if you want editing, clips, promotion, or a service that books you onto other people's shows.",
  },
  {
    q: "What do I actually do?",
    a: "You approve the shortlist. You approve the invites. You show up. If a draft does not sound like you, say so. We rewrite it before it sends.",
  },
  {
    q: "How fast is the first list?",
    a: "Within 7 days of the start. That first delivery is a shortlist, not four finished bookings. Bookings follow as people reply and times land on the calendar.",
  },
  {
    q: "What does confirmed mean?",
    a: "The guest has agreed to record, and a time is on the calendar. An email sent is not a booking. A polite no is not a booking.",
  },
  {
    q: "What if they say no?",
    a: "We follow up twice, then we stop. On Booked, the month is counted in confirmed guests, not in emails sent.",
  },
  {
    q: "What if you miss the four?",
    a: "On Booked, you get a $300 credit for each confirmed guest under the four. The pilot is the Booked plan, so the same credit applies at the pilot price. Full Calendar does not include this credit.",
  },
  {
    q: "Will the invite sound like me?",
    a: "We draft it from how you already speak and write. You read every one. Nothing goes out until you approve it.",
  },
  {
    q: "My show is small. Will anyone say yes?",
    a: "We decide up front who a direct invite from a show of your size can realistically reach, and we skip people who only talk to much larger shows. Fit and a specific note do the work. There is no yes-rate to quote, because this has not been sold to other hosts yet.",
  },
  {
    q: "Is this already running for other clients?",
    a: "No. There are no clients yet. The system is built and tested on Future Cast FM, the show I host. That is a test case, not a client list.",
  },
  {
    q: "Do you edit, promote, or book me onto other shows?",
    a: "No. Not on any tier. We find guests for your show, get them booked, and prep you. Production, editing, promotion, paid placements, and booking you as a guest are out.",
  },
  {
    q: "What happens after the two pilot months?",
    a: "The pilot is two months at $750. After that, Booked is $1,250 a month if you want to continue. Tell me if you do not.",
  },
  {
    q: "How do I pay?",
    a: "There is no checkout on this page, and no card form. Apply by email. If I say yes, we sort payment between us.",
  },
];

const buttonClass =
  "inline-flex items-center justify-center bg-[#FFD700] text-black font-black uppercase italic px-6 py-3.5 rounded-lg text-sm hover:scale-105 motion-reduce:transform-none transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700]";

const goldButtonOnGold =
  "inline-flex items-center justify-center bg-black text-[#FFD700] font-black uppercase italic px-6 py-3.5 rounded-lg text-sm hover:scale-105 motion-reduce:transform-none transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

function ApplyButton({ onGold = false }) {
  return (
    <a href={applyMailto} className={onGold ? goldButtonOnGold : buttonClass}>
      Apply for a pilot spot
    </a>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 lg:px-12 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-white font-black text-xl tracking-tight uppercase italic hover:text-[#FFD700] transition-colors"
          >
            FUTURECAST.FM
          </Link>
          <Link
            href="/"
            className="text-white/50 hover:text-[#FFD700] text-xs tracking-[0.18em] uppercase transition-colors"
          >
            The show
          </Link>
        </div>
      </header>

      <main>
        <section className="px-6 lg:px-12 pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-[#FFD700] tracking-[0.22em] font-bold italic uppercase">
              Future Cast Booking
            </p>
            <h1 className="mt-5 text-4xl md:text-6xl lg:text-7xl font-black uppercase italic leading-[0.9] tracking-tight text-white">
              A full calendar of guests you&apos;re proud to have on.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-white/80 leading-relaxed">
              We find qualified guests for your show, draft the invite in your
              voice, and send it once you approve. We handle the follow-ups and
              the scheduling, then write a one-page prep brief. You approve.
              You show up.
            </p>
            <p className="mt-4 text-white/60 leading-relaxed">
              For hosts whose podcast markets a practice. Coaches, authors,
              consultants, small B2B brands. If the show is a hobby, this is
              the wrong page.
            </p>
            <div className="mt-10 flex flex-col items-start gap-3">
              <ApplyButton />
              <p className="text-sm text-white/50 leading-relaxed">
                Three pilot spots. Booked at $750 a month for 2 months. Opens
                an email to{" "}
                <a
                  href={applyMailto}
                  className="text-white/70 underline decoration-white/30 underline-offset-2 hover:text-[#FFD700]"
                >
                  {contactEmail}
                </a>
                . No payment on this page.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Find. Reach. Book. Prep.
            </h2>
            <p className="mt-4 max-w-2xl text-white/60 leading-relaxed">
              That is the whole loop on Booked and Full Calendar. Shortlist is
              the research and the drafts, and you send them. The first
              shortlist is within 7 days.
            </p>
            <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {loop.map((item) => (
                <li key={item.step}>
                  <p className="text-[#FFD700] font-black italic text-sm tracking-wide">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-2xl font-black uppercase italic text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">
                    {item.text}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-14 max-w-2xl">
              <h3 className="text-lg font-black uppercase italic text-white">
                What you do
              </h3>
              <ul className="mt-4 space-y-2 text-white/80">
                <li>Approve the shortlist.</li>
                <li>Approve the words.</li>
                <li>Show up and record.</li>
              </ul>
              <p className="mt-4 text-sm text-white/50 leading-relaxed">
                You still have to be worth an hour of someone&apos;s time. We
                get the right person to the microphone. The conversation is
                yours.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Tested on our own show. Not sold yet.
            </h2>
            <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
              There are no clients, no logos, and no results to borrow. The
              system runs on Future Cast FM, the show I host. This page is
              that same loop, offered to other hosts for the first time.
            </p>
            <div className="mt-10 max-w-xl">
              <article className="border border-white/15 rounded-xl p-6 md:p-8">
                <p className="text-xs text-[#FFD700] tracking-[0.18em] uppercase italic font-bold">
                  Test case
                </p>
                <h3 className="mt-3 text-2xl font-black uppercase italic">
                  Future Cast FM
                </h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                  Long-form conversations about agency, the body, and
                  optimistic futures.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              How we qualify guests
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-white/70 leading-relaxed">
              <p>
                Before anyone is contacted, we write a guest profile for your
                show. One line on who belongs. Must-haves. Nice-to-haves. Hard
                reasons to skip someone.
              </p>
              <p>
                We pick for lived practice, and for the way they see the
                subject. We decide up front who a direct invite from a show of
                your size can realistically reach, and we leave the rest
                alone. You see the shortlist. You decide who we may write to.
              </p>
              <p>
                Below is the profile Future Cast FM is tested against. Your
                show gets its own. The method is the same. The through-line is
                yours.
              </p>
            </div>

            <p className="mt-12 text-xs text-[#FFD700] tracking-[0.18em] uppercase italic font-bold">
              Future Cast FM profile
            </p>
            <p className="mt-4 max-w-3xl text-xl md:text-2xl font-black italic text-white leading-snug">
              Someone who chose a hard, specific path, can feel it in their
              body as well as explain it, and leaves you more hopeful and more
              likely to act.
            </p>

            <div className="mt-10 grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-black uppercase italic">
                  Must-haves
                </h3>
                <ul className="mt-4 space-y-4">
                  {mustHaves.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-white/75 leading-relaxed pl-4 border-l border-[#FFD700]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic">
                  We skip
                </h3>
                <ul className="mt-4 space-y-4">
                  {disqualifiers.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-white/75 leading-relaxed pl-4 border-l border-white/20"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              The value equation
            </h2>
            <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
              Value is the dream outcome times how likely it is, divided by
              how long you wait and how much of it you have to do yourself.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {value.map((item) => (
                <div
                  key={item.label}
                  className="p-6 md:p-8 border border-white/15 rounded-xl"
                >
                  <h3 className="text-[#FFD700] text-xs tracking-[0.18em] uppercase italic font-bold">
                    {item.label}
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="plans"
          className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Three ways to buy it
            </h2>
            <p className="mt-4 max-w-2xl text-white/60 leading-relaxed">
              Prices are in USD, per month. Booked is the one I would take.
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-3 md:items-stretch">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`rounded-xl p-6 md:p-8 flex flex-col ${
                    plan.featured
                      ? "border-2 border-[#FFD700] order-1 md:order-2"
                      : plan.name === "Shortlist"
                        ? "border border-white/15 order-2 md:order-1"
                        : "border border-white/15 order-3"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black uppercase italic">
                      {plan.name}
                    </h3>
                    {plan.featured && (
                      <span className="text-[11px] tracking-[0.16em] uppercase italic font-bold text-black bg-[#FFD700] px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-6 text-4xl font-black tracking-tight">
                    {plan.price}
                  </p>
                  <p className="text-sm text-white/50">{plan.note}</p>
                  <p className="mt-4 text-sm text-white/80 leading-relaxed">
                    {plan.summary}
                  </p>
                  {plan.pilot && (
                    <p className="mt-4 text-sm text-[#FFD700] leading-relaxed">
                      {plan.pilot}
                    </p>
                  )}
                  <ul className="mt-6 space-y-3 text-sm text-white/75 leading-relaxed">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFD700]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-8 border-l-4 border-[#FFD700] bg-[#FFD700]/10 px-5 py-4 rounded-r-lg max-w-3xl">
              <p className="text-white/90 leading-relaxed">
                Pilot: the first 3 hosts get Booked at $750 a month for 2
                months. Same work. Same $300 credit. Three spots, because I
                run this myself and Future Cast FM already sits on the system.
              </p>
            </div>

            <div className="mt-10">
              <ApplyButton />
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              The guarantee
            </h2>
            <p className="mt-6 text-white/80 leading-relaxed">
              On Booked, the month is four confirmed guests. Confirmed means
              they have agreed to record, and a time is on the calendar. For
              each of those four we do not confirm, you get a $300 credit.
            </p>
            <p className="mt-4 text-white/60 leading-relaxed">
              The pilot uses the same rule. Full Calendar is eight guests, the
              relay question, and the share kit. It does not include the
              credit.
            </p>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Included by name
            </h2>
            <p className="mt-4 max-w-2xl text-white/60 leading-relaxed">
              These are part of the plan, not extras with invented prices.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {included.map((item) => (
                <article
                  key={item.name}
                  className="border border-white/15 rounded-xl p-6"
                >
                  <h3 className="text-xl font-black uppercase italic">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#FFD700] tracking-[0.16em] uppercase italic font-bold">
                    {item.where}
                  </p>
                  <p className="mt-4 text-sm text-white/70 leading-relaxed">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Not in any tier
            </h2>
            <ul className="mt-8 space-y-3">
              {excluded.map((item) => (
                <li key={item} className="text-white/80 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 md:py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              Questions
            </h2>
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {faqs.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-6 text-white font-semibold leading-snug [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFD700]">
                    <span>{item.q}</span>
                    <span
                      className="text-[#FFD700] text-xl leading-none group-open:rotate-45 transition-transform motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm text-white/70 leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FFD700] text-black px-6 lg:px-12 py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs tracking-[0.22em] font-bold italic uppercase">
              Three pilot spots
            </p>
            <h2 className="mt-4 text-4xl md:text-6xl font-black uppercase italic leading-[0.9]">
              Apply for a pilot spot.
            </h2>
            <p className="mt-6 text-lg leading-relaxed max-w-xl">
              Email your name, the show, a link, and one sentence on who it is
              for. I will reply with a yes, a no, or a question.
            </p>
            <p className="mt-4 text-black/70 leading-relaxed max-w-xl">
              I will take three hosts. Future Cast FM already uses the
              system, and three outside shows is the number I can do properly.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <ApplyButton onGold />
              <p className="text-sm text-black/70">
                {contactEmail}. No checkout. No card details.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
