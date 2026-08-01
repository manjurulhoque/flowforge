import { useDraggable } from "@dnd-kit/core";
import { Star } from "lucide-react";
import type { NodeTypeDefinition } from "@/types";
import { getIcon } from "@/constants/icons";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/utils/cn";

export function DraggableNodeItem({
	def,
	section,
}: {
	def: NodeTypeDefinition;
	section: string;
}) {
	const Icon = getIcon(def.icon);
	const favorites = useSidebarStore((s) => s.favorites);
	const toggleFavorite = useSidebarStore((s) => s.toggleFavorite);
	const isFav = favorites.includes(def.type);

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `${section}:${def.type}`,
		data: { typeKey: def.type },
	});

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				"group flex cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-zinc-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300/50 active:cursor-grabbing",
				isDragging && "opacity-40",
			)}
			role="button"
			aria-label={`Drag ${def.label} to canvas`}
		>
			<div
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
				style={{
					backgroundColor: `${def.accent}18`,
					color: def.accent,
				}}
			>
				<Icon className="h-[15px] w-[15px]" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[12.5px] font-medium text-zinc-700">
					{def.label}
				</p>
				<p className="truncate text-[10.5px] text-zinc-400">
					{def.description}
				</p>
			</div>
			<button
				onPointerDown={(e) => e.stopPropagation()}
				onClick={(e) => {
					e.stopPropagation();
					toggleFavorite(def.type);
				}}
				className={cn(
					"rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100",
					isFav && "opacity-100",
				)}
				aria-label={isFav ? "Remove favorite" : "Add favorite"}
			>
				<Star
					className={cn(
						"h-3.5 w-3.5",
						isFav ? "fill-zinc-400 text-zinc-400" : "text-zinc-300",
					)}
				/>
			</button>
		</div>
	);
}
