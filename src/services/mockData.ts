import type { ArchEdge, ArchNode, Project } from "@/types";
import { createNodeData } from "@/utils/factory";
import { EDGE_KINDS } from "@/constants/catalog";

function node(
	id: string,
	typeKey: string,
	x: number,
	y: number,
	overrides: Partial<ReturnType<typeof createNodeData>> = {},
): ArchNode {
	return {
		id,
		type: "arch",
		position: { x, y },
		data: { ...createNodeData(typeKey), ...overrides },
	};
}

function edge(
	id: string,
	source: string,
	target: string,
	kind: keyof typeof EDGE_KINDS,
): ArchEdge {
	return {
		id,
		source,
		target,
		type: "arch",
		data: { kind, label: EDGE_KINDS[kind].label },
	};
}

export function buildSampleGraph(): { nodes: ArchNode[]; edges: ArchEdge[] } {
	const nodes: ArchNode[] = [
		node("n_ingress", "ingress", 40, 260),
		node("n_gateway", "api-gateway", 300, 260),
		node("n_auth", "auth", 620, 80),
		node("n_order", "order", 620, 300, { status: "warning" }),
		node("n_payment", "payment", 620, 520),
		node("n_pg", "postgres", 960, 300),
		node("n_redis", "redis", 960, 80),
		node("n_kafka", "kafka", 960, 520),
		node("n_notify", "notification", 1260, 520, {
			status: "error",
			hasIssue: true,
		}),
		node("n_stripe", "stripe", 1260, 720),
	];
	const edges: ArchEdge[] = [
		edge("e1", "n_ingress", "n_gateway", "rest"),
		edge("e2", "n_gateway", "n_auth", "grpc"),
		edge("e3", "n_gateway", "n_order", "rest"),
		edge("e4", "n_gateway", "n_payment", "rest"),
		edge("e5", "n_auth", "n_redis", "database"),
		edge("e6", "n_order", "n_pg", "database"),
		edge("e7", "n_order", "n_kafka", "kafka-pub"),
		edge("e8", "n_kafka", "n_notify", "kafka-sub"),
		edge("e9", "n_payment", "n_stripe", "rest"),
		edge("e10", "n_payment", "n_kafka", "kafka-pub"),
	];
	return { nodes, edges };
}

export const SEED_PROJECTS: Project[] = [
	{
		id: "p_ecommerce",
		name: "E-Commerce Platform",
		description:
			"Order, payment and fulfilment microservices with event streaming.",
		nodeCount: 10,
		edgeCount: 10,
		status: "active",
		accent: "#5b6578",
		createdAt: "2026-01-04T09:00:00.000Z",
		updatedAt: "2026-02-18T14:20:00.000Z",
		graph: buildSampleGraph(),
	},
	{
		id: "p_fintech",
		name: "Fintech Ledger",
		description: "Double-entry ledger, KYC and payment rails.",
		nodeCount: 7,
		edgeCount: 8,
		status: "active",
		accent: "#6d8a72",
		createdAt: "2025-12-11T09:00:00.000Z",
		updatedAt: "2026-02-15T11:05:00.000Z",
		graph: { nodes: [], edges: [] },
	},
	{
		id: "p_streaming",
		name: "Realtime Analytics",
		description: "Kafka + Flink pipeline feeding dashboards.",
		nodeCount: 12,
		edgeCount: 15,
		status: "active",
		accent: "#94856f",
		createdAt: "2025-11-02T09:00:00.000Z",
		updatedAt: "2026-01-29T16:45:00.000Z",
		graph: { nodes: [], edges: [] },
	},
	{
		id: "p_legacy",
		name: "Legacy Monolith Split",
		description: "Strangler-fig migration to services.",
		nodeCount: 5,
		edgeCount: 4,
		status: "archived",
		accent: "#71717a",
		createdAt: "2025-08-20T09:00:00.000Z",
		updatedAt: "2025-10-01T10:00:00.000Z",
		graph: { nodes: [], edges: [] },
	},
];
