import { create } from "zustand";
import type { ValidationIssue } from "@/types";

interface DiagnosticsState {
	issues: ValidationIssue[];
	running: boolean;
	lastRunAt: string | null;
	errorNodeIds: Set<string>;
	warningNodeIds: Set<string>;
	setRunning: (running: boolean) => void;
	setIssues: (issues: ValidationIssue[]) => void;
	clear: () => void;
}

function indexNodes(issues: ValidationIssue[]) {
	const errorNodeIds = new Set<string>();
	const warningNodeIds = new Set<string>();
	for (const issue of issues) {
		for (const id of issue.affectedNodeIds) {
			if (issue.severity === "error") errorNodeIds.add(id);
			else if (issue.severity === "warning") warningNodeIds.add(id);
		}
	}
	return { errorNodeIds, warningNodeIds };
}

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
	issues: [],
	running: false,
	lastRunAt: null,
	errorNodeIds: new Set(),
	warningNodeIds: new Set(),
	setRunning: (running) => set({ running }),
	setIssues: (issues) =>
		set({
			issues,
			lastRunAt: new Date().toISOString(),
			running: false,
			...indexNodes(issues),
		}),
	clear: () =>
		set({ issues: [], errorNodeIds: new Set(), warningNodeIds: new Set() }),
}));
