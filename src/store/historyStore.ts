import { create } from "zustand";
import type { ArchEdge, ArchNode } from "@/types";

export interface Snapshot {
	nodes: ArchNode[];
	edges: ArchEdge[];
}

interface HistoryState {
	past: Snapshot[];
	future: Snapshot[];
	limit: number;
	record: (snapshot: Snapshot) => void;
	undo: (current: Snapshot) => Snapshot | null;
	redo: (current: Snapshot) => Snapshot | null;
	reset: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
	past: [],
	future: [],
	limit: 100,
	record: (snapshot) =>
		set((s) => ({
			past: [...s.past, snapshot].slice(-s.limit),
			future: [],
		})),
	undo: (current) => {
		const { past, future } = get();
		if (past.length === 0) return null;
		const prev = past[past.length - 1];
		set({ past: past.slice(0, -1), future: [current, ...future] });
		return prev;
	},
	redo: (current) => {
		const { past, future } = get();
		if (future.length === 0) return null;
		const next = future[0];
		set({ past: [...past, current], future: future.slice(1) });
		return next;
	},
	reset: () => set({ past: [], future: [] }),
}));
