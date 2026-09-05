import Link from "next/link";
import { site } from "@/lib/site";
import Plane from "./Plane";
import Clocks from "./Clocks";

const here = [
  { href: "/", label: "home" },
  { href: "/synechron", label: "synechron" },
  { href: "/basis", label: "basis" },
  { href: "/layovers", label: "layovers" },
  { href: "/about", label: "about" },
];

export default function Footer() {
  return (
    <footer className="mt-24 w-full bg-gradient-to-br from-[#131c33] via-[#1e2d50] to-[#293c62] text-grey-00">
      <div className="w-full px-6 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* left */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-title font-semibold text-white">
                {site.signoff}
              </h2>
              <Plane width={54} tone="peri" climb={-22} />
            </div>
            <Clocks tone="dark" />
          </div>

          {/* right */}
          <div className="flex gap-14">
            <nav>
              <p className="label" style={{ color: "var(--color-peri)" }}>
                Here
              </p>
              <ul className="mt-3 space-y-2.5">
                {here.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-caption text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav>
              <p className="label" style={{ color: "var(--color-marigold)" }}>
                Elsewhere
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  { href: site.linkedin, label: "linkedin" },
                  { href: `mailto:${site.email}`, label: "email" },
                  { href: site.beli, label: "beli" },
                  { href: site.instagram, label: "instagram" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-caption text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-5">
          <p className="label text-white/45">
            © {site.name} {new Date().getFullYear()}
          </p>
          <p className="label text-white/45">
            Last updated {site.lastUpdated}
          </p>
        </div>
      </div>
    </footer>
  );
}
