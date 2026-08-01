import { create } from "zustand";

interface SelectionState {
	selectedNodeIds: string[];
	selectedEdgeIds: string[];
	setSelection: (nodeIds: string[], edgeIds: string[]) => void;
	clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
	selectedNodeIds: [],
	selectedEdgeIds: [],
	setSelection: (selectedNodeIds, selectedEdgeIds) =>
		set({ selectedNodeIds, selectedEdgeIds }),
	clear: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),
}));
