import type { Metadata } from "next";
import LayoverGrid from "@/components/LayoverGrid";
import PageIn from "@/components/PageIn";
import Settle from "@/components/Settle";
import { layovers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Layovers",
  description:
    "Experiments, side projects, and things shipped for fun, the stuff between destinations.",
};

export default function LayoversPage() {
  return (
    <PageIn className="container-content block pt-16">
      <div className="flex items-center gap-4">
        <h1
          className="label text-[0.8125rem]"
          style={{ color: "var(--color-blue)" }}
        >
          Layovers
        </h1>
        <span className="h-px flex-1 bg-grey-20" aria-hidden="true" />
      </div>

      <Settle delay={0.04}>
        <h2 className="mt-6 max-w-[22ch] text-title font-semibold text-grey-90 md:max-w-none">
          Everything I make between destinations.
        </h2>
        <p className="mt-4 max-w-[62ch] text-body-lg text-grey-60">
          Experiments, client work, class projects, and the things I do when
          nobody&apos;s assigning them.
        </p>
      </Settle>

      <LayoverGrid items={layovers} />

      <p className="mt-12 text-caption text-grey-40">
        The list grows more or less every week.
      </p>
    </PageIn>
  );
}
