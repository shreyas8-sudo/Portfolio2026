import Hero from "@/components/Hero";
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

          {/* 2 -- Basis */}
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

          {/* 3 -- Disney (no link yet) */}
          <div
            id="disney"
            className="flex flex-col overflow-hidden border border-grey-20 bg-grey-00"
          >
            {/* cover */}
            <div
              className="relative aspect-[16/9] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #b3c3e5, #6c9fde, #3d6bc4)",
                backgroundSize: "300% 300%",
                animation: "disney-drift 14s ease-in-out infinite",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                style={{
                  animation: "title-float 6s ease-in-out infinite",
                }}
              >
                <p
                  className="px-4 text-[1.75rem] font-semibold leading-tight tracking-tight text-white sm:text-[2.25rem]"
                  style={{ textShadow: "0 1px 8px rgba(19,28,51,0.25)" }}
                >
                  Disney Experiences
                </p>
                <p className="label mt-2 text-white/80">CASE STUDY COMING SOON</p>
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
              <p className="mt-2 text-[20px] font-semibold leading-snug tracking-tight text-grey-90 sm:text-[22px]">
                Unifying Disney&apos;s fragmented experience offerings into one place
              </p>
            </div>
          </div>

          {/* 4 -- Layovers wallet */}
          <WalletTile />
        </div>
      </section>
    </>
  );
}
