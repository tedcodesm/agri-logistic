export type PublicPage =
  | "landing"
  | "how-it-works"
  | "marketplace"
  | "ai-assistant"
  | "logistics"
  | "about"
  | "contact";

export const PUBLIC_ROUTES: Record<PublicPage, string> = {
  landing: "/",
  "how-it-works": "/how-it-works",
  marketplace: "/marketplace",
  "ai-assistant": "/ai-assistant",
  logistics: "/logistics",
  about: "/about",
  contact: "/contact",
};

export function publicPageFromPath(pathname: string): PublicPage {
  const entry = Object.entries(PUBLIC_ROUTES).find(([, path]) => path === pathname);
  return (entry?.[0] as PublicPage) ?? "landing";
}

export const PUBLIC_NAV_LINKS: { id: PublicPage; label: string }[] = [
  { id: "how-it-works", label: "How It Works" },
  { id: "marketplace", label: "Marketplace" },
  { id: "ai-assistant", label: "AI Assistant" },
  { id: "logistics", label: "Logistics" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
