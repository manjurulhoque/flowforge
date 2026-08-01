import { memo } from "react";
import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	type EdgeProps,
} from "@xyflow/react";
import type { ArchEdge as ArchEdgeType } from "@/types";
import { EDGE_KINDS } from "@/constants/catalog";

function ArchEdgeComponent({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
	data,
	selected,
}: EdgeProps<ArchEdgeType>) {
	const [path, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
	});
	const def = data ? EDGE_KINDS[data.kind] : EDGE_KINDS.internal;

	return (
		<>
			<g className={def.animated ? "edge-animated" : undefined}>
				<BaseEdge
					path={path}
					markerEnd={markerEnd}
					style={{
						stroke: def.color,
						strokeWidth: selected ? 2.5 : 2,
						strokeDasharray:
							def.dashed && !def.animated ? "5 4" : undefined,
						opacity: selected ? 1 : 0.85,
					}}
				/>
			</g>
			<EdgeLabelRenderer>
				<div
					className="nodrag nopan pointer-events-none absolute rounded-md border px-1.5 py-0.5 text-[9px] font-semibold"
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						color: def.color,
						borderColor: `${def.color}40`,
						backgroundColor: "#ffffff",
					}}
				>
					{data?.label ?? def.label}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}

export const ArchEdge = memo(ArchEdgeComponent);
