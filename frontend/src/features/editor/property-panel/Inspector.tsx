import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Copy, Trash2, Tag } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useSelectionStore } from "@/store/selectionStore";
import { getIcon } from "@/constants/icons";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EDGE_KINDS } from "@/constants/catalog";
import { formatRelativeTime } from "@/utils/factory";
import { GeneralForm, ConfigForm } from "./InspectorForms";
import { cn } from "@/utils/cn";
import type { ArchNode } from "@/types";

type Tab = "general" | "config" | "metadata" | "connections";
const TABS: { id: Tab; label: string }[] = [
	{ id: "general", label: "General" },
	{ id: "config", label: "Config" },
	{ id: "metadata", label: "Metadata" },
	{ id: "connections", label: "Links" },
];

export function Inspector() {
	const selectedIds = useSelectionStore((s) => s.selectedNodeIds);
	const node = useEditorStore((s) =>
		s.nodes.find((n) => n.id === selectedIds[0]),
	);
	const [tab, setTab] = useState<Tab>("general");

	if (!node || selectedIds.length !== 1) {
		return <EmptyInspector count={selectedIds.length} />;
	}

	return (
		<motion.aside
			key={node.id}
			initial={{ opacity: 0, x: 12 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.2 }}
			className="flex h-full w-[320px] shrink-0 flex-col border-l border-zinc-200 bg-zinc-100"
		>
			<InspectorHeader node={node} />

			<div className="flex gap-0.5 border-b border-zinc-200 px-2">
				{TABS.map((t) => (
					<button
						key={t.id}
						onClick={() => setTab(t.id)}
						className={cn(
							"relative px-2.5 py-2.5 text-[12px] font-medium transition-colors",
							tab === t.id
								? "text-zinc-800"
								: "text-zinc-400 hover:text-zinc-600",
						)}
					>
						{t.label}
						{tab === t.id && (
							<motion.span
								layoutId="inspector-tab"
								className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-[#ff6a2b]"
							/>
						)}
					</button>
				))}
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-4">
				{tab === "general" && <GeneralForm node={node} />}
				{tab === "config" && <ConfigForm node={node} />}
				{tab === "metadata" && <MetadataPanel node={node} />}
				{tab === "connections" && <ConnectionsPanel node={node} />}
			</div>
		</motion.aside>
	);
}

function InspectorHeader({ node }: { node: ArchNode }) {
	const Icon = getIcon(node.data.icon);
	const duplicate = useEditorStore((s) => s.duplicateSelected);
	const remove = useEditorStore((s) => s.deleteSelected);
	return (
		<div className="flex items-center gap-3 border-b border-zinc-200 p-4">
			<div
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
				style={{
					backgroundColor: `${node.data.color}18`,
					color: node.data.color,
				}}
			>
				<Icon className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[14px] font-semibold text-zinc-900">
					{node.data.label}
				</p>
				<div className="mt-1">
					<StatusBadge status={node.data.status} />
				</div>
			</div>
			<div className="flex gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={duplicate}
					aria-label="Duplicate"
				>
					<Copy className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={remove}
					aria-label="Delete"
					className="hover:text-red-500"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

function MetadataPanel({ node }: { node: ArchNode }) {
	const labels = Object.entries(node.data.metadata.labels);
	return (
		<div className="space-y-4">
			<div>
				<p className="mb-2 text-xs font-medium text-zinc-500">Labels</p>
				<div className="space-y-1.5">
					{labels.map(([k, v]) => (
						<div
							key={k}
							className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5"
						>
							<Tag className="h-3 w-3 text-zinc-400" />
							<span className="truncate font-mono text-[11px] text-zinc-500">
								{k}
							</span>
							<span className="ml-auto truncate font-mono text-[11px] text-zinc-700">
								{v}
							</span>
						</div>
					))}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<InfoBox label="Type" value={node.data.typeKey} />
				<InfoBox label="Category" value={node.data.category} />
				<InfoBox
					label="Created"
					value={formatRelativeTime(node.data.metadata.createdAt)}
				/>
				<InfoBox
					label="Updated"
					value={formatRelativeTime(node.data.metadata.updatedAt)}
				/>
			</div>
			<InfoBox label="Node ID" value={node.id} mono />
		</div>
	);
}

function InfoBox({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
			<p className="text-[10px] uppercase tracking-wide text-zinc-400">
				{label}
			</p>
			<p
				className={cn(
					"mt-0.5 truncate text-[12px] text-zinc-700",
					mono && "font-mono text-[11px]",
				)}
			>
				{value}
			</p>
		</div>
	);
}

function ConnectionsPanel({ node }: { node: ArchNode }) {
	const nodes = useEditorStore((s) => s.nodes);
	const edges = useEditorStore((s) => s.edges);
	const nameOf = (id: string) =>
		nodes.find((n) => n.id === id)?.data.label ?? id;
	const incoming = edges.filter((e) => e.target === node.id);
	const outgoing = edges.filter((e) => e.source === node.id);

	return (
		<div className="space-y-5">
			<ConnGroup
				title="Incoming"
				icon={<ArrowLeft className="h-3.5 w-3.5" />}
				count={incoming.length}
			>
				{incoming.map((e) => (
					<ConnRow
						key={e.id}
						label={nameOf(e.source)}
						kind={e.data?.kind ?? "internal"}
						dir="in"
					/>
				))}
			</ConnGroup>
			<ConnGroup
				title="Outgoing"
				icon={<ArrowRight className="h-3.5 w-3.5" />}
				count={outgoing.length}
			>
				{outgoing.map((e) => (
					<ConnRow
						key={e.id}
						label={nameOf(e.target)}
						kind={e.data?.kind ?? "internal"}
						dir="out"
					/>
				))}
			</ConnGroup>
		</div>
	);
}

function ConnGroup({
	title,
	icon,
	count,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	count: number;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
				{icon}
				{title}
				<span className="text-zinc-300">({count})</span>
			</div>
			{count === 0 ? (
				<p className="rounded-lg border border-dashed border-zinc-200 py-2.5 text-center text-[11px] text-zinc-400">
					None
				</p>
			) : (
				<div className="space-y-1.5">{children}</div>
			)}
		</div>
	);
}

function ConnRow({
	label,
	kind,
	dir,
}: {
	label: string;
	kind: keyof typeof EDGE_KINDS;
	dir: "in" | "out";
}) {
	const def = EDGE_KINDS[kind];
	return (
		<div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
			<span
				className="h-2 w-2 rounded-full"
				style={{ backgroundColor: def.color }}
			/>
			<span className="truncate text-[12px] text-zinc-700">{label}</span>
			<span
				className="ml-auto text-[10px] font-medium"
				style={{ color: def.color }}
			>
				{def.label}
			</span>
			{dir === "out" ? (
				<ArrowRight className="h-3 w-3 text-zinc-300" />
			) : (
				<ArrowLeft className="h-3 w-3 text-zinc-300" />
			)}
		</div>
	);
}

function EmptyInspector({ count }: { count: number }) {
	return (
		<aside className="flex h-full w-[320px] shrink-0 flex-col items-center justify-center border-l border-zinc-200 bg-zinc-100 p-8 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
				<Tag className="h-5 w-5 text-zinc-300" />
			</div>
			<p className="mt-3 text-[13px] font-medium text-zinc-500">
				{count > 1 ? `${count} nodes selected` : "No selection"}
			</p>
			<p className="mt-1 text-[12px] text-zinc-400">
				{count > 1
					? "Select a single node to edit its properties."
					: "Select a node to inspect and configure it."}
			</p>
		</aside>
	);
}
