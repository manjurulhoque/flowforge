import { create } from "zustand";

export type BottomTab = "validation" | "logs" | "history" | "ai";

interface UiState {
	bottomOpen: boolean;
	bottomTab: BottomTab;
	zoom: number;
	exportOpen: boolean;
	setBottomOpen: (open: boolean) => void;
	toggleBottom: () => void;
	setBottomTab: (tab: BottomTab) => void;
	setZoom: (z: number) => void;
	setExportOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
	bottomOpen: true,
	bottomTab: "validation",
	zoom: 100,
	exportOpen: false,
	setBottomOpen: (bottomOpen) => set({ bottomOpen }),
	toggleBottom: () => set({ bottomOpen: !get().bottomOpen }),
	setBottomTab: (bottomTab) => set({ bottomTab, bottomOpen: true }),
	setZoom: (zoom) => set({ zoom }),
	setExportOpen: (exportOpen) => set({ exportOpen }),
}));
