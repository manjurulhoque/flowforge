import { editorService } from "@/services/editorService";
import type { ArchEdge, ArchNode, ExportFormat } from "@/types";

/**
 * Next.js App Router Route Handler: POST /api/export
 */
export async function POST(request: Request) {
	try {
		const { format, nodes, edges } = (await request.json()) as {
			format: ExportFormat;
			nodes: ArchNode[];
			edges: ArchEdge[];
		};
		const content = await editorService.export(
			format,
			nodes || [],
			edges || [],
		);
		return Response.json({ format, content }, { status: 200 });
	} catch {
		return Response.json(
			{ error: "Failed to export graph" },
			{ status: 400 },
		);
	}
}
