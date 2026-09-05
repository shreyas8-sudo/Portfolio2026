import Link from "next/link";
import Hero from "@/components/Hero";
import CaseCard from "@/components/CaseCard";
import ArrowLink from "@/components/ArrowLink";
import { caseStudies, layovers } from "@/lib/site";

export default function Home() {
  const preview = layovers.slice(0, 4);

  return (
    <>
      <Hero />

      {/* SELECTED WORK */}
      <section className="container-content pt-20">
        <div className="flex items-center gap-4">
          <h2
            className="label text-[0.8125rem]"
            style={{ color: "var(--color-blue)" }}
          >
            Selected work
          </h2>
          <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
        </div>

        <div className="mt-8 space-y-8">
          {caseStudies.map((study) => (
            <CaseCard key={study.slug} study={study} />
          ))}
        </div>
      </section>

      {/* LAYOVERS TEASER */}
      <section className="container-content pt-24">
        <div className="flex items-center gap-4">
          <h2
            className="label text-[0.8125rem]"
            style={{ color: "var(--color-blue)" }}
          >
            A few layovers along the way
          </h2>
          <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
        </div>
        <p className="mt-4 text-body text-grey-60">
          Experiments, side projects, and things shipped for fun.
        </p>

        <ul className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
          {preview.map((item) => {
            const card = (
              <>
                <div className="aspect-[16/9] overflow-hidden bg-grey-05">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumb}
                    alt={item.name}
                    className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="label"
                      style={{ color: "var(--color-blue)" }}
                    >
                      {item.date}
                    </span>
                    <span
                      className="label"
                      style={{ color: "var(--color-orange)" }}
                    >
                      {item.origin}
                    </span>
                  </div>
                  <p className="mt-1.5 text-caption font-medium text-grey-90">
                    {item.name}
                  </p>
                </div>
              </>
            );

            const shell =
              "group block overflow-hidden rounded-[--radius-card] border border-grey-20 bg-grey-00 transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]";

            return (
              <li key={item.name}>
                {item.link ? (
                  <a
                    href={item.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={shell}
                  >
                    {card}
                  </a>
                ) : (
                  <Link href="/layovers" className={shell}>
                    {card}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-7">
          <ArrowLink href="/layovers">see all</ArrowLink>
        </div>
      </section>
    </>
  );
}
