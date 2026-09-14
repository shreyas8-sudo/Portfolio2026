import type { Metadata } from "next";
import Figure from "@/components/case/Figure";
import SideNav, { type Section } from "@/components/case/SideNav";
import SectionHead from "@/components/case/SectionHead";
import WorkflowDiagram, { type View } from "@/components/case/WorkflowDiagram";
import HoverFigure from "@/components/case/HoverFigure";
import Takeaways from "@/components/case/Takeaways";
import Mark from "@/components/case/Mark";
import ContactButton from "@/components/ContactButton";
import PageIn from "@/components/PageIn";
import Settle from "@/components/Settle";
import { BackToWork, NextFlight } from "@/components/case/CaseChrome";

export const metadata: Metadata = {
  title: "Basis",
  description:
    "An AI copilot for cost segregation engineers. Co-founded and designed in 10 weeks through LavaLab.",
};

const A = "var(--color-basis)"; // case accent, Basis green
const M = "/media/basis";
const TINT = "rgba(53,101,77,0.14)";

const sections: Section[] = [
  { id: "context", label: "context" },
  { id: "problem", label: "problem" },
  { id: "research", label: "research" },
  { id: "iterations", label: "iterations" },
  { id: "solution", label: "solution" },
  { id: "takeaways", label: "takeaways" },
];

/* the real workflow, from the study */
const workflow: View[] = [
  {
    id: "full",
    label: "Full workflow",
    steps: [
      { n: "01", name: "Client onboarding", note: "Receive property info and sign engagement.", severity: "smooth" },
      { n: "02", name: "Document collection", note: "Gather blueprints, appraisals, invoices.", severity: "friction", pain: "No standardized format for docs" },
      { n: "03", name: "Site visit and photo capture", note: "Photographer captures every room and asset.", severity: "friction", pain: "Photos unstructured, often mislabeled" },
      { n: "04", name: "Photo organization", note: "Manually sort, label and match to assets.", severity: "pain", pain: "An entire job role exists just for this" },
      { n: "05", name: "Document cross-reference", note: "Validate each asset across 4+ tools.", severity: "pain", pain: "Tool switching kills focus and time" },
      { n: "06", name: "Asset classification", note: "Assign a depreciation category per asset.", severity: "pain", pain: "High ambiguity plus legal liability" },
      { n: "07", name: "Quality review", note: "Senior engineer checks for IRS defensibility.", severity: "pain", pain: "Blind review, no source links" },
      { n: "08", name: "Report generation", note: "Manually compile the client deliverable.", severity: "pain", pain: "Fully manual, no structured output" },
      { n: "09", name: "Sign-off and delivery", note: "Licensed professional signs and delivers.", severity: "friction", pain: "AI legally cannot do this" },
    ],
    /* steps 04 to 08: every painful step except the one a license has to sign */
    solves: { from: 3, to: 7, note: "where Basis sits" },
  },
  {
    id: "classification",
    label: "Asset classification",
    heading: "Asset classification in detail",
    steps: [
      { n: "01", name: "Pull up asset individually", severity: "pain" },
      { n: "02", name: "View photos, floor plan, docs", severity: "pain", pain: "4+ tools open at once" },
      { n: "03", name: "Determine depreciation category", severity: "pain", pain: "Ambiguous IRS guidelines" },
      { n: "04", name: "Find source document", severity: "pain", pain: "Docs scattered, hard to trace" },
      { n: "05", name: "Flag ambiguous assets", severity: "pain", pain: "No system to track flags" },
      { n: "06", name: "Record and document", severity: "pain", pain: "100% manual, no structure" },
    ],
  },
];

const team = [
  { name: "Noah Howard", role: "PM", url: "https://www.linkedin.com/in/howard-noah/" },
  { name: "Adrian Thomas", role: "Engineering", url: "https://www.linkedin.com/in/adrianth/" },
  { name: "Bryan Ramires", role: "Engineering", url: "https://www.linkedin.com/in/bryanrg22/" },
];

const kpis = [
  { n: "15+", label: "user interviews", note: "across every role in the workflow" },
  { n: "4", label: "signed partners", note: "including CSSI" },
  { n: "#1", label: "Best Traction", note: "LavaLab F25 pitch competition" },
  { n: "4", label: "versions in 6 weeks", note: "each one broke an assumption" },
];

const takeaways: [string, string][] = [
  [
    "Design around a moment of need.",
    "The most meaningful impact came from focusing on the exact moment engineers lose confidence, when analysis outputs have to be validated and defended. Designing around that moment clarified what actually mattered and what didn't.",
  ],
  [
    "The versions were the research.",
    "V1 assumed AI could do the whole job. Each round of testing broke an assumption, so the final product was a series of forced corrections rather than a leap.",
  ],
  [
    "The details you overlook are the ones that matter most.",
    "I spent two weeks on branding alone and still almost got it wrong. Typography shapes a product's credibility more than I expected, and a font that feels neutral in isolation can make a B2B tool look untrustworthy to the exact people you are selling to.",
  ],
];

/** Wider than the usual measure, because the sidebar needs room beside it. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[72rem] px-6 md:px-10">{children}</div>
  );
}

export default function BasisPage() {
  return (
    <PageIn>
    <article>
      {/* ── HERO ─────────────────────────────────────── */}
      <Shell>
        <div className="pt-8">
          <BackToWork accent={A} />
        </div>
        <div className="flex flex-col gap-8 pt-6 lg:flex-row lg:items-stretch">
          {/* details card */}
          <Settle delay={0.06} className="w-full shrink-0 lg:w-[20rem]">
          <div className="h-full rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${M}/logo.webp`}
                alt="Basis"
                className="size-10 shrink-0 object-contain"
              />
              <span className="dot-code text-[14px] text-grey-90">BASIS</span>
              <span className="dot-code ml-auto text-[14px]" style={{ color: A }}>
                BK165
              </span>
            </div>

            <h1 className="mt-4 text-section font-semibold text-grey-90">
              An AI copilot for cost segregation engineers
            </h1>
            <p className="mt-3 text-caption text-grey-60">
              Reducing the manual burden of cost segregation without removing the
              judgment that makes it legally defensible.
            </p>

            <hr className="my-5 border-grey-10" />

            <dl className="space-y-4">
              <div>
                <dt className="label text-grey-40">Role</dt>
                <dd className="mt-1 text-caption text-grey-90">
                  Co-founder &amp; founding designer
                </dd>
              </div>
              <div>
                <dt className="label text-grey-40">Timeline</dt>
                <dd className="mt-1 text-caption text-grey-90">
                  Fall 2025 · 10 weeks
                </dd>
              </div>
              <div>
                <dt className="label text-grey-40">Team</dt>
                <dd className="mt-1 space-y-1.5">
                  {team.map((t) => (
                    <a
                      key={t.name}
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-caption"
                    >
                      <span style={{ color: "var(--color-blue)" }}>
                        {t.name} ↗
                      </span>
                      <span className="label text-grey-40">{t.role}</span>
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="label text-grey-40">Tools</dt>
                <dd className="mt-1 text-caption text-grey-90">
                  Figma · Cursor · Lovable
                </dd>
              </div>
            </dl>
          </div>
          </Settle>

          {/* cover, with the numbers sitting directly under it */}
          <Settle delay={0.15} className="flex min-w-0 flex-1 flex-col gap-4">
            <Figure
              src={`${M}/banner.mp4`}
              video
              poster={`${M}/banner-poster.webp`}
              ratio="1500/844"
              label="Basis"
              accent={A}
            />
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {kpis.map((k) => (
                <li
                  key={k.label}
                  className="rounded-[--radius-card] border border-grey-20 bg-grey-00 px-4 py-4"
                >
                  <p className="dot-code text-[26px]" style={{ color: A }}>
                    {k.n}
                  </p>
                  <p className="mt-1 text-caption font-medium text-grey-90">
                    {k.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-grey-40">
                    {k.note}
                  </p>
                </li>
              ))}
            </ul>
          </Settle>
        </div>
      </Shell>

      {/* ── BODY, sidebar beside the content ─────────── */}
      <Shell>
        <div className="mt-14 lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-14">
          <SideNav code="BASIS" sections={sections} accent={A} backToTop />

          <div className="min-w-0">
            {/* ── CONTEXT ────────────────────────────── */}
            <section id="context" className="scroll-mt-32">
              <SectionHead
                label="Context"
                takeaway="Ten weeks to find a problem and solve it."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                That is the entire brief at LavaLab, USC&apos;s student startup
                incubator. A co-founder&apos;s parent worked in cost segregation,
                which gave us a direct line to people who do the work every day.
                We took it.
              </p>
            </section>

            {/* ── PROBLEM ────────────────────────────── */}
            <section id="problem" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Problem"
                takeaway="A niche tax loophole, an aging workforce, and outdated systems."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                Cost segregation only applies in the U.S., and the specialists who
                do it are retiring with no pipeline behind them. Which leaves the
                cost of a single study sitting where it is:
              </p>

              {/* the number that made this worth building */}
              <ul className="mt-6 flex flex-wrap gap-3">
                {[
                  ["2-3 weeks", "to complete one study"],
                  ["~$1,200", "per residential study"],
                  ["almost all", "of it done by hand"],
                ].map(([n, t]) => (
                  <li
                    key={t}
                    className="flex-1 rounded-[--radius-card] border px-5 py-4"
                    style={{
                      borderColor: "rgba(53,101,77,0.28)",
                      background: "rgba(53,101,77,0.05)",
                      minWidth: "11rem",
                    }}
                  >
                    <p
                      className="text-sub font-semibold tracking-[-0.01em]"
                      style={{ color: A }}
                    >
                      {n}
                    </p>
                    <p className="mt-1 text-caption text-grey-60">{t}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <WorkflowDiagram
                  views={workflow}
                  accent={A}
                  logo={`${M}/logo.webp`}
                />
              </div>

              <p className="mt-8 text-body text-grey-60">
                The biggest constraint being:
              </p>
              <p className="mt-3 max-w-[54ch] text-body-lg leading-relaxed text-grey-90">
                <Mark tint={TINT}>
                  Every classification must be IRS-defensible, and a licensed
                  professional legally signs each study
                </Mark>
                . AI cannot.
              </p>

              {/* the design question */}
              <p className="mt-14 max-w-[46ch] text-sub font-semibold leading-[1.35] tracking-[-0.015em] text-grey-90">
                How might we reduce the manual burden of cost segregation without
                removing the professional judgment that makes it legally
                defensible?
              </p>
            </section>

            {/* ── RESEARCH ───────────────────────────── */}
            <section id="research" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Research"
                takeaway="We didn't know the intricacies. The people who did told us we had it wrong."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                So we asked nearly everyone in the workflow: retired specialists,
                engineers, photo organizers, sales leads, firm CEOs. Three
                findings rebuilt the product.
              </p>

              <ul className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  {
                    src: "v1-screen.webp",
                    label: "V1",
                    head: "V1 died on contact.",
                    body: "A retired specialist saw our fully automated prototype and killed it in one sentence: too many judgment calls, and a license signs every study. We reframed the product around traceability.",
                  },
                  {
                    src: "image-org.webp",
                    label: "Reality",
                    head: "The bottleneck was evidence, not analysis.",
                    body: "Some people's entire job is manually sorting property photos. That finding became the unified document view.",
                  },
                  {
                    src: "competition.webp",
                    label: "Landscape",
                    head: "Trust had to be designed, not assumed.",
                    body: "Engineers feared replacement, firms feared data leaks. SegStream is dense with no AI, Segmenti is AI with no human review. Override and approval became prominent by design.",
                  },
                ].map((f) => (
                  <li key={f.head} className="group">
                    <Figure src={`${M}/${f.src}`} ratio="4/3" label={f.label} accent={A} />
                    <h3 className="mt-4 text-sub font-medium leading-snug text-grey-90">
                      {f.head}
                    </h3>
                    <p className="mt-2 text-body text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                      {f.body}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-7 max-w-[52ch] text-body-lg leading-relaxed text-grey-90">
                <Mark tint={TINT}>
                  Engineers needed to see that Basis made them better at their job,
                  not redundant.
                </Mark>
              </p>
            </section>

            {/* ── ITERATIONS ─────────────────────────── */}
            <section id="iterations" className="scroll-mt-32 pt-16">
              <SectionHead
                label="Iterations"
                takeaway="Design wasn't done in Figma. We prototyped fast, tested, and broke our own assumptions."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                Four versions in six weeks. Each one was built, put in front of
                real engineers, and broken in ways we did not expect. Two features
                took the most rework.
              </p>

              <div className="group mt-12">
                <h3 className="text-sub font-medium text-grey-90">
                  Image organization
                </h3>
                <p className="mt-2 max-w-[64ch] text-body text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                  From a flat file list to an annotatable image workspace.
                </p>
                {/* two up on a phone: one screen per row made the version
                    story a scroll rather than a comparison */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                  <Figure
                    src={`${M}/f1v1.webp`}
                    ratio="4/3"
                    label="V1"
                    caption="Flat list. No structure, no way to tell photos from appraisals."
                    accent={A}
                  />
                  <Figure
                    src={`${M}/f1v2.webp`}
                    ratio="4/3"
                    label="V2"
                    caption="Room-based categories, drag between rooms, unassigned tracked."
                    accent={A}
                  />
                  <Figure
                    src={`${M}/sol1.mp4`}
                    video
                    ratio="4/3"
                    label="Final"
                    caption="Annotate inline. AI identifies objects with confidence scores."
                    accent={A}
                  />
                </div>
              </div>

              <div className="group mt-14">
                <h3 className="text-sub font-medium text-grey-90">
                  Asset verification
                </h3>
                <p className="mt-2 max-w-[64ch] text-body text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                  From one asset at a time to a full verification workspace.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                  <Figure
                    src={`${M}/f2v1.webp`}
                    ratio="4/3"
                    label="V1"
                    caption="One asset. Name and value only."
                    accent={A}
                  />
                  <Figure
                    src={`${M}/f2v2.webp`}
                    ratio="4/3"
                    label="V2"
                    caption="Docs below the form, still heavy scrolling."
                    accent={A}
                  />
                  <Figure
                    src={`${M}/f2v3.webp`}
                    ratio="4/3"
                    label="Sketch"
                    caption="The layout itself was the problem."
                    accent={A}
                  />
                  <Figure
                    src={`${M}/f2v4.webp`}
                    ratio="4/3"
                    label="Final"
                    caption="Classification left, evidence right, IRS rules inline."
                    accent={A}
                  />
                </div>
              </div>
            </section>

            {/* ── SOLUTION ───────────────────────────── */}
            <section
              id="solution"
              className="mt-20 scroll-mt-32 rounded-[--radius-panel] bg-[#f2f5f2] p-6 md:p-10"
            >
              <SectionHead
                label="Solution"
                takeaway="AI does the sorting. The engineer keeps the judgment, and stays visibly in charge."
                accent={A}
              />
              <p className="mt-3 text-body text-grey-60">
                Basis analyzes property documents and generates structured,
                traceable asset classifications, built for engineers at small and
                mid-size firms. Three decisions carry the whole product.
              </p>
              <p className="mt-4 max-w-[52ch] text-body-lg leading-relaxed text-grey-90">
                <Mark tint={TINT}>
                  Every classification traces back to the document it came from.
                </Mark>
              </p>

              {/* Two columns from md up, alternating sides so three blocks in a
                  row don't march. Below md there is only one column, so it
                  stacks: heading, sentence, then the video. */}
              <div className="mt-10 space-y-12 md:space-y-14">
                {[
                  {
                    head: "Human in the loop",
                    body: "Review, override, and approval checkpoints at every stage. The engineer is always the final authority, visibly.",
                    src: "sol1.mp4",
                  },
                  {
                    head: "One view for everything",
                    body: "Photos, appraisals, sketches, and IRS references in a single interface. No more validating one decision across four tools.",
                    src: "sol2.mp4",
                    flip: true,
                  },
                  {
                    head: "Automate the redundant",
                    body: "Extraction, room classification, evidence organization. AI takes the sorting, engineers keep the judgment.",
                    src: "sol3.mp4",
                  },
                ].map((d) => (
                  <div
                    key={d.head}
                    className="group grid items-center gap-6 md:grid-cols-2 md:gap-8"
                  >
                    <div className={d.flip ? "md:order-last" : undefined}>
                      <h3 className="text-sub font-medium text-grey-90">
                        {d.head}
                      </h3>
                      <p className="mt-2.5 text-body text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                        {d.body}
                      </p>
                    </div>
                    <Figure
                      src={`${M}/${d.src}`}
                      video
                      ratio="12/7"
                      contain
                      accent={A}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── TAKEAWAYS ──────────────────────────── */}
            <section id="takeaways" className="scroll-mt-32 pt-16">
              <SectionHead label="Takeaways" accent={A} />
              <Takeaways items={takeaways} accent={A} />

              {/* demo day */}
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <HoverFigure
                  src={`${M}/impact1.webp`}
                  caption="Grateful to our mentors for all the help!"
                />
                <HoverFigure
                  src={`${M}/impact2.webp`}
                  caption="Team when we won best traction"
                />
                <HoverFigure
                  src={`${M}/impact3.webp`}
                  caption="Our PM presenting on demo day!"
                />
              </div>
              <p className="mt-3.5">
                <a
                  href="https://www.figma.com/proto/gXwEi7JwVgPp2HYtYaGySx/Design-and-PM?node-id=1525-40401&scaling=scale-down-width&content-scaling=fixed&page-id=1525%3A39996&starting-point-node-id=1525%3A74061"
                  target="_blank"
                  rel="noreferrer"
                  className="text-caption text-grey-60 underline-offset-4 hover:text-grey-90 hover:underline"
                >
                  The pitch deck we presented on demo day ↗
                </a>
              </p>
            </section>

            {/* ── CLOSING ────────────────────────────── */}
            <section className="pt-16">
              <SectionHead label="This is the short version" accent={A} />
              <p className="mt-5 max-w-[60ch] text-body text-grey-60">
                Every section here has more behind it: the research, the
                iterations, the dead ends. If you are interested in the long version, let&apos;s get in touch.
              </p>
              <div className="mt-6">
                <ContactButton accent={A} />
              </div>

            </section>
          </div>
        </div>
      </Shell>

      <NextFlight
        href="/synechron"
        code="SYNECHRON"
        flight="SE561"
        title="Process intelligence for banks, and an AI skill for the whole firm"
        accent="var(--color-blue)"
        logo="/media/synechron/logo.webp"
      />
    </article>
    </PageIn>
  );
}
