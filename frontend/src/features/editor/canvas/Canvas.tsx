import { useCallback, useMemo } from "react";
import {
	ReactFlow,
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	type OnSelectionChangeParams,
	type Viewport,
} from "@xyflow/react";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editorStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useUiStore } from "@/store/uiStore";
import { ArchNode } from "../nodes/ArchNode";
import { ArchEdge } from "../edges/ArchEdge";
import { CANVAS_DROPPABLE_ID } from "../dnd/EditorDndProvider";
import { CanvasEmptyState } from "./CanvasEmptyState";
import type { ArchNode as ArchNodeT, ArchEdge as ArchEdgeT } from "@/types";

const nodeTypes = { arch: ArchNode };
const edgeTypes = { arch: ArchEdge };

export function Canvas() {
	const nodes = useEditorStore((s) => s.nodes);
	const edges = useEditorStore((s) => s.edges);
	const onNodesChange = useEditorStore((s) => s.onNodesChange);
	const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
	const onConnect = useEditorStore((s) => s.onConnect);
	const commit = useEditorStore((s) => s.commit);
	const snapToGrid = useEditorStore((s) => s.snapToGrid);
	const setSelection = useSelectionStore((s) => s.setSelection);
	const setZoom = useUiStore((s) => s.setZoom);

	const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID });

	const onSelectionChange = useCallback(
		({ nodes: sn, edges: se }: OnSelectionChangeParams) =>
			setSelection(
				sn.map((n) => n.id),
				se.map((e) => e.id),
			),
		[setSelection],
	);

	const onMove = useCallback(
		(_: unknown, viewport: Viewport) =>
			setZoom(Math.round(viewport.zoom * 100)),
		[setZoom],
	);

	const nodeColor = useCallback((n: ArchNodeT) => n.data.color, []);
	const defaultEdgeOptions = useMemo(() => ({ type: "arch" }), []);

	return (
		<div ref={setNodeRef} className="relative h-full w-full">
			<ReactFlow<ArchNodeT, ArchEdgeT>
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeDragStart={commit}
				onSelectionChange={onSelectionChange}
				onMoveEnd={onMove}
				defaultEdgeOptions={defaultEdgeOptions}
				snapToGrid={snapToGrid}
				snapGrid={[16, 16]}
				selectionOnDrag
				panOnDrag={[1, 2]}
				panActivationKeyCode="Space"
				selectionKeyCode="Shift"
				multiSelectionKeyCode={["Meta", "Control"]}
				deleteKeyCode={null}
				fitView
				fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
				minZoom={0.2}
				maxZoom={2}
				proOptions={{ hideAttribution: true }}
			>
				<Background
					variant={BackgroundVariant.Cross}
					gap={16}
					size={1.5}
					color="#2e3440"
				/>
				<Controls
					className="!bottom-4 !left-4"
					showInteractive={false}
				/>
				<MiniMap
					pannable
					zoomable
					nodeColor={nodeColor}
					nodeStrokeWidth={0}
					maskColor="rgba(10,11,15,0.72)"
					className="!bottom-4 !right-4"
				/>
			</ReactFlow>
			{isOver && (
				<div className="pointer-events-none absolute inset-3 z-10 rounded-2xl border-2 border-dashed border-[#ff6a2b]/50 bg-[#ff6a2b]/5" />
			)}
			{nodes.length === 0 && <CanvasEmptyState />}
		</div>
	);
}
