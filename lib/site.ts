/* ============================================================
   SITE CONTENT
   All copy lives here so pages stay structural.
   ============================================================ */

export const site = {
  name: "Shreya Shanmugam",
  tagline: "Designing to make complex systems feel simple.",
  email: "shreyas8@usc.edu",
  linkedin: "https://www.linkedin.com/in/shreyaa-shanmugam",
  beli: "https://beliapp.co/app/snackitupwshrey",
  instagram: "https://instagram.com/", // TODO: confirm URL
  status: "Open to full-time · 2027",
  signoff: "See you at the next gate.",
  lastUpdated: "Aug 2026",
} as const;

/* --- landing hero waypoints (left / bottom / right of the name) --- */
export type Waypoint = {
  id: string;
  position: "left" | "bottom" | "right";
  kicker: string;
  label: string;
  detail: string;
  color: "sky" | "marigold" | "blue";
};

export const waypoints: Waypoint[] = [
  {
    id: "hyd",
    position: "left",
    kicker: "",
    label: "Previously in Hyderabad",
    detail: "",
    color: "sky",
  },
  {
    id: "lax",
    position: "bottom",
    kicker: "",
    label: "Now in Los Angeles",
    detail: "",
    color: "marigold",
  },
  {
    id: "next",
    position: "right",
    kicker: "",
    label: "Looking for what's next",
    detail: "",
    color: "blue",
  },
];

/* --- credential line under the tagline --- */
export const credentials = [
  { n: "1", text: "Product design @ Synechron", color: "blue" },
  { n: "2", text: "Co-founder @ Basis", color: "sky" },
  { n: "3", text: "Business + Design @ USC", color: "marigold" },
] as const;

/* --- case studies --- */
export type CaseStudy = {
  slug: string;
  code: string;
  flight: string;
  title: string;
  summary: string;
  origin: string;
  status: string;
  year: string;
  accent: string;
  /** video is optional, a still-only cover is fine */
  cover: { poster: string; video?: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "synechron",
    code: "SYNECHRON",
    flight: "SE561",
    title: "Process intelligence for banks, and an AI skill for the whole firm",
    summary:
      "Two seats, one summer: a platform designed under enterprise constraints, and a spec skill now used by engineers across the firm.",
    origin: "Client · Enterprise",
    status: "Shipped",
    year: "2026",
    accent: "var(--color-synechron)",
    cover: {
      poster: "/media/synechron/banner-poster.webp",
      video: "/media/synechron/banner.mp4",
    },
  },
  {
    slug: "basis",
    code: "BASIS",
    flight: "BK165",
    title: "An AI copilot for cost segregation engineers",
    summary:
      "Co-founded and designed in 10 weeks: 15+ interviews, 4 signed partners, #1 Best Traction at LavaLab.",
    origin: "Personal · Startup",
    status: "Shipped",
    year: "2025",
    accent: "var(--color-basis)",
    cover: {
      poster: "/media/basis/banner.webp",
    },
  },
];

/* --- layovers --- */
export type Layover = {
  flight: string;
  name: string;
  origin: "Personal" | "Client" | "Academic";
  status: "Shipped" | "Concept" | "Ongoing" | "Runner-up";
  date: string;
  blurb: string;
  link?: { label: string; href: string };
  /** still image, /media/layovers/<name>.webp */
  thumb: string;
  /** optional loop that plays on hover, /media/layovers/<name>.mp4 */
  video?: string;
};

export const layovers: Layover[] = [
  {
    flight: "PN101",
    name: "peinao",
    origin: "Personal",
    status: "Shipped",
    date: "Summer 2026",
    blurb:
      "a menu analyser for allergens, a side project with a friend, built and shipped inside a week. i designed it, coded the front end, and put it online.",
    link: { label: "live site", href: "https://peinao.vercel.app/" },
    thumb: "/media/layovers/peinao.webp",
  },
  {
    flight: "SP024",
    name: "spotify widgets",
    origin: "Academic",
    status: "Concept",
    date: "Fall 2025",
    blurb:
      "a 24-hour design challenge: widgets that make a music streaming app customisable and easier to search. rapid ideation to prototype in one day.",
    link: { label: "the deck", href: "https://www.figma.com/deck/EpOi5smT18EfI0x6vkYyU7/ShreyaS_LavaLabs-Design-Challenge?node-id=1-113&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1" },
    thumb: "/media/layovers/spotify.webp",
  },
  {
    flight: "FF302",
    name: "fly fearless",
    origin: "Client",
    status: "Shipped",
    date: "Summer 2025",
    blurb:
      "an internship spent rebuilding a website, branding, navigation, and accessibility, tested with real users.",
    thumb: "/media/layovers/fly-fearless.webp",
  },
  {
    flight: "DA118",
    name: "designathon",
    origin: "Academic",
    status: "Runner-up",
    date: "Spring 2026",
    blurb:
      "CreateSC: made an analogue experience digital. placed runner-up in the Framer track.",
    link: { label: "devpost", href: "https://devpost.com/software/letters-to-your-future-self" },
    thumb: "/media/layovers/designathon.webp",
  },
  {
    flight: "FN205",
    name: "adaptable furniture",
    origin: "Academic",
    status: "Shipped",
    date: "Spring 2026",
    blurb:
      "designed and shipped a website for an innovative piece of furniture.",
    link: { label: "github", href: "https://github.com/xl0u1sx/Adaptable-Furniture-Website" },
    thumb: "/media/layovers/adaptable-furniture.webp",
  },
  {
    flight: "AR440",
    name: "virtual coffee shop",
    origin: "Academic",
    status: "Concept",
    date: "Spring 2026",
    blurb:
      "an AR/VR build bringing my two favourite things together: coffee and UX.",
    link: {
      label: "the walkthrough",
      href: "https://drive.google.com/file/d/1hI8ek4EWsFlLlbvfx8jZCU0eX6Lfs8eq/view?usp=sharing",
    },
    thumb: "/media/layovers/arvr.webp",
    video: "/media/layovers/arvr.mp4",
  },
  {
    flight: "NB218",
    name: "neoboard",
    origin: "Client",
    status: "Shipped",
    date: "Summer 2025",
    blurb:
      "an internship working on a faculty dashboard for education technology.",
    thumb: "/media/layovers/neoboard.webp",
  },
  {
    flight: "IR077",
    name: "irvins",
    origin: "Client",
    status: "Shipped",
    date: "Spring 2026",
    blurb:
      "a slide deck built from initial research, as a strategy consultant for them.",
    link: { label: "the deck", href: "https://www.figma.com/proto/SCYh86VkthPFwhs3GGaAoj/Irvins?node-id=1-2" },
    thumb: "/media/layovers/irvins.webp",
  },

  /* the personal ones close the page */
  {
    flight: "DN004",
    name: "dance",
    origin: "Personal",
    status: "Ongoing",
    date: "always",
    blurb:
      "trained in multiple styles, competed on a team for a while, and now i find a class wherever i am, hyderabad, la, even new york.",
    thumb: "/media/layovers/dance.webp",
  },
  {
    flight: "FD012",
    name: "food",
    origin: "Personal",
    status: "Ongoing",
    date: "always",
    blurb:
      "recently started properly appreciating food through my beli. just finished my 10th week.",
    link: { label: "follow along", href: "https://beliapp.co/app/snackitupwshrey" },
    thumb: "/media/layovers/beli.webp",
  },
];

/* --- travel map: every place since starting college --- */
export type Place = {
  name: string;
  lat: number;
  lon: number;
  date: string;
  caption: string;
  /** one photo, or several, extras show as thumbnails you can switch between */
  photo: string | string[];
  /** the places I've actually lived, get a home marker */
  home?: boolean;
};

/* Every stop since starting college.
   `date` = when. `caption` = why it mattered, in your voice.
   Captions marked "" still need one line from you. */
export const places: Place[] = [
  // ── lived here ──
  { name: "Hyderabad", lat: 17.385, lon: 78.4867, date: "home", caption: "Forever making coffee, eating, and playing yet another version of imposter.", photo: "/media/places/home.webp", home: true },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, date: "2025 onwards", caption: "USC ✌️ Found my design communities here.", photo: "/media/places/la-1.webp", home: true },
  { name: "Bloomington", lat: 39.1653, lon: -86.5264, date: "Fall '23 to Fall '24", caption: "Had the best time being a Hoosier 🔱 for my first three semesters.", photo: ["/media/places/indiana.webp", "/media/places/indiana-bloom.webp"], home: true },

  // ── india ──
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, date: "every year", caption: "Routine visits to my grandparents' house. Book thrifting, momos, and Corner House ice cream, without fail.", photo: "/media/places/banglore.webp" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, date: "Summer 2026", caption: "Wedding season.", photo: "/media/places/chennai.webp" },
  { name: "Kerala", lat: 9.9312, lon: 76.2673, date: "Summer 2025", caption: "First time hiking in the rain. 🌧️", photo: "/media/places/kerala.webp" },

  // ── europe ──
  { name: "Paris", lat: 48.8566, lon: 2.3522, date: "Summer 2024", caption: "Got scammed, but the food made up for it.", photo: "/media/places/paris.webp" },
  { name: "Rome", lat: 41.9028, lon: 12.4964, date: "Summer 2024", caption: "Felt like a gladiator in the ruins.", photo: "/media/places/rome.webp" },
  { name: "Amalfi Coast", lat: 40.634, lon: 14.6027, date: "Summer 2024", caption: "My favourite part of Europe. I'd go back tomorrow if I could.", photo: ["/media/places/amalfi-coast.webp", "/media/places/amalfi-coast-1.webp"] },

  // ── middle east ──
  { name: "Dubai", lat: 25.2048, lon: 55.2708, date: "December 2025", caption: "Sand boarding in the dunes.", photo: "/media/places/dubai.webp" },

  // ── us ──
  { name: "New York", lat: 40.7128, lon: -74.006, date: "Summer 2026", caption: "Eight weeks at Synechron, and a lot of walking.", photo: ["/media/places/new-york.webp", "/media/places/new-york-1.webp", "/media/places/new-york-2.webp"] },
  { name: "Chicago", lat: 41.8781, lon: -87.6298, date: "Thanksgiving 2025", caption: "Christmas markets were all we could do in the middle of a blizzard 🥲", photo: "/media/places/chicago.webp" },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, date: "recurring", caption: "Visiting family, and most recently the thrift scene.", photo: "/media/places/san-fransico.webp" },
  { name: "Urbana-Champaign", lat: 40.1106, lon: -88.2073, date: "over the years", caption: "Friends first, now my brother. I think I'm a Green Street expert now 🤔", photo: "/media/places/urbana-champaign.webp" },
  { name: "Boston", lat: 42.3601, lon: -71.0589, date: "Thanksgiving 2024", caption: "When the girls trip made it out of the gc.", photo: "/media/places/boston.webp" },
  { name: "Austin", lat: 30.2672, lon: -97.7431, date: "Spring break 2024", caption: "A really fun hike, plus the interactive art galleries.", photo: ["/media/places/austin.webp", "/media/places/austin-1.webp"] },
  { name: "Nashville", lat: 36.1627, lon: -86.7816, date: "Spring break 2025", caption: "Saw the Vanderbilt campus.", photo: "/media/places/vanderbilt.webp" },
  { name: "Pigeon Forge", lat: 35.7884, lon: -83.5543, date: "Spring break 2025", caption: "Hiked high enough to find snow, even in late March.", photo: "/media/places/pigeon-forge.webp" },
  { name: "Santa Barbara", lat: 34.4208, lon: -119.6982, date: "Spring break 2026", caption: "My favourite part of California so far. A good place to slow down.", photo: "/media/places/santa-barbra.webp" },

  // ── dance competitions (no photos yet) ──
  { name: "Houston", lat: 29.7604, lon: -95.3698, date: "2024", caption: "Dance competition at UH.", photo: "/media/places/houston.webp" },
  { name: "West Lafayette", lat: 40.4237, lon: -86.9212, date: "2024", caption: "Dance competition at Purdue.", photo: "/media/places/purdue.webp" },
  { name: "Atlanta", lat: 33.749, lon: -84.388, date: "2025", caption: "Dance competition at GTech.", photo: "/media/places/atlanta.webp" },
  { name: "Goa", lat: 15.2993, lon: 74.124, date: "recurring", caption: "My go-to vacation spot.", photo: "/media/places/goa.webp" },
];

export const navLinks = [
  { href: "/layovers", label: "layovers" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;
