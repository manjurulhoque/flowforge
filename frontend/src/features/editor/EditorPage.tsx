"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { PanelLeftOpen } from "lucide-react";
import { EditorDndProvider } from "./dnd/EditorDndProvider";
import { TopToolbar } from "./toolbar/TopToolbar";
import { NodeLibrary } from "./sidebar/NodeLibrary";
import { Canvas } from "./canvas/Canvas";
import { Inspector } from "./property-panel/Inspector";
import { BottomPanel } from "./validation/BottomPanel";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useDiagnosticsStore } from "@/store/diagnosticsStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/Button";

export function EditorPage({ projectId }: { projectId: string }) {
	const setGraph = useEditorStore((s) => s.setGraph);
	const setProject = useProjectStore((s) => s.setProject);
	const clearDiagnostics = useDiagnosticsStore((s) => s.clear);
	const collapsed = useSidebarStore((s) => s.collapsed);
	const setCollapsed = useSidebarStore((s) => s.setCollapsed);

	useKeyboardShortcuts();

	useEffect(() => {
		let active = true;
		clearDiagnostics();
		(async () => {
			if (!projectId) return;
			const project = await projectService.get(projectId);
			if (!active || !project) return;
			setProject(project.id, project.name);
			setGraph(project.graph.nodes, project.graph.edges);
		})();
		return () => {
			active = false;
		};
	}, [projectId, setGraph, setProject, clearDiagnostics]);

	return (
		<ReactFlowProvider>
			<EditorDndProvider>
				<div className="flex h-screen flex-col overflow-hidden bg-zinc-50">
					<TopToolbar />
					<div className="flex min-h-0 flex-1">
						{collapsed ? (
							<div className="flex w-11 shrink-0 flex-col items-center border-r border-zinc-200 bg-zinc-100 py-3">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setCollapsed(false)}
									aria-label="Expand sidebar"
								>
									<PanelLeftOpen className="h-4 w-4 cursor-pointer" />
								</Button>
							</div>
						) : (
							<NodeLibrary />
						)}
						<div className="flex min-w-0 flex-1 flex-col">
							<div className="relative min-h-0 flex-1">
								<Canvas />
							</div>
							<BottomPanel />
						</div>
						<Inspector />
					</div>
				</div>
			</EditorDndProvider>
		</ReactFlowProvider>
	);
}
