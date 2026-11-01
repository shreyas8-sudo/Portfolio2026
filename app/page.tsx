import Image from "next/image";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import CaseTile from "@/components/CaseTile";
import WalletTile from "@/components/WalletTile";
import { caseStudies } from "@/lib/site";

const synechron = caseStudies.find((c) => c.slug === "synechron")!;
const basis     = caseStudies.find((c) => c.slug === "basis")!;

export default function Home() {
  return (
    <>
      <Hero />

      {/* 2x2 WORK GRID */}
      <section id="work" className="container-content scroll-mt-20 pt-20">
        <div className="flex items-center gap-4">
          <h2
            className="label text-[0.8125rem]"
            style={{ color: "var(--color-blue)" }}
          >
            Selected work
          </h2>
          <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* 1 -- Synechron */}
          <Reveal delay={0} className="h-full">
            <CaseTile
              id="synechron"
              company="Synechron"
              role="Product design intern"
              roleMobile="Product design"
              status="✈ SHIPPED 2026"
              statusMobile="✈ 2026"
              statusColor="var(--color-orange)"
              title="Designed process intelligence for banks, and shipped a spec skill engineers now use"
              href="/synechron"
              cover={synechron.cover}
            />
          </Reveal>

          {/* 2 -- Basis */}
          <Reveal delay={0.06} className="h-full">
            <CaseTile
              company="Basis"
              role="Co-founder, designer"
              status="✈ SHIPPED 2025"
              statusMobile="✈ 2025"
              statusColor="var(--color-orange)"
              title="Co-founded an AI copilot for cost segregation engineers, and won Best Traction"
              href="/basis"
              cover={basis.cover}
            />
          </Reveal>

          {/* 3 -- Disney (no link yet) */}
          <Reveal delay={0.12} className="h-full">
            <div
              id="disney"
              className="flex h-full flex-col overflow-hidden border border-grey-20 bg-grey-00"
            >
              {/* cover -- matches Figma node 274:397 */}
              <div
                className="relative aspect-[16/9] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(142.98deg, #b3c3e5 14.29%, #6c9fde 53.57%, #3d6bc4 85.71%)",
                }}
              >
                {/* Disney wordmark logo */}
                <div
                  className="absolute"
                  style={{ left: "25.34%", top: "-6.4%", width: "46.83%" }}
                >
                  <Image
                    src="/disney-logo.png"
                    alt="Disney"
                    width={207}
                    height={207}
                    className="pointer-events-none w-full object-contain"
                    priority
                  />
                </div>

                {/* "Experiences" + label -- floats gently */}
                <div
                  className="absolute flex flex-col items-center gap-[10px]"
                  style={{
                    left: "25.34%",
                    top: "50%",
                    animation: "title-float 6s ease-in-out infinite",
                  }}
                >
                  <p className="whitespace-nowrap text-[1.625rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#fcfcfb] sm:text-[2rem] md:text-[2.25rem]">
                    Experiences
                  </p>
                  <p className="label text-[rgba(252,252,251,0.8)]">
                    CASE STUDY COMING SOON
                  </p>
                </div>
              </div>

              {/* info */}
              <div className="flex flex-1 flex-col px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="label text-grey-60">
                    <span className="text-grey-90">
                      <span className="sm:hidden">Disney</span>
                      <span className="hidden sm:inline">Disney Experiences</span>
                    </span>
                    {" · "}via ProductSC
                  </p>
                  <p className="label whitespace-nowrap" style={{ color: "var(--color-marigold)" }}>
                    ◷ BOARDING DEC
                  </p>
                </div>
                <p className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.02em] text-grey-90 sm:text-[22px]">
                  Unifying Disney&apos;s fragmented experience offerings into one place
                </p>
              </div>
            </div>
          </Reveal>

          {/* 4 -- Layovers wallet */}
          <Reveal delay={0.18} className="h-full">
            <WalletTile />
          </Reveal>
        </div>
      </section>
    </>
  );
}
