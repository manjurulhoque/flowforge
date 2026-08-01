import { projectService } from "@/services/projectService";
import type { ProjectSummary } from "@/types";

/**
 * GET /api/projects — list project summaries
 */
export async function GET() {
	const summaries: ProjectSummary[] = await projectService.list();
	return Response.json(summaries, { status: 200 });
}

/**
 * POST /api/projects — create a project
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, description } = body;

		if (!name || typeof name !== "string") {
			return Response.json(
				{ error: "Project name is required" },
				{ status: 400 },
			);
		}

		const project = await projectService.create(
			name.trim(),
			typeof description === "string" ? description.trim() : "",
		);
		return Response.json(project, { status: 201 });
	} catch {
		return Response.json(
			{ error: "Invalid request payload" },
			{ status: 400 },
		);
	}
}
