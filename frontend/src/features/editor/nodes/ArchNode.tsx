import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
	ChevronDown,
	Cpu,
	MemoryStick,
	Layers3,
	AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArchNode as ArchNodeType } from "@/types";
import { getIcon } from "@/constants/icons";
import { StatusBadge } from "@/components/ui/Badge";
import { useEditorStore } from "@/store/editorStore";
import { useDiagnosticsStore } from "@/store/diagnosticsStore";
import { cn } from "@/utils/cn";

function ArchNodeComponent({ id, data, selected }: NodeProps<ArchNodeType>) {
	const [expanded, setExpanded] = useState(false);
	const connections = useEditorStore(
		(s) => s.edges.filter((e) => e.source === id || e.target === id).length,
	);
	const hasError = useDiagnosticsStore((s) => s.errorNodeIds.has(id));
	const hasWarning = useDiagnosticsStore((s) => s.warningNodeIds.has(id));
	const Icon = getIcon(data.icon);
	const accent = data.color;

	return (
		<div
			className={cn(
				"group w-[228px] rounded-xl border bg-zinc-100 shadow-sm transition-all",
				selected
					? "border-[#ff6a2b] ring-1 ring-[#ff6a2b]/30"
					: "border-zinc-200 hover:border-zinc-300 hover:shadow-md",
				!selected &&
					hasError &&
					"border-[#f2545b] ring-1 ring-[#f2545b]/20",
				!selected &&
					!hasError &&
					hasWarning &&
					"border-zinc-300 ring-1 ring-zinc-100",
			)}
		>
			<Handle
				type="target"
				position={Position.Left}
				className="!left-[-5px]"
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="!right-[-5px]"
			/>

			<div className="flex items-start gap-2.5 p-3">
				<div
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
					style={{ backgroundColor: `${accent}18`, color: accent }}
				>
					<Icon className="h-[18px] w-[18px]" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<p className="truncate text-[13px] font-semibold text-zinc-900">
							{data.label}
						</p>
						{(data.hasIssue || hasError) && (
							<AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
						)}
					</div>
					<p className="truncate text-[11px] text-zinc-400">
						{data.config.language}
						{data.config.framework !== "—"
							? ` · ${data.config.framework}`
							: ""}
					</p>
				</div>
				<button
					onClick={(e) => {
						e.stopPropagation();
						setExpanded((v) => !v);
					}}
					className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600"
					aria-label="Toggle details"
				>
					<ChevronDown
						className={cn(
							"h-4 w-4 transition-transform",
							expanded && "rotate-180",
						)}
					/>
				</button>
			</div>

			<div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2">
				<StatusBadge status={data.status} />
				<span className="text-[10px] text-zinc-400">
					{connections}{" "}
					{connections === 1 ? "connection" : "connections"}
				</span>
			</div>

			<AnimatePresence initial={false}>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.18 }}
						className="overflow-hidden border-t border-zinc-100"
					>
						<div className="grid grid-cols-3 gap-2 p-3 text-[10px] text-zinc-400">
							<Detail
								icon={<Layers3 className="h-3 w-3" />}
								label="Replicas"
								value={String(data.config.replicas)}
							/>
							<Detail
								icon={<Cpu className="h-3 w-3" />}
								label="CPU"
								value={data.config.cpu}
							/>
							<Detail
								icon={<MemoryStick className="h-3 w-3" />}
								label="Mem"
								value={data.config.memory}
							/>
						</div>
						{data.tags.length > 0 && (
							<div className="flex flex-wrap gap-1 px-3 pb-3">
								{data.tags.map((t) => (
									<span
										key={t}
										className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-500"
									>
										{t}
									</span>
								))}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function Detail({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="flex items-center gap-1 text-zinc-400">
				{icon}
				{label}
			</span>
			<span className="font-medium text-zinc-700">{value}</span>
		</div>
	);
}

export const ArchNode = memo(ArchNodeComponent);
