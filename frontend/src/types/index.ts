import type { Node, Edge } from "@xyflow/react";

/* ------------------------------------------------------------------ */
/* Node domain model                                                  */
/* ------------------------------------------------------------------ */

export type NodeCategory =
	| "custom"
	| "services"
	| "databases"
	| "messaging"
	| "cache"
	| "infrastructure"
	| "external";

export type NodeStatus = "healthy" | "warning" | "error" | "unknown";

export interface NodeTypeDefinition {
	/** unique type key, e.g. "api-gateway" */
	type: string;
	category: NodeCategory;
	label: string;
	description: string;
	/** lucide icon key (see iconRegistry) */
	icon: string;
	accent: string;
	defaultTech?: Technology;
	defaultPort?: number;
}

export interface Technology {
	language?: string;
	framework?: string;
}

export interface EnvVar {
	id: string;
	key: string;
	value: string;
	secret?: boolean;
}

export interface NodeConfig {
	language: string;
	framework: string;
	port: number;
	replicas: number;
	cpu: string;
	memory: string;
	healthEndpoint: string;
	autoscaling: boolean;
	minReplicas: number;
	maxReplicas: number;
	env: EnvVar[];
}

export interface NodeMetadata {
	labels: Record<string, string>;
	createdAt: string;
	updatedAt: string;
}

/** Data carried by every architecture node. */
export interface ArchNodeData extends Record<string, unknown> {
	label: string;
	typeKey: string;
	category: NodeCategory;
	description: string;
	status: NodeStatus;
	tags: string[];
	color: string;
	icon: string;
	config: NodeConfig;
	metadata: NodeMetadata;
	hasIssue?: boolean;
}

export type ArchNode = Node<ArchNodeData, "arch">;

/* ------------------------------------------------------------------ */
/* Edge domain model                                                  */
/* ------------------------------------------------------------------ */

export type EdgeKind =
	| "rest"
	| "graphql"
	| "grpc"
	| "kafka-pub"
	| "kafka-sub"
	| "rabbitmq"
	| "database"
	| "internal";

export interface EdgeKindDefinition {
	kind: EdgeKind;
	label: string;
	color: string;
	animated: boolean;
	dashed: boolean;
}

export interface ArchEdgeData extends Record<string, unknown> {
	kind: EdgeKind;
	label?: string;
}

export type ArchEdge = Edge<ArchEdgeData>;

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

export type Severity = "error" | "warning" | "info";

export interface ValidationIssue {
	id: string;
	severity: Severity;
	message: string;
	affectedNodeIds: string[];
	suggestion: string;
}

export interface LogEntry {
	id: string;
	level: "info" | "warn" | "error" | "success";
	message: string;
	timestamp: string;
}

export interface EventEntry {
	id: string;
	actor: string;
	action: string;
	timestamp: string;
}

export interface AiSuggestion {
	id: string;
	title: string;
	detail: string;
}

/* ------------------------------------------------------------------ */
/* Project                                                            */
/* ------------------------------------------------------------------ */

export type ProjectStatus = "active" | "archived";

export interface ProjectSummary {
	id: string;
	name: string;
	description: string;
	nodeCount: number;
	edgeCount: number;
	status: ProjectStatus;
	updatedAt: string;
	createdAt: string;
	accent: string;
}

export interface ProjectGraph {
	nodes: ArchNode[];
	edges: ArchEdge[];
}

export interface Project extends ProjectSummary {
	graph: ProjectGraph;
}

/* ------------------------------------------------------------------ */
/* Export formats                                                     */
/* ------------------------------------------------------------------ */

export type ExportFormat =
	| "json"
	| "mermaid"
	| "png"
	| "svg"
	| "drawio"
	| "k8s"
	| "terraform"
	| "plantuml"
	| "openapi";
