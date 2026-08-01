import { useMemo } from "react";
import {
	ChevronRight,
	Search,
	Star,
	Clock,
	PanelLeftClose,
	Plus,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
	CATEGORIES,
	NODE_CATALOG,
	NODE_CATALOG_MAP,
} from "@/constants/catalog";
import { getIcon } from "@/constants/icons";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEditorStore } from "@/store/editorStore";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DraggableNodeItem } from "./DraggableNodeItem";
import { cn } from "@/utils/cn";
import type { NodeCategory, NodeTypeDefinition } from "@/types";

export function NodeLibrary() {
	const search = useSidebarStore((s) => s.search);
	const setSearch = useSidebarStore((s) => s.setSearch);
	const expanded = useSidebarStore((s) => s.expanded);
	const toggleCategory = useSidebarStore((s) => s.toggleCategory);
	const favorites = useSidebarStore((s) => s.favorites);
	const recent = useSidebarStore((s) => s.recent);
	const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
	const pushRecent = useSidebarStore((s) => s.pushRecent);
	const addNodeAt = useEditorStore((s) => s.addNodeAt);
	const { screenToFlowPosition } = useReactFlow();

	function insertBlankNode() {
		const position = screenToFlowPosition({
			x: Math.round(window.innerWidth / 2),
			y: Math.round(window.innerHeight / 2),
		});
		addNodeAt("blank", { x: position.x - 114, y: position.y - 40 });
		pushRecent("blank");
	}

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return NODE_CATALOG;
		return NODE_CATALOG.filter(
			(n) =>
				n.label.toLowerCase().includes(q) ||
				n.description.toLowerCase().includes(q),
		);
	}, [search]);

	const byCategory = useMemo(() => {
		const map = new Map<NodeCategory, NodeTypeDefinition[]>();
		for (const def of filtered) {
			const arr = map.get(def.category) ?? [];
			arr.push(def);
			map.set(def.category, arr);
		}
		return map;
	}, [filtered]);

	const favDefs = favorites.map((t) => NODE_CATALOG_MAP[t]).filter(Boolean);
	const recentDefs = recent.map((t) => NODE_CATALOG_MAP[t]).filter(Boolean);
	const searching = search.trim().length > 0;

	return (
		<aside className="flex h-full w-[276px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-100">
			<div className="flex items-center justify-between px-4 pb-2 pt-3.5">
				<h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
					Node Library
				</h2>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={toggleCollapsed}
					aria-label="Collapse sidebar"
				>
					<PanelLeftClose className="h-4 w-4 cursor-pointer" />
				</Button>
			</div>

			<div className="px-3 pb-2">
				<div className="relative">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search nodes…"
						className="h-8 pl-8 text-[13px]"
					/>
				</div>
				<Button
					variant="secondary"
					size="sm"
					className="mt-2 w-full justify-start border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
					onClick={insertBlankNode}
				>
					<Plus className="h-3.5 w-3.5" />
					Insert Blank Node
				</Button>
			</div>

			<div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
				{!searching && favDefs.length > 0 && (
					<Section
						title="Favorites"
						icon={<Star className="h-3.5 w-3.5" />}
					>
						{favDefs.map((def) => (
							<DraggableNodeItem
								key={def.type}
								def={def}
								section="fav"
							/>
						))}
					</Section>
				)}
				{!searching && recentDefs.length > 0 && (
					<Section
						title="Recently Used"
						icon={<Clock className="h-3.5 w-3.5" />}
					>
						{recentDefs.map((def) => (
							<DraggableNodeItem
								key={def.type}
								def={def}
								section="recent"
							/>
						))}
					</Section>
				)}

				{CATEGORIES.map((cat) => {
					const items = byCategory.get(cat.id) ?? [];
					if (items.length === 0) return null;
					const Icon = getIcon(cat.icon);
					const open = searching || expanded[cat.id];
					return (
						<div key={cat.id} className="pt-0.5">
							<button
								onClick={() => toggleCategory(cat.id)}
								className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-50"
							>
								<ChevronRight
									className={cn(
										"h-3.5 w-3.5 text-zinc-400 transition-transform",
										open && "rotate-90",
									)}
								/>
								<Icon className="h-3.5 w-3.5 text-zinc-400" />
								<span className="text-[12px] font-medium text-zinc-600">
									{cat.label}
								</span>
								<span className="ml-auto text-[10px] text-zinc-300">
									{items.length}
								</span>
							</button>
							{open && (
								<div className="mt-0.5 space-y-0.5 pl-1">
									{items.map((def) => (
										<DraggableNodeItem
											key={def.type}
											def={def}
											section={cat.id}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}

				{filtered.length === 0 && (
					<p className="px-3 py-8 text-center text-[12px] text-zinc-400">
						No nodes match "{search}".
					</p>
				)}
			</div>

			<div className="border-t border-zinc-100 px-4 py-2.5 text-[10.5px] text-zinc-400">
				Drag any node onto the canvas
			</div>
		</aside>
	);
}

function Section({
	title,
	icon,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="pb-1">
			<div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
				{icon}
				{title}
			</div>
			<div className="space-y-0.5 pl-1">{children}</div>
		</div>
	);
}
