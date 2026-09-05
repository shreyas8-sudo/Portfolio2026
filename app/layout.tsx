import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono, Doto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const doto = Doto({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-doto",
  display: "swap",
});

const SITE_URL = "https://shreyashanmugam.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shreya Shanmugam, product designer",
    template: "%s, Shreya Shanmugam",
  },
  description:
    "Product designer making complex systems feel simple. Currently designing at Synechron, previously co-founder at Basis.",
  openGraph: {
    title: "Shreya Shanmugam, product designer",
    description: "Product designer making complex systems feel simple.",
    url: SITE_URL,
    siteName: "Shreya Shanmugam",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreya Shanmugam, product designer",
    description: "Product designer making complex systems feel simple.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${plexMono.variable} ${doto.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-grey-90 focus:px-4 focus:py-2 focus:text-grey-00"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
