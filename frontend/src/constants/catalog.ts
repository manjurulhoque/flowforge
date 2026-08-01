import type {
	NodeCategory,
	NodeTypeDefinition,
	EdgeKind,
	EdgeKindDefinition,
} from "@/types";

export interface CategoryDefinition {
	id: NodeCategory;
	label: string;
	icon: string;
}

export const CATEGORIES: CategoryDefinition[] = [
	{ id: "custom", label: "Custom", icon: "box" },
	{ id: "services", label: "Services", icon: "server" },
	{ id: "databases", label: "Databases", icon: "database" },
	{ id: "messaging", label: "Messaging", icon: "radio" },
	{ id: "cache", label: "Cache", icon: "cpu" },
	{ id: "infrastructure", label: "Infrastructure", icon: "layers" },
	{ id: "external", label: "External APIs", icon: "cloud" },
];

const svc = (
	type: string,
	label: string,
	description: string,
	icon: string,
	accent: string,
	defaultPort = 8080,
	tech = { language: "Go", framework: "Gin" },
): NodeTypeDefinition => ({
	type,
	category: "services",
	label,
	description,
	icon,
	accent,
	defaultPort,
	defaultTech: tech,
});

/** Restrained, low-saturation palette. Each category gets a tonal family. */
const SLATE = "#64748b";
const STONE = "#78716c";
const NEUTRAL = "#737373";
const COOL = "#6b7280";

export const NODE_CATALOG: NodeTypeDefinition[] = [
	{
		type: "blank",
		category: "custom",
		label: "Blank Node",
		description: "Start from an editable custom component",
		icon: "box",
		accent: NEUTRAL,
		defaultPort: 8080,
		defaultTech: { language: "Custom", framework: "Custom" },
	},

	/* Services — muted slate family */
	svc(
		"api-gateway",
		"API Gateway",
		"Edge routing & rate limiting",
		"network",
		SLATE,
		8080,
		{ language: "Go", framework: "Envoy" },
	),
	svc(
		"auth",
		"Auth Service",
		"Identity, tokens & sessions",
		"shield",
		"#7c8293",
		8443,
		{ language: "Go", framework: "Gin" },
	),
	svc("user", "User Service", "User profiles & accounts", "users", "#6b7a8f"),
	svc(
		"order",
		"Order Service",
		"Order lifecycle & checkout",
		"cart",
		"#6d8c7a",
	),
	svc(
		"inventory",
		"Inventory Service",
		"Stock & availability",
		"boxes",
		"#9a8b6e",
	),
	svc(
		"payment",
		"Payment Service",
		"Billing & transactions",
		"card",
		"#8e7887",
	),
	svc(
		"shipping",
		"Shipping Service",
		"Fulfilment & logistics",
		"truck",
		"#7a8a85",
	),
	svc("notification", "Notification", "Email, SMS & push", "bell", "#a09572"),
	svc(
		"search",
		"Search Service",
		"Full-text & faceting",
		"search",
		"#6e8086",
	),
	svc(
		"analytics",
		"Analytics",
		"Event pipelines & metrics",
		"chart",
		"#877d99",
	),
	svc(
		"recommendation",
		"Recommendation",
		"Personalization engine",
		"sparkles",
		"#99787e",
	),

	/* Databases — cool stone family */
	{
		type: "postgres",
		category: "databases",
		label: "PostgreSQL",
		description: "Relational SQL database",
		icon: "database",
		accent: "#6b7c94",
		defaultPort: 5432,
	},
	{
		type: "mysql",
		category: "databases",
		label: "MySQL",
		description: "Relational SQL database",
		icon: "database",
		accent: "#6a7c88",
		defaultPort: 3306,
	},
	{
		type: "mongodb",
		category: "databases",
		label: "MongoDB",
		description: "Document NoSQL store",
		icon: "leaf",
		accent: "#6e8576",
		defaultPort: 27017,
	},
	{
		type: "cassandra",
		category: "databases",
		label: "Cassandra",
		description: "Wide-column NoSQL store",
		icon: "server",
		accent: STONE,
		defaultPort: 9042,
	},

	/* Cache */
	{
		type: "redis",
		category: "cache",
		label: "Redis",
		description: "In-memory cache & store",
		icon: "cpu",
		accent: "#9b7878",
		defaultPort: 6379,
	},

	/* Messaging — neutral */
	{
		type: "kafka",
		category: "messaging",
		label: "Kafka",
		description: "Distributed event streaming",
		icon: "radio",
		accent: NEUTRAL,
		defaultPort: 9092,
	},
	{
		type: "rabbitmq",
		category: "messaging",
		label: "RabbitMQ",
		description: "Message broker & queues",
		icon: "rabbit",
		accent: "#94856f",
		defaultPort: 5672,
	},
	{
		type: "nats",
		category: "messaging",
		label: "NATS",
		description: "Lightweight pub/sub",
		icon: "waypoints",
		accent: "#6e8488",
		defaultPort: 4222,
	},

	/* Infrastructure — cool gray */
	{
		type: "ingress",
		category: "infrastructure",
		label: "Ingress",
		description: "Cluster entry point",
		icon: "route",
		accent: COOL,
		defaultPort: 443,
	},
	{
		type: "load-balancer",
		category: "infrastructure",
		label: "Load Balancer",
		description: "Traffic distribution",
		icon: "waypoints",
		accent: "#70848a",
		defaultPort: 80,
	},
	{
		type: "kubernetes",
		category: "infrastructure",
		label: "Kubernetes",
		description: "Container orchestration",
		icon: "box",
		accent: SLATE,
	},
	{
		type: "prometheus",
		category: "infrastructure",
		label: "Prometheus",
		description: "Metrics & alerting",
		icon: "activity",
		accent: "#94856f",
		defaultPort: 9090,
	},
	{
		type: "grafana",
		category: "infrastructure",
		label: "Grafana",
		description: "Dashboards & viz",
		icon: "linechart",
		accent: "#a09572",
		defaultPort: 3000,
	},
	{
		type: "loki",
		category: "infrastructure",
		label: "Loki",
		description: "Log aggregation",
		icon: "logs",
		accent: "#a09572",
		defaultPort: 3100,
	},
	{
		type: "jaeger",
		category: "infrastructure",
		label: "Jaeger",
		description: "Distributed tracing",
		icon: "waypoints",
		accent: "#76848e",
		defaultPort: 16686,
	},

	/* External — muted brand hints */
	{
		type: "stripe",
		category: "external",
		label: "Stripe",
		description: "Payments API",
		icon: "card",
		accent: "#7870a0",
	},
	{
		type: "firebase",
		category: "external",
		label: "Firebase",
		description: "BaaS platform",
		icon: "flame",
		accent: "#a09572",
	},
	{
		type: "twilio",
		category: "external",
		label: "Twilio",
		description: "SMS & voice API",
		icon: "phone",
		accent: "#9b7878",
	},
	{
		type: "openai",
		category: "external",
		label: "OpenAI",
		description: "LLM & embeddings API",
		icon: "bot",
		accent: "#6e8a7e",
	},
];

export const NODE_CATALOG_MAP: Record<string, NodeTypeDefinition> =
	Object.fromEntries(NODE_CATALOG.map((n) => [n.type, n]));

/* ------------------------------------------------------------------ */
/* Edges                                                              */
/* ------------------------------------------------------------------ */

export const EDGE_KINDS: Record<EdgeKind, EdgeKindDefinition> = {
	rest: {
		kind: "rest",
		label: "REST",
		color: "#5b6578",
		animated: false,
		dashed: false,
	},
	graphql: {
		kind: "graphql",
		label: "GraphQL",
		color: "#7d6e82",
		animated: false,
		dashed: false,
	},
	grpc: {
		kind: "grpc",
		label: "gRPC",
		color: "#6d8a72",
		animated: true,
		dashed: false,
	},
	"kafka-pub": {
		kind: "kafka-pub",
		label: "Kafka Publish",
		color: "#9a8b6e",
		animated: true,
		dashed: true,
	},
	"kafka-sub": {
		kind: "kafka-sub",
		label: "Kafka Consume",
		color: "#8e926e",
		animated: true,
		dashed: true,
	},
	rabbitmq: {
		kind: "rabbitmq",
		label: "RabbitMQ",
		color: "#94856f",
		animated: true,
		dashed: true,
	},
	database: {
		kind: "database",
		label: "Database",
		color: "#6b7c94",
		animated: false,
		dashed: false,
	},
	internal: {
		kind: "internal",
		label: "Internal",
		color: "#5a5a5e",
		animated: false,
		dashed: true,
	},
};

export const EDGE_KIND_LIST = Object.values(EDGE_KINDS);
