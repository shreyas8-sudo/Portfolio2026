"use client";

import { useState } from "react";
import Link from "next/link";
import CaseCover from "./CaseCover";

export default function CaseTile({
  id,
  company,
  companyMobile,
  role,
  roleMobile,
  status,
  statusMobile,
  statusColor,
  title,
  href,
  cover,
}: {
  id?: string;
  company: string;
  companyMobile?: string;
  role: string;
  roleMobile?: string;
  status: string;
  statusMobile?: string;
  statusColor: string;
  title: string;
  href?: string;
  cover: { poster: string; video?: string };
}) {
  const [hover, setHover] = useState(false);

  const shell =
    "group flex flex-col overflow-hidden border border-grey-20 bg-grey-00 transition-[transform,box-shadow,border-color] duration-[--dur-base] ease-[--ease-move] hover:-translate-y-[3px] hover:border-grey-40 hover:shadow-[0_2px_8px_rgba(19,28,51,0.05)]";

  const inner = (
    <>
      <CaseCover
        poster={cover.poster}
        video={cover.video}
        flight=""
        code=""
        accent={statusColor}
        playing={hover}
      />
      <div className="flex flex-1 flex-col px-4 py-3.5 sm:px-5 sm:py-4">
        {/* meta row */}
        <div className="flex items-center justify-between gap-2">
          <p className="label text-grey-60">
            <span className="text-grey-90">
              {companyMobile ? (
                <>
                  <span className="sm:hidden">{companyMobile}</span>
                  <span className="hidden sm:inline">{company}</span>
                </>
              ) : company}
            </span>
            {" · "}
            {roleMobile ? (
              <>
                <span className="sm:hidden">{roleMobile}</span>
                <span className="hidden sm:inline">{role}</span>
              </>
            ) : role}
          </p>
          <p className="label whitespace-nowrap" style={{ color: statusColor }}>
            {statusMobile ? (
              <>
                <span className="sm:hidden">{statusMobile}</span>
                <span className="hidden sm:inline">{status}</span>
              </>
            ) : status}
          </p>
        </div>

        {/* title */}
        <p className="mt-2 text-[20px] font-semibold leading-snug tracking-tight text-grey-90 sm:text-[22px]">
          {title}
          {href && (
            <span>
              {" "}
              <span style={{ color: "var(--color-blue)" }}>↗</span>
            </span>
          )}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        id={id}
        href={href}
        className={shell}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div id={id} className={shell}>
      {inner}
    </div>
  );
}
