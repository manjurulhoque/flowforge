import type { ArchEdge, ArchNode, ExportFormat } from "@/types";
import { EDGE_KINDS } from "@/constants/catalog";

/** Handles serialization / export concerns. Mocked, format-ready. */
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
		await new Promise((r) => setTimeout(r, 300));
		switch (format) {
			case "json":
				return this.toJSON(nodes, edges);
			case "mermaid":
				return this.toMermaid(nodes, edges);
			case "png":
			case "svg":
				return `// ${format.toUpperCase()} rasterization is queued on the render service (mock).`;
			case "drawio":
				return `<!-- draw.io XML export (mock) for ${nodes.length} nodes -->`;
			default:
				return "";
		}
	},
};
