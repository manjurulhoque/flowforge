import type {
	Project,
	ProjectGraph,
	ProjectSummary,
	ProjectVersion,
	VersionSummary,
} from "@/types";
import { apiFetch } from "@/lib/api";

/**
 * Project API client. All calls hit the FlowForge backend
 * (see `lib/api.ts`), which handles auth + 401 refresh-and-retry.
 * DTO fields arrive camelCase per the backend aliases.
 */

type ProjectDto = ProjectSummary & { graph: ProjectGraph };

export const projectService = {
	async list(): Promise<ProjectSummary[]> {
		const res = await apiFetch<{ items: ProjectSummary[]; total: number }>(
			"/projects",
			{ auth: true },
		);
		return res.items;
	},

	async get(id: string): Promise<Project | undefined> {
		try {
			return await apiFetch<ProjectDto>(`/projects/${id}`, {
				auth: true,
			});
		} catch (error) {
			if (
				error instanceof Error &&
				"status" in error &&
				error.status === 404
			) {
				return undefined;
			}
			throw error;
		}
	},

	async create(name: string, description: string): Promise<Project> {
		return apiFetch<ProjectDto>("/projects", {
			method: "POST",
			auth: true,
			body: { name, description },
		});
	},

	async saveGraph(id: string, graph: ProjectGraph): Promise<void> {
		await apiFetch<ProjectDto>(`/projects/${id}/graph`, {
			method: "PUT",
			auth: true,
			body: graph,
		});
	},

	async rename(id: string, name: string): Promise<void> {
		await apiFetch<ProjectDto>(`/projects/${id}`, {
			method: "PUT",
			auth: true,
			body: { name: name.trim() },
		});
	},

	async duplicate(id: string): Promise<Project | undefined> {
		const source = await this.get(id);
		if (!source) return undefined;
		const copy = await this.create(
			`${source.name} (Copy)`,
			source.description,
		);
		if (source.graph.nodes.length > 0 || source.graph.edges.length > 0) {
			await this.saveGraph(copy.id, source.graph);
		}
		return copy;
	},

	async archive(id: string): Promise<void> {
		// Toggle: fetch current status, then flip it.
		const project = await this.get(id);
		if (!project) return;
		await apiFetch<ProjectDto>(`/projects/${id}`, {
			method: "PUT",
			auth: true,
			body: {
				status: project.status === "archived" ? "active" : "archived",
			},
		});
	},

	async remove(id: string): Promise<void> {
		await apiFetch<void>(`/projects/${id}`, {
			method: "DELETE",
			auth: true,
		});
	},

	async listVersions(projectId: string): Promise<VersionSummary[]> {
		const res = await apiFetch<{
			items: VersionSummary[];
			total: number;
		}>(`/projects/${projectId}/versions`, { auth: true });
		return res.items;
	},

	async getVersion(
		projectId: string,
		versionId: string,
	): Promise<ProjectVersion> {
		return apiFetch<ProjectVersion>(
			`/projects/${projectId}/versions/${versionId}`,
			{ auth: true },
		);
	},

	async createCheckpoint(
		projectId: string,
		label?: string,
	): Promise<ProjectVersion> {
		return apiFetch<ProjectVersion>(`/projects/${projectId}/versions`, {
			method: "POST",
			auth: true,
			body: { label: label?.trim() || null },
		});
	},

	async restoreVersion(
		projectId: string,
		versionId: string,
	): Promise<Project> {
		return apiFetch<ProjectDto>(
			`/projects/${projectId}/versions/${versionId}/restore`,
			{ method: "POST", auth: true },
		);
	},
};
