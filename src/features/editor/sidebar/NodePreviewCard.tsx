import type { NodeTypeDefinition } from "@/types";
import { getIcon } from "@/constants/icons";
import { cn } from "@/utils/cn";

export function NodePreviewCard({
	def,
	dragging,
}: {
	def: NodeTypeDefinition;
	dragging?: boolean;
}) {
	const Icon = getIcon(def.icon);
	return (
		<div
			className={cn(
				"flex w-[220px] items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2.5 shadow-lg",
				dragging && "rotate-2 cursor-grabbing ring-1 ring-zinc-300",
			)}
		>
			<div
				className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
				style={{
					backgroundColor: `${def.accent}18`,
					color: def.accent,
				}}
			>
				<Icon className="h-4 w-4" />
			</div>
			<div className="min-w-0">
				<p className="truncate text-[13px] font-medium text-zinc-800">
					{def.label}
				</p>
				<p className="truncate text-[11px] text-zinc-400">
					{def.description}
				</p>
			</div>
		</div>
	);
}
