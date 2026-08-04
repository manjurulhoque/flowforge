"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Loader2, RotateCcw, Tag } from "lucide-react";
import { projectService } from "@/services/projectService";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";
import { formatRelativeTime } from "@/utils/factory";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/primitives";
import { cn } from "@/utils/cn";
import type { VersionSummary } from "@/types";

export function versionsQueryKey(projectId: string) {
	return ["versions", projectId] as const;
}

export function VersionHistoryView() {
	const projectId = useProjectStore((s) => s.projectId);
	const dirty = useProjectStore((s) => s.dirty);
	const setSaveState = useProjectStore((s) => s.setSaveState);
	const setGraph = useEditorStore((s) => s.setGraph);
	const qc = useQueryClient();

	const [label, setLabel] = useState("");
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const { data: versions = [], isLoading } = useQuery({
		queryKey: projectId ? versionsQueryKey(projectId) : ["versions", "none"],
		queryFn: () => projectService.listVersions(projectId!),
		enabled: Boolean(projectId),
	});

	const checkpoint = useMutation({
		mutationFn: async (checkpointLabel: string) => {
			if (!projectId) throw new Error("No project");
			if (dirty) {
				const { nodes, edges } = useEditorStore.getState();
				setSaveState("saving");
				await projectService.saveGraph(projectId, { nodes, edges });
				setSaveState("saved");
			}
			return projectService.createCheckpoint(
				projectId,
				checkpointLabel || undefined,
			);
		},
		onSuccess: async () => {
			setLabel("");
			if (projectId) {
				await qc.invalidateQueries({
					queryKey: versionsQueryKey(projectId),
				});
			}
		},
	});

	const restore = useMutation({
		mutationFn: async (versionId: string) => {
			if (!projectId) throw new Error("No project");
			return projectService.restoreVersion(projectId, versionId);
		},
		onSuccess: async (project) => {
			setGraph(project.graph.nodes, project.graph.edges);
			setSaveState("saved");
			setConfirmId(null);
			if (projectId) {
				await qc.invalidateQueries({
					queryKey: versionsQueryKey(projectId),
				});
			}
		},
	});

	if (!projectId) {
		return (
			<Empty text="Open a project to view version history." />
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span className="text-[12px]">Loading versions…</span>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-3">
			<form
				className="flex items-center gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					checkpoint.mutate(label.trim());
				}}
			>
				<div className="relative min-w-0 flex-1">
					<Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
					<Input
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Checkpoint label (optional)"
						className="h-8 pl-8 text-[12.5px]"
					/>
				</div>
				<Button
					type="submit"
					variant="secondary"
					size="sm"
					disabled={checkpoint.isPending}
				>
					{checkpoint.isPending ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<History className="h-3.5 w-3.5" />
					)}
					Checkpoint
				</Button>
			</form>

			{versions.length === 0 ? (
				<Empty text="No versions yet. Save the canvas to create the first snapshot." />
			) : (
				<div className="space-y-1.5">
					{versions.map((version, index) => (
						<VersionRow
							key={version.id}
							version={version}
							isLatest={index === 0}
							confirming={confirmId === version.id}
							busy={
								restore.isPending && confirmId === version.id
							}
							onAskRestore={() => setConfirmId(version.id)}
							onCancel={() => setConfirmId(null)}
							onConfirm={() => restore.mutate(version.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function VersionRow({
	version,
	isLatest,
	confirming,
	busy,
	onAskRestore,
	onCancel,
	onConfirm,
}: {
	version: VersionSummary;
	isLatest: boolean;
	confirming: boolean;
	busy: boolean;
	onAskRestore: () => void;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-2",
				confirming && "border-zinc-300",
			)}
		>
			<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-[11px] font-semibold tabular-nums text-zinc-600">
				v{version.version}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[12.5px] font-medium text-zinc-800">
					{version.label ?? (isLatest ? "Latest save" : "Save")}
					{isLatest && (
						<span className="ml-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
							current
						</span>
					)}
				</p>
				<p className="mt-0.5 text-[11px] text-zinc-500">
					{version.nodeCount} nodes · {version.edgeCount} edges ·{" "}
					{formatRelativeTime(version.createdAt)}
				</p>
			</div>

			{confirming ? (
				<div className="flex shrink-0 items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={onCancel}
						disabled={busy}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={onConfirm}
						disabled={busy}
					>
						{busy ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<RotateCcw className="h-3.5 w-3.5" />
						)}
						Restore
					</Button>
				</div>
			) : (
				!isLatest && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onAskRestore}
						aria-label={`Restore version ${version.version}`}
					>
						<RotateCcw className="h-3.5 w-3.5" />
						Restore
					</Button>
				)
			)}
		</div>
	);
}

function Empty({ text }: { text: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-zinc-400">
			<History className="h-5 w-5" />
			<p className="text-[12px]">{text}</p>
		</div>
	);
}
