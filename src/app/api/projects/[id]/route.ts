import { projectService } from "@/services/projectService";
import type { ProjectGraph } from "@/types";

/**
 * GET /api/projects/[id]
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const project = await projectService.get(id);

	if (!project) {
		return Response.json({ error: "Project not found" }, { status: 404 });
	}

	return Response.json(project, { status: 200 });
}

/**
 * PUT /api/projects/[id] — save graph (and optional name)
 */
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	try {
		const body = (await request.json()) as {
			graph: ProjectGraph;
			name?: string;
		};
		const existing = await projectService.get(id);

		if (!existing) {
			return Response.json(
				{ error: "Project not found" },
				{ status: 404 },
			);
		}

		if (body.name) {
			await projectService.rename(id, body.name);
		}
		if (body.graph) {
			await projectService.saveGraph(id, body.graph);
		}

		const updated = await projectService.get(id);
		return Response.json(updated, { status: 200 });
	} catch {
		return Response.json(
			{ error: "Invalid request payload" },
			{ status: 400 },
		);
	}
}

/**
 * DELETE /api/projects/[id]
 */
export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const existing = await projectService.get(id);
	if (!existing) {
		return Response.json({ error: "Project not found" }, { status: 404 });
	}
	await projectService.remove(id);
	return Response.json({ success: true }, { status: 200 });
}
