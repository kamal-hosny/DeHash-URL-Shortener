import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Link {
  id: string;
  name?: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

interface LinkState {
  links: Link[];
  addLink: (link: Link) => void;
  removeLink: (id: string) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  setLinks: (links: Link[]) => void;
  incrementClicks: (shortCode: string) => void;
}

// Initial mock links
const mockLinks: Link[] = [
  {
    id: "g43eq0",
    name: "Google Homepage",
    originalUrl: "https://google.com",
    shortCode: "g43eq0",
    clicks: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "1",
    name: "Next.js Tutorial Guide",
    originalUrl: "https://www.google.com/search?q=nextjs+tutorial",
    shortCode: "nx-tut",
    clicks: 1250,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    name: "Shadcn UI Components",
    originalUrl: "https://github.com/shadcn-ui/ui",
    shortCode: "shadcn",
    clicks: 856,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "3",
    name: "Vercel Postgres Documentation",
    originalUrl: "https://vercel.com/docs/storage/vercel-postgres/quickstart",
    shortCode: "v-pg",
    clicks: 42,
    isActive: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

export const useLinkStore = create<LinkState>()(
  persist(
    (set) => ({
      links: mockLinks,
      addLink: (link) =>
        set((state) => {
          // Avoid duplicate codes
          const filtered = state.links.filter(
            (l) => l.shortCode.toLowerCase() !== link.shortCode.toLowerCase()
          );
          return { links: [link, ...filtered] };
        }),
      removeLink: (id) =>
        set((state) => ({
          links: state.links.filter((l) => l.id !== id),
        })),
      updateLink: (id, updates) =>
        set((state) => ({
          links: state.links.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      setLinks: (links) => set({ links }),
      incrementClicks: (shortCode) =>
        set((state) => ({
          links: state.links.map((l) =>
            l.shortCode.toLowerCase() === shortCode.toLowerCase()
              ? { ...l, clicks: (l.clicks || 0) + 1 }
              : l
          ),
        })),
    }),
    {
      name: "dehash-links-storage",
    }
  )
);
