export type PublicPage =
  | "landing"
  | "how-it-works"
  | "marketplace"
  | "ai-assistant"
  | "logistics"
  | "about"
  | "contact";

export type WorkspaceTab = "farmer" | "buyer" | "driver" | "warehouse" | "admin";

export type AppView = PublicPage | WorkspaceTab;

export const PUBLIC_PAGES: PublicPage[] = [
  "landing",
  "how-it-works",
  "marketplace",
  "ai-assistant",
  "logistics",
  "about",
  "contact",
];

export function isPublicPage(view: AppView): view is PublicPage {
  return (PUBLIC_PAGES as string[]).includes(view);
}

export const PUBLIC_NAV_LINKS: { id: PublicPage; label: string }[] = [
  { id: "how-it-works", label: "How It Works" },
  { id: "marketplace", label: "Marketplace" },
  { id: "ai-assistant", label: "AI Assistant" },
  { id: "logistics", label: "Logistics" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
