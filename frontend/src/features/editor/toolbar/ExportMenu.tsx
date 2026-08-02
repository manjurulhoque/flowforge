import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileJson,
	GitBranch,
	Image,
	Code2,
	Network,
	Boxes,
	Layers,
	FileText,
	Braces,
	Check,
	Copy,
	Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEditorStore } from "@/store/editorStore";
import { editorService } from "@/services/editorService";
import type { ExportFormat } from "@/types";

const FORMATS: {
	id: ExportFormat;
	label: string;
	icon: React.ReactNode;
	hint: string;
}[] = [
	{
		id: "json",
		label: "JSON",
		icon: <FileJson className="h-4 w-4" />,
		hint: "Portable graph schema",
	},
	{
		id: "mermaid",
		label: "Mermaid",
		icon: <GitBranch className="h-4 w-4" />,
		hint: "Diagram-as-code",
	},
	{
		id: "png",
		label: "PNG",
		icon: <Image className="h-4 w-4" />,
		hint: "Raster snapshot",
	},
	{
		id: "svg",
		label: "SVG",
		icon: <Code2 className="h-4 w-4" />,
		hint: "Vector snapshot",
	},
	{
		id: "drawio",
		label: "draw.io",
		icon: <Network className="h-4 w-4" />,
		hint: "Editable diagram",
	},
	{
		id: "k8s",
		label: "Kubernetes",
		icon: <Boxes className="h-4 w-4" />,
		hint: "Deployment + Service manifests",
	},
	{
		id: "terraform",
		label: "Terraform",
		icon: <Layers className="h-4 w-4" />,
		hint: "Docker provider HCL",
	},
	{
		id: "plantuml",
		label: "PlantUML",
		icon: <FileText className="h-4 w-4" />,
		hint: "Component diagram-as-code",
	},
	{
		id: "openapi",
		label: "OpenAPI",
		icon: <Braces className="h-4 w-4" />,
		hint: "REST API skeleton spec",
	},
];

export function ExportMenu({ onClose }: { onClose: () => void }) {
	const nodes = useEditorStore((s) => s.nodes);
	const edges = useEditorStore((s) => s.edges);
	const [preview, setPreview] = useState<{
		format: ExportFormat;
		content: string;
	} | null>(null);
	const [copied, setCopied] = useState(false);

	async function run(format: ExportFormat) {
		const content = await editorService.export(format, nodes, edges);
		setPreview({ format, content });
		setCopied(false);
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -6, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -6, scale: 0.98 }}
				transition={{ duration: 0.14 }}
				className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-xl"
			>
				<div className="border-b border-zinc-100 px-3.5 py-2.5">
					<p className="text-[13px] font-semibold text-zinc-800">
						Export architecture
					</p>
					<p className="text-[11px] text-zinc-400">
						{nodes.length} nodes · {edges.length} edges
					</p>
				</div>
				<div className="grid grid-cols-1 gap-0.5 p-1.5">
					{FORMATS.map((f) => (
						<button
							key={f.id}
							onClick={() => run(f.id)}
							className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-50"
						>
							<span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
								{f.icon}
							</span>
							<span className="flex-1">
								<span className="block text-[13px] font-medium text-zinc-700">
									{f.label}
								</span>
								<span className="block text-[11px] text-zinc-400">
									{f.hint}
								</span>
							</span>
							{preview?.format === f.id && (
								<Check className="h-4 w-4 text-zinc-400" />
							)}
						</button>
					))}
				</div>

				{preview && (
					<div className="border-t border-zinc-100 p-2.5">
						<pre className="max-h-40 overflow-auto rounded-lg bg-zinc-50 p-2.5 text-[10.5px] leading-relaxed text-zinc-500">
							{preview.content}
						</pre>
						<div className="mt-2 flex gap-2">
							<Button
								size="sm"
								variant="secondary"
								className="flex-1"
								onClick={() => {
									navigator.clipboard?.writeText(
										preview.content,
									);
									setCopied(true);
								}}
							>
								{copied ? (
									<Check className="h-3.5 w-3.5" />
								) : (
									<Copy className="h-3.5 w-3.5" />
								)}
								{copied ? "Copied" : "Copy"}
							</Button>
							<Button
								size="sm"
								variant="primary"
								className="flex-1"
								onClick={onClose}
							>
								<Download className="h-3.5 w-3.5" /> Done
							</Button>
						</div>
					</div>
				)}
			</motion.div>
		</AnimatePresence>
	);
}
