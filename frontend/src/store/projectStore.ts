import { create } from "zustand";

type SaveState = "idle" | "saving" | "saved" | "error";

interface ProjectState {
	projectId: string | null;
	projectName: string;
	dirty: boolean;
	saveState: SaveState;
	lastSavedAt: string | null;
	setProject: (id: string, name: string) => void;
	setName: (name: string) => void;
	markDirty: () => void;
	setSaveState: (s: SaveState) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
	projectId: null,
	projectName: "Untitled Project",
	dirty: false,
	saveState: "idle",
	lastSavedAt: null,
	setProject: (projectId, projectName) =>
		set({ projectId, projectName, dirty: false, saveState: "idle" }),
	setName: (projectName) => set({ projectName, dirty: true }),
	markDirty: () => set({ dirty: true, saveState: "idle" }),
	setSaveState: (saveState) =>
		set(
			saveState === "saved"
				? {
						saveState,
						dirty: false,
						lastSavedAt: new Date().toISOString(),
					}
				: { saveState },
		),
}));
