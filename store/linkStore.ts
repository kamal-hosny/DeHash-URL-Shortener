import { create } from 'zustand';

export interface Link {
    id: string;
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
}

// Mock data for initial state
const mockLinks: Link[] = [
    {
        id: '1',
        originalUrl: 'https://www.google.com/search?q=nextjs+tutorial',
        shortCode: 'nx-tut',
        clicks: 1250,
        isActive: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
        id: '2',
        originalUrl: 'https://github.com/shadcn-ui/ui',
        shortCode: 'shadcn',
        clicks: 856,
        isActive: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
    {
        id: '3',
        originalUrl: 'https://vercel.com/docs/storage/vercel-postgres/quickstart',
        shortCode: 'v-pg',
        clicks: 42,
        isActive: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    },
];

export const useLinkStore = create<LinkState>((set) => ({
    links: mockLinks,
    addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
    removeLink: (id) => set((state) => ({ links: state.links.filter((l) => l.id !== id) })),
    updateLink: (id, updates) =>
        set((state) => ({
            links: state.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),
    setLinks: (links) => set({ links }),
}));
