"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import Logo from "./Logo";
import Clocks from "./Clocks";
import ContactPass from "./ContactPass";
import { OPEN_CONTACT } from "./ContactButton";

export default function Nav() {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);

  /* any page can open the pass, see components/ContactButton */
  useEffect(() => {
    const open = () => setContactOpen(true);
    window.addEventListener(OPEN_CONTACT, open);
    return () => window.removeEventListener(OPEN_CONTACT, open);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <nav className="w-full bg-grey-00/75 backdrop-blur-md">
          <div className="relative flex w-full items-center justify-between px-5 py-4 sm:px-6 md:px-10">
            <Link href="/" aria-label="Home" className="shrink-0">
              <Logo size={38} />
            </Link>

            {/* departure board, no frame, the dot grid is the frame */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
              <Clocks dot={1.5} gap={0.75} />
            </div>

            <ul className="flex items-center gap-5 sm:gap-8">
              {navLinks.map((link) => {
                const active = pathname.startsWith(link.href);

                /* contact opens the pass instead of navigating */
                /* contact opens the pass, "active" means the panel is open */
                if (link.href === "/contact") {
                  return (
                    <li key={link.href}>
                      <button
                        data-contact-trigger
                        data-active={contactOpen}
                        aria-expanded={contactOpen}
                        onClick={() => setContactOpen((v) => !v)}
                        className="nav-link"
                      >
                        <span className="text-grey-60 transition-colors duration-200">
                          {link.label}
                        </span>
                        <span className="nav-underline" aria-hidden="true" />
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      className="nav-link"
                    >
                      <span className="text-grey-60 transition-colors duration-200">
                        {link.label}
                      </span>
                      <span className="nav-underline" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        <div className="perforation w-full" aria-hidden="true" />
      </header>

      <ContactPass open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
