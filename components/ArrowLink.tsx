"use client";

import Link from "next/link";
import Arrow from "./Arrow";

/**
 * Any link that ends in a diagonal arrow.
 * On hover the arrow's tail extends, the line grows out from the text.
 * Used site-wide so the gesture is consistent.
 */
export default function ArrowLink({
  href,
  children,
  color = "var(--color-blue)",
  external = false,
  className = "",
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  color?: string;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span>{children}</span>
      <Arrow color={color} />
    </>
  );

  const cls = `arrow-link ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cls}
        style={{ color }}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} style={{ color }} onClick={onClick}>
      {inner}
    </Link>
  );
}
