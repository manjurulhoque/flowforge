import type { Project, ProjectSummary, ProjectGraph } from "@/types";
import { SEED_PROJECTS } from "./mockData";
import { uid } from "@/utils/factory";

const ACCENTS = [
	"#5b6578",
	"#6d8a72",
	"#94856f",
	"#7d6e82",
	"#6b7c94",
	"#8e7887",
];

/** In-memory persistence layer — swap for real HTTP later. */
let projects: Project[] = SEED_PROJECTS.map((p) => ({ ...p }));

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms));

export const projectService = {
	async list(): Promise<ProjectSummary[]> {
		await delay();
		return projects.map(({ graph: _graph, ...summary }) => summary);
	},

	async get(id: string): Promise<Project | undefined> {
		await delay(200);
		const found = projects.find((p) => p.id === id);
		return found ? { ...found } : undefined;
	},

	async create(name: string, description: string): Promise<Project> {
		await delay();
		const now = new Date().toISOString();
		const project: Project = {
			id: uid("p"),
			name,
			description: description || "A new distributed system.",
			nodeCount: 0,
			edgeCount: 0,
			status: "active",
			accent: ACCENTS[projects.length % ACCENTS.length],
			createdAt: now,
			updatedAt: now,
			graph: { nodes: [], edges: [] },
		};
		projects = [project, ...projects];
		return project;
	},

	async saveGraph(id: string, graph: ProjectGraph): Promise<void> {
		await delay(250);
		projects = projects.map((p) =>
			p.id === id
				? {
						...p,
						graph,
						nodeCount: graph.nodes.length,
						edgeCount: graph.edges.length,
						updatedAt: new Date().toISOString(),
					}
				: p,
		);
	},

	async rename(id: string, name: string): Promise<void> {
		await delay(100);
		projects = projects.map((p) =>
			p.id === id
				? {
						...p,
						name: name.trim(),
						updatedAt: new Date().toISOString(),
					}
				: p,
		);
	},

	async duplicate(id: string): Promise<Project | undefined> {
		await delay();
		const src = projects.find((p) => p.id === id);
		if (!src) return undefined;
		const copy: Project = {
			...src,
			id: uid("p"),
			name: `${src.name} (Copy)`,
			updatedAt: new Date().toISOString(),
			createdAt: new Date().toISOString(),
		};
		projects = [copy, ...projects];
		return copy;
	},

	async archive(id: string): Promise<void> {
		await delay(200);
		projects = projects.map((p) =>
			p.id === id
				? {
						...p,
						status: p.status === "archived" ? "active" : "archived",
					}
				: p,
		);
	},

	async remove(id: string): Promise<void> {
		await delay(200);
		projects = projects.filter((p) => p.id !== id);
	},
};
