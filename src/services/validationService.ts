import type {
	ArchEdge,
	ArchNode,
	AiSuggestion,
	EventEntry,
	LogEntry,
	ValidationIssue,
} from "@/types";
import { uid } from "@/utils/factory";

/** Deterministic-ish mock validation engine that inspects the live graph. */
export const validationService = {
	async validate(
		nodes: ArchNode[],
		edges: ArchEdge[],
	): Promise<ValidationIssue[]> {
		await new Promise((r) => setTimeout(r, 400));
		const issues: ValidationIssue[] = [];
		const indegree = new Map<string, number>();
		const outdegree = new Map<string, number>();
		for (const e of edges) {
			outdegree.set(e.source, (outdegree.get(e.source) ?? 0) + 1);
			indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
		}

		for (const n of nodes) {
			const connected =
				(indegree.get(n.id) ?? 0) + (outdegree.get(n.id) ?? 0);
			if (connected === 0 && nodes.length > 1) {
				issues.push({
					id: uid("iss"),
					severity: "warning",
					message: `"${n.data.label}" is not connected to anything`,
					affectedNodeIds: [n.id],
					suggestion:
						"Wire this node to a consumer or producer, or remove it.",
				});
			}
			if (
				n.data.category === "databases" &&
				(indegree.get(n.id) ?? 0) > 3
			) {
				issues.push({
					id: uid("iss"),
					severity: "warning",
					message: `"${n.data.label}" is shared by many services`,
					affectedNodeIds: [n.id],
					suggestion:
						"Consider a database-per-service pattern to reduce coupling.",
				});
			}
			if (n.data.status === "error" || n.data.hasIssue) {
				issues.push({
					id: uid("iss"),
					severity: "error",
					message: `"${n.data.label}" is reporting an unhealthy status`,
					affectedNodeIds: [n.id],
					suggestion:
						"Check the health endpoint and recent deployments.",
				});
			}
			if (n.data.category === "services" && n.data.config.replicas < 2) {
				issues.push({
					id: uid("iss"),
					severity: "info",
					message: `"${n.data.label}" has a single replica`,
					affectedNodeIds: [n.id],
					suggestion:
						"Run at least 2 replicas for high availability.",
				});
			}
		}

		const hasGateway = nodes.some((n) => n.data.typeKey === "api-gateway");
		const hasService = nodes.some((n) => n.data.category === "services");
		if (hasService && !hasGateway) {
			issues.push({
				id: uid("iss"),
				severity: "info",
				message: "No API Gateway detected",
				affectedNodeIds: [],
				suggestion:
					"Add an API Gateway to centralize routing and auth.",
			});
		}
		return issues;
	},

	async logs(): Promise<LogEntry[]> {
		return [
			{
				id: uid("log"),
				level: "success",
				message: "Graph loaded from workspace",
				timestamp: iso(-120),
			},
			{
				id: uid("log"),
				level: "info",
				message: "Autosave enabled",
				timestamp: iso(-90),
			},
			{
				id: uid("log"),
				level: "warn",
				message: "Order Service latency p99 above 300ms",
				timestamp: iso(-40),
			},
			{
				id: uid("log"),
				level: "error",
				message: "Notification worker failed health check",
				timestamp: iso(-10),
			},
		];
	},

	async events(): Promise<EventEntry[]> {
		return [
			{
				id: uid("evt"),
				actor: "you",
				action: "created Payment Service",
				timestamp: iso(-60),
			},
			{
				id: uid("evt"),
				actor: "you",
				action: "connected Order → Kafka",
				timestamp: iso(-45),
			},
			{
				id: uid("evt"),
				actor: "system",
				action: "ran validation (2 issues)",
				timestamp: iso(-5),
			},
		];
	},

	async aiSuggestions(): Promise<AiSuggestion[]> {
		return [
			{
				id: uid("ai"),
				title: "Introduce a read replica",
				detail: "PostgreSQL is a read hotspot for User & Order. A replica could offload ~40% of reads.",
			},
			{
				id: uid("ai"),
				title: "Add a circuit breaker",
				detail: "Payment → Stripe is an external dependency. Add retries with a circuit breaker.",
			},
			{
				id: uid("ai"),
				title: "Extract Notification worker",
				detail: "Notifications are synchronous. Consume from Kafka to decouple.",
			},
		];
	},
};

function iso(minsAgo: number): string {
	return new Date(Date.now() + minsAgo * 60000).toISOString();
}
