import { validationService } from "@/services/validationService";
import type { ArchEdge, ArchNode } from "@/types";

/**
 * Next.js App Router Route Handler: POST /api/validate
 */
export async function POST(request: Request) {
	try {
		const { nodes, edges } = (await request.json()) as {
			nodes: ArchNode[];
			edges: ArchEdge[];
		};
		const issues = await validationService.validate(
			nodes || [],
			edges || [],
		);
		return Response.json({ issues }, { status: 200 });
	} catch {
		return Response.json(
			{ error: "Failed to validate graph" },
			{ status: 400 },
		);
	}
}
