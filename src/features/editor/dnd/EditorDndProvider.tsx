import { useState, useCallback } from "react";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "@/store/editorStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { NODE_CATALOG_MAP } from "@/constants/catalog";
import { NodePreviewCard } from "../sidebar/NodePreviewCard";

export const CANVAS_DROPPABLE_ID = "flowforge-canvas";

export function EditorDndProvider({ children }: { children: React.ReactNode }) {
	const [activeType, setActiveType] = useState<string | null>(null);
	const { screenToFlowPosition } = useReactFlow();
	const addNodeAt = useEditorStore((s) => s.addNodeAt);
	const pushRecent = useSidebarStore((s) => s.pushRecent);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor),
	);

	const onDragStart = useCallback((e: DragStartEvent) => {
		const typeKey = e.active.data.current?.typeKey as string | undefined;
		setActiveType(typeKey ?? null);
	}, []);

	const onDragEnd = useCallback(
		(e: DragEndEvent) => {
			const typeKey = e.active.data.current?.typeKey as
				string | undefined;
			setActiveType(null);
			if (!typeKey || e.over?.id !== CANVAS_DROPPABLE_ID) return;
			const rect = e.active.rect.current.translated;
			const point = rect
				? {
						x: rect.left + rect.width / 2,
						y: rect.top + rect.height / 2,
					}
				: { x: window.innerWidth / 2, y: window.innerHeight / 2 };
			const position = screenToFlowPosition(point);
			addNodeAt(typeKey, { x: position.x - 114, y: position.y - 40 });
			pushRecent(typeKey);
		},
		[screenToFlowPosition, addNodeAt, pushRecent],
	);

	const activeDef = activeType ? NODE_CATALOG_MAP[activeType] : null;

	return (
		<DndContext
			sensors={sensors}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragCancel={() => setActiveType(null)}
		>
			{children}
			<DragOverlay dropAnimation={null}>
				{activeDef ? (
					<NodePreviewCard def={activeDef} dragging />
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
