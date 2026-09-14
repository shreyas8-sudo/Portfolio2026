import type { Metadata } from "next";
import Figure from "@/components/case/Figure";
import SideNav, { type Section } from "@/components/case/SideNav";
import SectionHead from "@/components/case/SectionHead";
import TrackBanner from "@/components/case/TrackBanner";
import ProcessVariance, { type Lane } from "@/components/case/ProcessVariance";
import EventStitch from "@/components/case/EventStitch";
import SpecFramework from "@/components/case/SpecFramework";
import HoverFigure from "@/components/case/HoverFigure";
import PositioningMap, { type Player } from "@/components/case/PositioningMap";
import Takeaways from "@/components/case/Takeaways";
import Mark from "@/components/case/Mark";
import ContactButton from "@/components/ContactButton";
import PageIn from "@/components/PageIn";
import Settle from "@/components/Settle";
import { BackToWork, NextFlight } from "@/components/case/CaseChrome";

export const metadata: Metadata = {
  title: "Synechron",
  description:
    "Process intelligence for banks, and an AI skill for the whole firm. An 8-week enterprise internship in two seats.",
};

const A = "var(--color-synechron)";
const M = "/media/synechron";
const TINT = "rgba(47,74,124,0.14)";

const sections: Section[] = [
  { id: "problem", label: "problem", group: "Track 01" },
  { id: "solution", label: "solution" },
  { id: "flows", label: "three flows" },
  { id: "process", label: "how I worked" },
  { id: "iterations", label: "iterations" },
  { id: "ask", label: "the ask", group: "Track 02" },
  { id: "call", label: "the call" },
  { id: "shipping", label: "shipping it" },
  { id: "takeaways", label: "takeaways", group: "Both" },
];

/* the real problem: same process, three different shapes */
const lanes: Lane[] = [
  {
    region: "United States",
    rule: "Reg E / Reg Z",
    steps: ["Intake", "Provisional credit", "Investigate", "Resolve", "Notify"],
  },
  {
    region: "Canada",
    rule: "FCAC",
    steps: ["Intake", "Investigate", "Resolve", "Notify", "File report"],
  },
  {
    region: "European Union",
    rule: "PSD2",
    steps: ["Intake", "Refund by T+1", "Investigate", "SCA check", "Resolve", "Notify"],
  },
];

/* what the spec skill turns messy notes into */
const specNotes = [
  "\u201cneed a way for users to bulk export the audit package\u201d",
  "\u201cright now they screenshot everything, takes forever\u201d",
  "\u201cmaybe csv? or pdf. compliance said pdf\u201d",
  "\u201cdon\u2019t let them export if the case is still open\u201d",
];

const specParts = [
  { name: "What", what: "the change, in one sentence" },
  { name: "Why", what: "the user problem behind it" },
  { name: "Acceptance criteria", what: "how you know it is done" },
  { name: "Tests", what: "what has to pass" },
  { name: "Alternatives", what: "what was considered and dropped" },
];

/* the solution idea: the Case ID is constant, time and event do the rest */
const logs = [
  {
    name: "Customer service",
    rows: [
      { id: "CASE-88213", time: "09:14", event: "Dispute opened", system: "Customer service" },
      { id: "CASE-88213", time: "09:22", event: "Card frozen", system: "Customer service" },
    ],
  },
  {
    name: "Fraud investigation",
    rows: [
      { id: "CASE-88213", time: "11:05", event: "Assigned to analyst", system: "Fraud investigation" },
    ],
  },
  {
    name: "Compliance",
    rows: [
      { id: "CASE-88213", time: "16:40", event: "Reg E clock started", system: "Compliance" },
    ],
  },
];

/* competitive map. the open quadrant is bank specific plus discovery */
const players: Player[] = [
  { name: "Celonis", x: 0.74, y: 0.72, note: "any industry, needs clean event logs" },
  { name: "IBM", x: 0.88, y: 0.6, note: "any industry, needs clean event logs" },
  { name: "Pega", x: 0.72, y: 0.2, note: "automates what you already understand" },
  { name: "Appian", x: 0.87, y: 0.12, note: "automates what you already understand" },
  {
    name: "This platform",
    x: 0.14,
    y: 0.82,
    note: "built for banks, and for processes nobody has mapped yet",
    ours: true,
  },
];

/* two features got the most rework. what worked, what did not. */
const rebuilds = [
  {
    feature: "The process map",
    lead: "From a viewer you look at, to a tool you work in.",
    steps: [
      {
        src: "processmap-v2.webp",
        label: "V1",
        head: "The step editor covered the workspace.",
        good: "The flowchart elements were right, so those carried through untouched.",
        bad: "Opening a step buried the map behind it, there were too many buttons competing on one screen, and the variation switcher got overlooked entirely.",
      },
      {
        src: "process-map.webp",
        label: "Chosen",
        head: "A simpler, cleaner screen, which is what users preferred.",
        good: "The editor docked into the rail so the map stays visible, and the variation switcher moved to the top where people actually found it.",
        bad: "Inside the panel, editable attributes now sit above read-only mined data and read-only controls. In a tool whose output becomes evidence, seeing what you cannot change is the point.",
      },
    ],
  },
  {
    feature: "Variations",
    lead: "From one at a time, to all of them at once.",
    steps: [
      {
        src: "variationv1.webp",
        label: "V1",
        head: "The heat map idea was right, the framing was not.",
        good: "Reading coverage as a colour grid worked, so that idea survived into the final version.",
        bad: "It only showed one jurisdiction at a time, so comparing meant clicking through them, and the matrix underneath was small and secondary.",
      },
      {
        src: "final.webp",
        label: "Chosen",
        head: "All three combined into one visual.",
        good: "Easy to see the detail and compare across jurisdictions at the same time, without losing either.",
        bad: "It also carries just enough detail that the separate process map view became redundant, which is how I knew it was the right one.",
      },
    ],
  },
];

const flows = [
  {
    src: "flow-dashboard.mp4",
    poster: "flow-dashboard-poster.webp",
    ratio: "1600/882",
    name: "Dashboard",
    body: "Systems onboarded, processes mined, variations detected. Case ID matches below 85% get flagged, which is the platform raising its hand for a human.",
  },
  {
    src: "flow-onboarding.mp4",
    poster: "flow-onboarding-poster.webp",
    ratio: "1600/882",
    name: "Onboarding",
    body: "Eight steps to connect a system, with a real access control gate. The system owner approves before any data moves, and it is not a rubber stamp.",
  },
  {
    src: "flow-process-map.mp4",
    poster: "flow-process-map-poster.webp",
    ratio: "1600/1290",
    name: "Process map",
    body: "The case as one reconstructed timeline instead of five disconnected logs. Where the thread broke, the break is flagged on the map, not buried in a footnote.",
  },
];

const takeaways: [string, string][] = [
  [
    "UI/UX isn't a standalone job anymore, and the highest-leverage thing I shipped was a markdown file.",
    "This summer needed a designer, a PM, and a little bit of a developer in the same seat. The design work was the visible half. The skill sitting in the enterprise repo is the half other people are still using. Ship where the leverage is, even when it is not in Figma.",
  ],
  [
    "Keeping up with the tools is part of the job now.",
    "Config 2026 shipped motion, code layers and agents, and I was using them in my workflow within the week. In a field moving this fast, knowing what just became possible is a design skill, not a side interest.",
  ],
  [
    "Work worth doing rarely lands on your desk.",
    "The skill exists because I went and asked for it. Nobody assigned it, and nobody would have.",
  ],
];

const record = [
  ["Role", "UI/UX Product Design Intern · AI Engineer"],
  ["Timeline", "Summer 2026 · 8 weeks"],
  ["Skills", "Enterprise UX · UX research · prototyping · motion · spec writing"],
  ["Tools", "Figma · Claude Design · Figma Agents · Figma Motion"],
];

const team = [
  { name: "Anup Variava", url: "https://www.linkedin.com/in/anupv/" },
  { name: "Matt Craddock", url: "https://www.linkedin.com/in/matt-craddock/" },
  { name: "Frances Cruz", url: "https://www.linkedin.com/in/francescruz/" },
  { name: "Glen Notman", url: "https://www.linkedin.com/in/glen-notman-32b94/" },
];


function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[72rem] px-6 md:px-10">{children}</div>
  );
}

export default function SynechronPage() {
  return (
    <PageIn>
    <article>
      {/* ── HERO ─────────────────────────────────────── */}
      <Shell>
        <div className="pt-8">
          <BackToWork accent={A} />
        </div>
        <div className="flex flex-col gap-8 pt-6 lg:flex-row lg:items-stretch">
          <Settle delay={0.06} className="w-full shrink-0 lg:w-[20rem]">
          <div className="h-full rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${M}/logo.webp`}
                alt="Synechron"
                className="size-10 shrink-0 object-contain"
              />
              <span className="dot-code text-[14px] text-grey-90">SYNECHRON</span>
              <span className="dot-code ml-auto text-[14px]" style={{ color: A }}>
                SE561
              </span>
            </div>

            <h1 className="mt-4 text-section font-semibold text-grey-90">
              Process intelligence for banks, and an AI skill for the whole firm
            </h1>
            <p className="mt-3 text-caption text-grey-60">
              An 8-week enterprise internship in two seats: designing a process
              intelligence platform for banking, and writing a spec development
              skill used by engineers across the firm.
            </p>

            <hr className="my-5 border-grey-10" />

            <dl className="space-y-4">
              {record.map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-grey-40">{k}</dt>
                  <dd className="mt-1 text-caption text-grey-90">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="label text-grey-40">Worked under</dt>
                <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {team.map((t) => (
                    <a
                      key={t.name}
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-caption"
                      style={{ color: "var(--color-blue)" }}
                    >
                      {t.name} ↗
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          </Settle>

          <Settle delay={0.15} className="min-w-0 flex-1">
            <Figure
              src={`${M}/banner.mp4`}
              video
              poster={`${M}/banner-poster.webp`}
              ratio="1500/938"
              label="Synechron"
              accent={A}
            />

            {/* the thesis sits with the cover, it is the frame for both tracks */}
            <div className="mt-7 border-t-2 pt-5" style={{ borderColor: A }}>
              <p className="max-w-[46ch] text-sub font-semibold leading-[1.3] tracking-[-0.015em] text-grey-90 md:text-section">
                In one project I used AI to help me design.
              </p>
              <p
                className="mt-2 max-w-[46ch] text-sub font-semibold leading-[1.3] tracking-[-0.015em] md:text-section"
                style={{ color: A }}
              >
                In the other I flipped seats, and built the thing that helps
                engineers work with AI.
              </p>
              <p className="mt-4 text-body text-grey-60">
                Synechron is a digital consulting firm specializing in financial
                services. Its pitch to banks runs through FinLabs, a collection of
                frameworks the firm implements inside client organizations. My
                summer sat inside that motion: one product to design, one
                framework to ship.
              </p>
            </div>
          </Settle>
        </div>
      </Shell>

      {/* ── BODY ─────────────────────────────────────── */}
      <Shell>
        <div className="mt-14 lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-14">
          <SideNav code="SYNECHRON" sections={sections} accent={A} backToTop />

          <div className="min-w-0">
            {/* ══ TRACK 01 ═══════════════════════════════ */}
            <TrackBanner
              n="01"
              first
              blurb="Process intelligence for a bank that cannot tell you what its own processes are."
              accent={A}
            />

            {/* ── PROBLEM ────────────────────────────── */}
            <section id="problem" className="scroll-mt-32 pt-12">
              <SectionHead
                label="Problem"
                takeaway="A bank runs thousands of processes a day, and no one can say what they actually are."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                Those processes run across hundreds of systems that do not talk to
                each other, and every one of them exists in variations that keep
                changing by country, by regulation, by team.
              </p>
              <p className="mt-3 text-body text-grey-60">
                Documenting them today means asking people to write down what they
                remember. At bank scale, that is thousands of people.
              </p>

              <div className="mt-10">
                <ProcessVariance
                  process="Card fraud dispute"
                  lanes={lanes}
                  more="Dozens more variations sit below this, per team and per exception."
                  accent={A}
                  caption="The same process in three jurisdictions. Nobody has written down where they diverge."
                />
              </div>

              <p className="mt-14 max-w-[46ch] text-sub font-semibold leading-[1.35] tracking-[-0.015em] text-grey-90">
                How might we automate documenting processes across disconnected
                systems, when every one of them is a variation and none of them
                stay still?
              </p>
            </section>

            {/* ── SOLUTION ───────────────────────────── */}
            <section id="solution" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Solution"
                takeaway="Read the event logs the systems already write, and never touch the data."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                Every system already writes an event log, and the Case ID inside
                it stays constant. So instead of asking anyone, the platform
                connects read-only, reads Case ID plus timestamp plus event, and
                stitches the real path of a case back together.
              </p>

              <div className="mt-8">
                <EventStitch
                  systems={logs}
                  accent={A}
                  caption="Every system already writes an event log. The Case ID is the constant that lets them be stitched."
                />
              </div>

              <h3 className="mt-12 text-sub font-medium text-grey-90">
                Where it stops, on purpose
              </h3>
              <p className="mt-2.5 text-body text-grey-60">
                When the output is evidence for a regulator, a person makes the
                call, not a black box. The platform produces bottleneck reports,
                control gaps and audit packages, and humans act on them.
              </p>
              <p className="mt-4 max-w-[52ch] text-body-lg leading-relaxed text-grey-90">
                <Mark tint={TINT}>It documents and flags. It never executes.</Mark>
              </p>
            </section>

            {/* ── FLOWS ──────────────────────────────── */}
            <section
              id="flows"
              className="mt-20 scroll-mt-32 rounded-[--radius-panel] bg-[#eef2f8] p-6 md:p-10"
            >
              <SectionHead
                label="Three flows"
                takeaway="Three screens carry the whole story."
                accent={A}
              />
              {/* full width so the screens are actually readable, alternating
                  sides so three in a row does not read as a list */}
              <ul className="mt-10 space-y-14">
                {flows.map((f, i) => (
                  <li
                    key={f.name}
                    className="group grid items-center gap-8 md:grid-cols-2"
                  >
                    <div className={i % 2 === 1 ? "md:order-last" : undefined}>
                      <h3 className="text-sub font-medium text-grey-90">
                        {f.name}
                      </h3>
                      <p className="mt-2.5 text-body text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                        {f.body}
                      </p>
                    </div>
                    <Figure
                      src={`${M}/${f.src}`}
                      video
                      poster={`${M}/${f.poster}`}
                      ratio={f.ratio}
                      label={f.name}
                      accent={A}
                    />
                  </li>
                ))}
              </ul>
            </section>

            {/* ── THE DECISION ───────────────────────── */}
            {/* ── HOW I WORKED ───────────────────────── */}
            <section id="process" className="scroll-mt-32 pt-16">
              <SectionHead
                label="How I worked"
                takeaway="I didn't know what process intelligence was in week one, so the order of work mattered."
                accent={A}
              />

              <ol className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-3">
                {[
                  "learn the domain",
                  "competitive analysis",
                  "task journeys",
                  "personas",
                  "platform goals",
                  "design the platform",
                  "iterate",
                ].map((s, i, arr) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className="rounded-[--radius-tag] border px-3 py-1.5 text-caption text-grey-90"
                      style={{ borderColor: "rgba(47,74,124,0.3)" }}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-grey-40" aria-hidden="true">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-body text-grey-60">
                You cannot define goals before you know who you are building for.
              </p>

              <h3 className="mt-12 text-sub font-medium text-grey-90">
                The competitive map
              </h3>
              <p className="mt-2.5 text-body text-grey-60">
                Celonis and IBM sell to any industry. Pega and Appian automate
                processes you already understand. Nobody was building for one
                specific client type, a bank, and for the processes nobody has
                mapped yet.
              </p>
              {/* 75% width, it reads better small and does not need to shout */}
              <div className="mt-6 max-w-[75%]">
                <PositioningMap
                  players={players}
                  xLow="bank specific"
                  xHigh="any industry"
                  yLow="automates known processes"
                  yHigh="discovers unknown ones"
                  highlight="tl"
                  accent={A}
                  caption="The empty quadrant is the whole argument."
                />
              </div>

            </section>

            {/* ── ITERATIONS ─────────────────────────── */}
            <section id="iterations" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Iterations"
                takeaway="Two features got rebuilt, and neither final version was the prettiest one."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                The process map and the variations view are the two screens the
                platform is judged on, so they took the most rework.
              </p>

              {rebuilds.map((r) => (
                <div key={r.feature} className="mt-14">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-sub font-medium text-grey-90">
                      {r.feature}
                    </h3>
                    <span className="text-caption text-grey-40">{r.lead}</span>
                  </div>

                  <ul
                    className={`mt-6 grid gap-8 ${
                      r.steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
                    }`}
                  >
                    {r.steps.map((v) => {
                      const chosen = v.label === "Chosen";
                      return (
                        <li key={v.label} className="group">
                          <Figure
                            src={`${M}/${v.src}`}
                            ratio="16/10"
                            top
                            label={v.label}
                            accent={A}
                          />
                          <h4 className="mt-4 text-caption font-semibold leading-snug text-grey-90">
                            {v.head}
                          </h4>

                          {/* labels get their own fixed column so the body text
                              starts on the same left edge in every card */}
                          <dl className="mt-3 space-y-2">
                            <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2">
                              <dt
                                className="label pt-[3px]"
                                style={{ color: "#4a6b52" }}
                              >
                                kept
                              </dt>
                              <dd className="text-[13px] leading-snug text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                                {v.good}
                              </dd>
                            </div>
                            <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2">
                              <dt
                                className="label pt-[3px]"
                                style={{ color: chosen ? A : "#a8443a" }}
                              >
                                {chosen ? "why" : "broke"}
                              </dt>
                              <dd className="text-[13px] leading-snug text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                                {v.bad}
                              </dd>
                            </div>
                          </dl>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <h3 className="mt-16 text-sub font-medium text-grey-90">
                The fine print
              </h3>
              <p className="mt-2.5 text-body text-grey-60">
                This was scoped as a front-end prototype to be used in sales
                pitches to clients, so there were no end users in the loop. The
                feedback cycle ran through my manager, domain research and
                competitive benchmarks instead.
              </p>
              <p className="mt-3 text-body text-grey-60">
                Branding stayed deliberately minimal, because client branding
                would overwrite it anyway. Naming that scope is part of the work.
              </p>
            </section>

            {/* ══ TRACK 02 ═══════════════════════════════ */}
            <TrackBanner
              n="02"
              blurb="A spec development skill that now lives in Synechron's enterprise repo."
              accent={A}
            />

            {/* ── THE ASK ────────────────────────────── */}
            <section id="ask" className="scroll-mt-32 pt-12">
              <SectionHead
                label="The ask"
                takeaway="This one wasn't assigned. I went and asked for it."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                I went to leadership on the AI side and asked where else I could
                learn and be useful, because I was curious and wanted more than my
                lane. They threw ten directions at me.
              </p>
              <p className="mt-3 text-body text-grey-60">
                We landed on spec-driven development.
              </p>

              {/* say plainly what a spec is, and what I actually built */}
              <div
                className="mt-6 rounded-[--radius-card] border-l-2 py-1 pl-5"
                style={{ borderColor: A }}
              >
                <p className="text-body text-grey-60">
                  A <span className="font-medium text-grey-90">spec</span> is a
                  specification, a written description of a change that says what
                  to build, why it matters, what counts as done, and what was
                  considered and rejected. Engineers write them before they write
                  code, and an AI coding agent needs one to build reliably.
                </p>
                <p className="mt-3 text-body text-grey-60">
                  The thing I made is not a spec. It is a{" "}
                  <span className="font-medium text-grey-90">skill</span>, a set of
                  instructions that teaches an AI agent how to produce a good spec
                  from whatever someone has already written down.
                </p>
              </div>
            </section>

            {/* ── THE CALL ───────────────────────────── */}
            <section id="call" className="scroll-mt-32 pt-16">
              <SectionHead
                label="The call"
                takeaway="Parse the spec out of messy notes rather than prompting people through a form."
                accent={A}
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[--radius-card] border border-grey-20 p-5">
                  <p className="label text-grey-40">Option A, rejected</p>
                  <p className="mt-2 text-caption font-medium text-grey-90">
                    Prompt people through a rigid Q&amp;A
                  </p>
                  <p className="mt-2 text-body text-grey-60">
                    Forcing a form on someone before they have thought out loud
                    produces box-checking answers.
                  </p>
                </div>
                <div
                  className="rounded-[--radius-card] border p-5"
                  style={{
                    borderColor: "rgba(47,74,124,0.35)",
                    background: "rgba(47,74,124,0.04)",
                  }}
                >
                  <p className="label" style={{ color: A }}>
                    Option B, chosen
                  </p>
                  <p className="mt-2 text-caption font-medium text-grey-90">
                    Parse structure out of what they already wrote
                  </p>
                  <p className="mt-2 text-body text-grey-60">
                    Let them dump messy notes, then extract the spec from that.
                  </p>
                </div>
              </div>
            </section>

            {/* ── SHIPPING IT ────────────────────────── */}
            <section id="shipping" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Shipping it"
                takeaway="It passed enterprise GitHub on attempt four, on my first real Git workflow."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                I took Anthropic&apos;s courses on the domain, drafted the skill
                with Claude, and benchmarked it against existing specs. Then two
                rounds against real projects: feedback, changes, retest.
              </p>

              <div className="mt-9">
                <SpecFramework
                  notes={specNotes}
                  parts={specParts}
                  accent={A}
                  caption="The skill reads what someone already wrote and returns a spec an agent can build from."
                />
              </div>

              <h3 className="mt-14 text-sub font-medium text-grey-90">
                Enterprise GitHub, the part nobody warns you about
              </h3>
              <p className="mt-2.5 text-body text-grey-60">
                Contribution guidelines, automated review, formatting gates, on my
                first-ever real Git workflow. It passed on attempt four.
              </p>
              <p className="mt-4 max-w-[52ch] text-body-lg leading-relaxed text-grey-90">
                <Mark tint={TINT}>
                  The skill now lives in Synechron&apos;s enterprise repo, used by
                  engineers across the firm.
                </Mark>
              </p>
              <div className="mt-6">
                <Figure
                  src={`${M}/github2.webp`}
                  label="Merged"
                  caption="Contribution guidelines, automated review and formatting gates, cleared on attempt four."
                  ratio="16/9"
                  top
                  accent={A}
                />
              </div>
            </section>

            {/* ── TAKEAWAYS ──────────────────────────── */}
            <section id="takeaways" className="scroll-mt-32 pt-16">
              <SectionHead label="Takeaways" accent={A} />
              <Takeaways items={takeaways} accent={A} />

              {/* the summer itself */}
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <HoverFigure
                  src={`${M}/office1.webp`}
                  ratio="4/3"
                  caption="Synechron's headquarters in New York!"
                />
                <HoverFigure
                  src={`${M}/office2.webp`}
                  ratio="4/3"
                  caption="Got to sit in on client pitches as well!"
                />
              </div>
            </section>

            {/* ── CLOSING ────────────────────────────── */}
            <section className="pt-16">
              <SectionHead label="This is the short version" accent={A} />
              <p className="mt-5 max-w-[60ch] text-body text-grey-60">
                Every section here has more behind it: the research, the
                iterations, the dead ends. If you are interested in the long
                version, let&apos;s get in touch.
              </p>
              <div className="mt-6">
                <ContactButton accent={A} />
              </div>
            </section>

          </div>
        </div>
      </Shell>

      <NextFlight
        href="/basis"
        code="BASIS"
        flight="BK165"
        title="An AI copilot for cost segregation engineers"
        accent="var(--color-basis)"
        logo="/media/basis/logo.webp"
      />
    </article>
    </PageIn>
  );
}
