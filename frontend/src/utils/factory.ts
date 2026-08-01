import type {
	ArchNode,
	ArchNodeData,
	NodeConfig,
	NodeTypeDefinition,
} from "@/types";
import { NODE_CATALOG_MAP } from "@/constants/catalog";

let counter = 0;
export function uid(prefix = "id"): string {
	counter += 1;
	return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

function defaultConfig(def: NodeTypeDefinition): NodeConfig {
	return {
		language: def.defaultTech?.language ?? "—",
		framework: def.defaultTech?.framework ?? "—",
		port: def.defaultPort ?? 8080,
		replicas: 1,
		cpu: "250m",
		memory: "512Mi",
		healthEndpoint: "/healthz",
		autoscaling: false,
		minReplicas: 1,
		maxReplicas: 5,
		env: [],
	};
}

export function createNodeData(typeKey: string): ArchNodeData {
	const def = NODE_CATALOG_MAP[typeKey];
	const now = new Date().toISOString();
	return {
		label: def.type === "blank" ? "Untitled Node" : def.label,
		typeKey: def.type,
		category: def.category,
		description:
			def.type === "blank"
				? "Describe this component, service, dependency, or system boundary."
				: def.description,
		status: "healthy",
		tags: [],
		color: def.accent,
		icon: def.icon,
		config: defaultConfig(def),
		metadata: {
			labels: { "app.kubernetes.io/part-of": "flowforge" },
			createdAt: now,
			updatedAt: now,
		},
	};
}

export function createNode(
	typeKey: string,
	position: { x: number; y: number },
): ArchNode {
	return {
		id: uid("node"),
		type: "arch",
		position,
		data: createNodeData(typeKey),
	};
}

export function formatRelativeTime(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString();
}
