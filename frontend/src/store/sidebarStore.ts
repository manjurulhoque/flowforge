import { create } from "zustand";
import type { NodeCategory } from "@/types";

interface SidebarState {
	collapsed: boolean;
	search: string;
	expanded: Record<NodeCategory, boolean>;
	favorites: string[];
	recent: string[];
	setCollapsed: (v: boolean) => void;
	toggleCollapsed: () => void;
	setSearch: (v: string) => void;
	toggleCategory: (c: NodeCategory) => void;
	toggleFavorite: (typeKey: string) => void;
	pushRecent: (typeKey: string) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
	collapsed: false,
	search: "",
	expanded: {
		custom: true,
		services: true,
		databases: true,
		messaging: false,
		cache: false,
		infrastructure: false,
		external: false,
	},
	favorites: ["api-gateway", "postgres"],
	recent: [],
	setCollapsed: (collapsed) => set({ collapsed }),
	toggleCollapsed: () => set({ collapsed: !get().collapsed }),
	setSearch: (search) => set({ search }),
	toggleCategory: (c) =>
		set((s) => ({ expanded: { ...s.expanded, [c]: !s.expanded[c] } })),
	toggleFavorite: (typeKey) =>
		set((s) => ({
			favorites: s.favorites.includes(typeKey)
				? s.favorites.filter((t) => t !== typeKey)
				: [...s.favorites, typeKey],
		})),
	pushRecent: (typeKey) =>
		set((s) => ({
			recent: [typeKey, ...s.recent.filter((t) => t !== typeKey)].slice(
				0,
				6,
			),
		})),
}));
