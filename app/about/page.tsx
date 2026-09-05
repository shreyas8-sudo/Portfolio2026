import type { Metadata } from "next";
import TravelMap from "@/components/TravelMap";
import TheRecord from "@/components/TheRecord";
import Headshot from "@/components/Headshot";
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
    <>
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

        <div className="mt-8 flex flex-col items-start gap-10 md:flex-row md:items-center">
          <div className="flex-1">
            <h2 className="text-title font-semibold text-grey-90">
              Hi! I&apos;m Shreya Shanmugam.
            </h2>
            <p className="mt-3 text-body-lg text-grey-60">{site.tagline}</p>
            <p className="mt-4 max-w-[56ch] text-body text-grey-40">
              At a high level, here&apos;s where I&apos;ve been, where I am, and
              where I&apos;m going.
            </p>
          </div>
          <Headshot />
        </div>

        {/* three stops */}
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {stops.map((s) => (
            <li
              key={s.n}
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
            </li>
          ))}
        </ul>
      </section>

      {/* map */}
      <section className="container-content pt-16">
        <h3 className="text-section font-semibold text-grey-90">
          More specifically, this is my map.
        </h3>
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
    </>
  );
}
