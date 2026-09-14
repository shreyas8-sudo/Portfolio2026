import type { Metadata } from "next";
import TravelMap from "@/components/TravelMap";
import TheRecord from "@/components/TheRecord";
import Headshot from "@/components/Headshot";
import PageIn from "@/components/PageIn";
import Settle from "@/components/Settle";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hyderabad to LA to New York, fine arts before Figma, business and design at USC, product design next.",
};

const stops = [
  {
    n: "01",
    head: "Where I've been",
    color: "var(--color-sky)",
    body: "Born in Michigan, brought up in Hyderabad. Fine arts before Figma. I studied art and design formally all through high school, so I had a foundation long before I had a tool.",
  },
  {
    n: "02",
    head: "Where I am",
    color: "var(--color-marigold)",
    body: "USC is where design and business stopped being separate things. Since then I've gone looking for dense problems, the kind where you learn the industry before you draw a single screen.",
  },
  {
    n: "03",
    head: "Where I'm going",
    color: "var(--color-blue)",
    body: "Full-time product design in 2027. Rooms that are leading change, and conversations that push me further than I'd get on my own.",
  },
];

export default function AboutPage() {
  return (
    <PageIn>
      {/* intro + headshot */}
      <section className="container-content pt-16">
        <div className="flex items-center gap-4">
          <h1
            className="label text-[0.8125rem]"
            style={{ color: "var(--color-blue)" }}
          >
            About
          </h1>
          <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-10 md:flex-row md:items-center">
          <Settle delay={0.04} className="flex-1">
            <h2 className="text-title font-semibold text-grey-90">
              Hi! I&apos;m Shreya Shanmugam.
            </h2>
            <p className="mt-3 text-body-lg text-grey-60">{site.tagline}</p>
          </Settle>
          <Settle delay={0.12} className="shrink-0">
            <Headshot />
          </Settle>
        </div>

        {/* three stops, introduced by the line that frames them */}
        <Settle delay={0.2}>
          <p className="mt-12 max-w-[56ch] text-body-lg text-grey-60">
            At a high level, here&apos;s where I&apos;ve been, where I am, and
            where I&apos;m going.
          </p>
        </Settle>
        {/* the cards land last, one after another, left to right */}
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {stops.map((s, i) => (
            <Settle
              key={s.n}
              as="li"
              delay={0.28 + i * 0.07}
              distance={14}
              className="group rounded-[--radius-card] border border-grey-20 bg-grey-00 px-5 py-5 transition-colors duration-300 hover:border-grey-40"
            >
              <div className="flex items-center gap-2.5">
                <span className="dot-code text-[13px]" style={{ color: s.color }}>
                  {s.n}
                </span>
                <span className="label text-grey-40">{s.head}</span>
              </div>
              <p className="mt-2.5 text-caption leading-relaxed text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
                {s.body}
              </p>
            </Settle>
          ))}
        </ul>
      </section>

      {/* map */}
      <section className="container-content pt-16">
        <p className="max-w-[56ch] text-body-lg text-grey-60">
          More specifically, this is my map.
        </p>
        <div className="mt-6">
          <TravelMap />
        </div>
      </section>

      {/* the record */}
      <section className="container-content pt-16">
        <div className="flex items-center gap-4">
          <h3
            className="label text-[0.8125rem]"
            style={{ color: "var(--color-blue)" }}
          >
            The record
          </h3>
          <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
        </div>
        <TheRecord />
      </section>
    </PageIn>
  );
}
