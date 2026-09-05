"use client";

/**
 * Opens the contact pass that lives in the nav.
 *
 * The pass is owned by Nav, so instead of duplicating it or lifting state up
 * through the whole tree, any page can ask for it with one event.
 */
export const OPEN_CONTACT = "open-contact";

export function openContact() {
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT));
}

export default function ContactButton({
  accent,
  children = "Get in touch",
}: {
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={openContact}
      className="rounded-[--radius-sharp] px-5 py-3 text-caption font-medium text-white transition-opacity duration-200 hover:opacity-90"
      style={{ background: accent }}
    >
      {children}
    </button>
  );
}
