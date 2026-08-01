"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReactFlow } from "@xyflow/react";
import {
	Undo2,
	Redo2,
	Save,
	ShieldCheck,
	Upload,
	ZoomIn,
	ZoomOut,
	Maximize,
	Loader2,
	Check,
	ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useEditorStore } from "@/store/editorStore";
import { useHistoryStore } from "@/store/historyStore";
import { useProjectStore } from "@/store/projectStore";
import { useUiStore } from "@/store/uiStore";
import { useDiagnosticsStore } from "@/store/diagnosticsStore";
import { projectService } from "@/services/projectService";
import { validationService } from "@/services/validationService";
import { ExportMenu } from "./ExportMenu";

export function TopToolbar() {
	const router = useRouter();
	const { zoomIn, zoomOut, fitView } = useReactFlow();

	const undo = useEditorStore((s) => s.undo);
	const redo = useEditorStore((s) => s.redo);
	const canUndo = useHistoryStore((s) => s.past.length > 0);
	const canRedo = useHistoryStore((s) => s.future.length > 0);

	const projectName = useProjectStore((s) => s.projectName);
	const setName = useProjectStore((s) => s.setName);
	const projectId = useProjectStore((s) => s.projectId);
	const dirty = useProjectStore((s) => s.dirty);
	const saveState = useProjectStore((s) => s.saveState);
	const setSaveState = useProjectStore((s) => s.setSaveState);

	const zoom = useUiStore((s) => s.zoom);
	const setBottomTab = useUiStore((s) => s.setBottomTab);

	const setRunning = useDiagnosticsStore((s) => s.setRunning);
	const setIssues = useDiagnosticsStore((s) => s.setIssues);
	const running = useDiagnosticsStore((s) => s.running);

	const [exportOpen, setExportOpen] = useState(false);

	async function handleSave() {
		if (!projectId) return;
		setSaveState("saving");
		const { nodes, edges } = useEditorStore.getState();
		await projectService.saveGraph(projectId, { nodes, edges });
		setSaveState("saved");
	}

	async function handleValidate() {
		setRunning(true);
		setBottomTab("validation");
		const { nodes, edges } = useEditorStore.getState();
		const issues = await validationService.validate(nodes, edges);
		setIssues(issues);
	}

	return (
		<header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-100/90 px-3 backdrop-blur-md">
			<button
				onClick={() => router.push("/dashboard")}
				className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-zinc-100"
			>
				<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff6a2b] text-[13px] font-bold text-white">
					F
				</div>
				<span className="text-[14px] font-semibold tracking-tight text-zinc-900">
					FlowForge
				</span>
			</button>

			<ChevronLeft className="h-4 w-4 text-zinc-300" />

			<input
				value={projectName}
				onChange={(e) => setName(e.target.value)}
				className="w-44 rounded-md bg-transparent px-1.5 py-1 text-[13.5px] font-medium text-zinc-800 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
				aria-label="Project name"
			/>
			<span className="text-[11px] text-zinc-400">
				{saveState === "saving"
					? "Saving…"
					: dirty
						? "Unsaved"
						: "Saved"}
			</span>

			<div className="mx-1 h-6 w-px bg-zinc-200" />

			<Tooltip label="Undo (⌘Z)">
				<Button
					variant="ghost"
					size="icon"
					onClick={undo}
					disabled={!canUndo}
					aria-label="Undo"
				>
					<Undo2 className="h-4 w-4" />
				</Button>
			</Tooltip>
			<Tooltip label="Redo (⌘⇧Z)">
				<Button
					variant="ghost"
					size="icon"
					onClick={redo}
					disabled={!canRedo}
					aria-label="Redo"
				>
					<Redo2 className="h-4 w-4" />
				</Button>
			</Tooltip>

			<div className="ml-auto flex items-center gap-1.5">
				<div className="mr-1 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => zoomOut()}
						aria-label="Zoom out"
					>
						<ZoomOut className="h-3.5 w-3.5" />
					</Button>
					<span className="w-11 text-center text-[11.5px] font-medium tabular-nums text-zinc-500">
						{zoom}%
					</span>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => zoomIn()}
						aria-label="Zoom in"
					>
						<ZoomIn className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => fitView({ padding: 0.3, duration: 400 })}
						aria-label="Fit view"
					>
						<Maximize className="h-3.5 w-3.5" />
					</Button>
				</div>

				<Button
					variant="secondary"
					size="sm"
					onClick={handleValidate}
					disabled={running}
				>
					{running ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<ShieldCheck className="h-4 w-4" />
					)}
					Validate
				</Button>

				<div className="relative">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => setExportOpen((v) => !v)}
					>
						<Upload className="h-4 w-4" /> Export
					</Button>
					{exportOpen && (
						<ExportMenu onClose={() => setExportOpen(false)} />
					)}
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={handleSave}
					disabled={saveState === "saving"}
				>
					{saveState === "saving" ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : saveState === "saved" && !dirty ? (
						<Check className="h-4 w-4" />
					) : (
						<Save className="h-4 w-4" />
					)}
					Save
				</Button>

				<div className="mx-1 h-6 w-px bg-zinc-200" />

				<button
					className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600"
					aria-label="User menu"
				>
					AK
				</button>
			</div>
		</header>
	);
}
