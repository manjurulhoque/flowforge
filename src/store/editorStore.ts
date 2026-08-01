import { create } from "zustand";
import {
	applyNodeChanges,
	applyEdgeChanges,
	type Connection,
	type NodeChange,
	type EdgeChange,
} from "@xyflow/react";
import type { ArchEdge, ArchNode, ArchNodeData, EdgeKind } from "@/types";
import { useHistoryStore, type Snapshot } from "./historyStore";
import { useProjectStore } from "./projectStore";
import { useSelectionStore } from "./selectionStore";
import { createNode, uid } from "@/utils/factory";
import { EDGE_KINDS } from "@/constants/catalog";

interface EditorState {
	nodes: ArchNode[];
	edges: ArchEdge[];
	defaultEdgeKind: EdgeKind;
	clipboard: ArchNode[];
	snapToGrid: boolean;

	setGraph: (nodes: ArchNode[], edges: ArchEdge[]) => void;
	onNodesChange: (changes: NodeChange<ArchNode>[]) => void;
	onEdgesChange: (changes: EdgeChange<ArchEdge>[]) => void;
	onConnect: (connection: Connection) => void;

	addNodeAt: (
		typeKey: string,
		position: { x: number; y: number },
	) => ArchNode;
	updateNodeData: (id: string, patch: Partial<ArchNodeData>) => void;
	updateEdgeKind: (id: string, kind: EdgeKind) => void;
	setDefaultEdgeKind: (kind: EdgeKind) => void;
	toggleSnap: () => void;

	copy: () => void;
	paste: () => void;
	duplicateSelected: () => void;
	deleteSelected: () => void;
	selectAll: () => void;

	commit: () => void;
	undo: () => void;
	redo: () => void;
}

function snapshot(nodes: ArchNode[], edges: ArchEdge[]): Snapshot {
	return {
		nodes: nodes.map((n) => ({
			...n,
			position: { ...n.position },
			data: { ...n.data },
		})),
		edges: edges.map((e) => ({
			...e,
			data: e.data ? { ...e.data } : e.data,
		})),
	};
}

function touch() {
	useProjectStore.getState().markDirty();
}

export const useEditorStore = create<EditorState>((set, get) => ({
	nodes: [],
	edges: [],
	defaultEdgeKind: "rest",
	clipboard: [],
	snapToGrid: true,

	setGraph: (nodes, edges) => {
		useHistoryStore.getState().reset();
		set({ nodes, edges });
	},

	onNodesChange: (changes) =>
		set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

	onEdgesChange: (changes) =>
		set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

	onConnect: (connection) => {
		get().commit();
		const kind = get().defaultEdgeKind;
		const edge: ArchEdge = {
			id: uid("edge"),
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle ?? undefined,
			targetHandle: connection.targetHandle ?? undefined,
			type: "arch",
			data: { kind, label: EDGE_KINDS[kind].label },
		};
		set((s) => ({ edges: [...s.edges, edge] }));
		touch();
	},

	addNodeAt: (typeKey, position) => {
		get().commit();
		const node = createNode(typeKey, position);
		set((s) => ({
			nodes: [
				...s.nodes.map((n) => ({ ...n, selected: false })),
				{ ...node, selected: true },
			],
		}));
		useSelectionStore.getState().setSelection([node.id], []);
		touch();
		return node;
	},

	updateNodeData: (id, patch) => {
		get().commit();
		set((s) => ({
			nodes: s.nodes.map((n) =>
				n.id === id
					? {
							...n,
							data: {
								...n.data,
								...patch,
								metadata: {
									...n.data.metadata,
									...(patch.metadata ?? {}),
									updatedAt: new Date().toISOString(),
								},
							},
						}
					: n,
			),
		}));
		touch();
	},

	updateEdgeKind: (id, kind) => {
		get().commit();
		set((s) => ({
			edges: s.edges.map((e) =>
				e.id === id
					? {
							...e,
							data: {
								...e.data,
								kind,
								label: EDGE_KINDS[kind].label,
							},
						}
					: e,
			),
		}));
		touch();
	},

	setDefaultEdgeKind: (defaultEdgeKind) => set({ defaultEdgeKind }),
	toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

	copy: () => {
		const selected = get().nodes.filter((n) => n.selected);
		if (selected.length)
			set({
				clipboard: selected.map((n) => ({ ...n, data: { ...n.data } })),
			});
	},

	paste: () => {
		const { clipboard } = get();
		if (!clipboard.length) return;
		get().commit();
		const idMap = new Map<string, string>();
		const pasted = clipboard.map((n) => {
			const newId = uid("node");
			idMap.set(n.id, newId);
			return {
				...n,
				id: newId,
				position: { x: n.position.x + 36, y: n.position.y + 36 },
				selected: true,
				data: { ...n.data },
			};
		});
		set((s) => ({
			nodes: [
				...s.nodes.map((n) => ({ ...n, selected: false })),
				...pasted,
			],
		}));
		touch();
	},

	duplicateSelected: () => {
		get().copy();
		get().paste();
	},

	deleteSelected: () => {
		const hasSelection =
			get().nodes.some((n) => n.selected) ||
			get().edges.some((e) => e.selected);
		if (!hasSelection) return;
		get().commit();
		set((s) => {
			const removedIds = new Set(
				s.nodes.filter((n) => n.selected).map((n) => n.id),
			);
			return {
				nodes: s.nodes.filter((n) => !n.selected),
				edges: s.edges.filter(
					(e) =>
						!e.selected &&
						!removedIds.has(e.source) &&
						!removedIds.has(e.target),
				),
			};
		});
		touch();
	},

	selectAll: () =>
		set((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: true })) })),

	commit: () => {
		const { nodes, edges } = get();
		useHistoryStore.getState().record(snapshot(nodes, edges));
	},

	undo: () => {
		const { nodes, edges } = get();
		const prev = useHistoryStore.getState().undo(snapshot(nodes, edges));
		if (prev) {
			set({ nodes: prev.nodes, edges: prev.edges });
			touch();
		}
	},

	redo: () => {
		const { nodes, edges } = get();
		const next = useHistoryStore.getState().redo(snapshot(nodes, edges));
		if (next) {
			set({ nodes: next.nodes, edges: next.edges });
			touch();
		}
	},
}));
