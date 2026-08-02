import type { ArchEdge, ArchNode, ExportFormat } from "@/types";
import { EDGE_KINDS } from "@/constants/catalog";
import { apiFetch } from "@/lib/api";

interface ExportResultDto {
	format: string;
	content: string;
	filename: string;
	mime_type: string;
}

/** Wire payload: strip React Flow runtime state before sending. */
function toWireGraph(nodes: ArchNode[], edges: ArchEdge[]) {
	return {
		nodes: nodes.map((n) => ({
			id: n.id,
			position: n.position,
			data: n.data,
			type: n.type,
		})),
		edges: edges.map((e) => ({
			id: e.id,
			source: e.source,
			target: e.target,
			sourceHandle: e.sourceHandle ?? null,
			targetHandle: e.targetHandle ?? null,
			type: e.type ?? null,
			data: e.data ?? {},
		})),
	};
}

/** Serializes JSON bodies locally (fallback / preview when API is down). */
export const editorService = {
	toJSON(nodes: ArchNode[], edges: ArchEdge[]): string {
		return JSON.stringify(
			{
				version: "1.0",
				nodes: nodes.map((n) => ({
					id: n.id,
					type: n.data.typeKey,
					label: n.data.label,
					position: n.position,
					config: n.data.config,
				})),
				edges: edges.map((e) => ({
					id: e.id,
					source: e.source,
					target: e.target,
					kind: e.data?.kind,
				})),
			},
			null,
			2,
		);
	},

	toMermaid(nodes: ArchNode[], edges: ArchEdge[]): string {
		const lines = ["graph LR"];
		const safe = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, "_");
		for (const n of nodes) {
			lines.push(`  ${safe(n.id)}["${n.data.label}"]`);
		}
		for (const e of edges) {
			const label = e.data?.kind ? EDGE_KINDS[e.data.kind].label : "";
			lines.push(`  ${safe(e.source)} -->|${label}| ${safe(e.target)}`);
		}
		return lines.join("\n");
	},

	async export(
		format: ExportFormat,
		nodes: ArchNode[],
		edges: ArchEdge[],
	): Promise<string> {
		// Raster formats need server-side rendering; json/mermaid/drawio are
		// handled by the export service with local fallbacks below.
		try {
			const res = await apiFetch<ExportResultDto>(
				`/export?format=${encodeURIComponent(format)}`,
				{
					method: "POST",
					auth: true,
					body: toWireGraph(nodes, edges),
				},
			);
			return res.content;
		} catch {
			switch (format) {
				case "json":
					return this.toJSON(nodes, edges);
				case "mermaid":
					return this.toMermaid(nodes, edges);
				case "png":
				case "svg":
					return `// ${format.toUpperCase()} rasterization requires the export service (offline fallback).`;
				case "drawio":
					return `<!-- draw.io XML export (offline fallback) for ${nodes.length} nodes -->`;
				case "k8s":
				case "terraform":
				case "openapi":
					return `# ${format} manifest generation requires the export service (offline fallback).`;
				case "plantuml":
					return `' PlantUML export (offline fallback) for ${nodes.length} nodes.`;
				default:
					return "";
			}
		}
	},
};
