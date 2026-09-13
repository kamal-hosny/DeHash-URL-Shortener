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

export const useLinkStore = create<LinkState>()(
  persist(
    (set) => ({
      links: [],
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
