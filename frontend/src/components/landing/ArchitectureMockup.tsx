"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Server,
  Database,
  Layers,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

type NodeKind = "client" | "service" | "db" | "cache";

type NodeDef = {
  id: string;
  x: number;
  y: number;
  label: string;
  kind: NodeKind;
  flagged?: boolean;
};

const nodes: NodeDef[] = [
  { id: "client", x: 30, y: 214, label: "client", kind: "client" },
  { id: "gateway", x: 186, y: 214, label: "api-gateway", kind: "service" },
  { id: "orders", x: 372, y: 96, label: "orders-api", kind: "service" },
  { id: "users", x: 372, y: 332, label: "users-api", kind: "service" },
  { id: "cache", x: 562, y: 40, label: "cache", kind: "cache", flagged: true },
  { id: "orders_db", x: 562, y: 160, label: "orders_db", kind: "db" },
  { id: "users_db", x: 562, y: 332, label: "users_db", kind: "db" },
];

const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

const edges: Array<{ from: string; to: string; dashed?: boolean }> = [
  { from: "client", to: "gateway" },
  { from: "gateway", to: "orders" },
  { from: "gateway", to: "users" },
  { from: "orders", to: "cache" },
  { from: "orders", to: "orders_db" },
  { from: "users", to: "users_db" },
  { from: "users", to: "orders_db", dashed: true },
];

const NODE_W = 118;
const NODE_H = 40;

function iconFor(kind: NodeKind) {
  switch (kind) {
    case "client":
      return Globe;
    case "db":
      return Database;
    case "cache":
      return Layers;
    default:
      return Server;
  }
}

function anchor(id: string) {
  const n = nodeMap[id];
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
}

export function ArchitectureMockup() {
  return (
    <div className="relative w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
      {/* fake toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)] bg-[var(--bg-raised)]">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
        </div>
        <span className="mono text-[11px] text-[var(--text-tertiary)]">
          checkout-platform / architecture.flowforge
        </span>
        <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[var(--text-tertiary)]">
          autosaved
        </span>
      </div>

      <div className="relative bg-dot-grid" style={{ backgroundColor: "var(--bg-raised)" }}>
        <svg
          viewBox="0 0 720 400"
          className="w-full h-auto block"
          role="img"
          aria-label="Example microservice architecture with a client, API gateway, two services, a cache, and two databases, one node flagged with a validation issue"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const a = anchor(e.from);
            const b = anchor(e.to);
            const flaggedEdge = e.to === "cache" || e.from === "cache";
            return (
              <g key={i}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={flaggedEdge ? "var(--sev-error)" : "var(--border-strong)"}
                  strokeOpacity={flaggedEdge ? 0.5 : 1}
                  strokeWidth={1.5}
                  strokeDasharray={e.dashed ? "4 4" : undefined}
                  markerEnd="url(#arrow)"
                />
                {!e.dashed && (
                  <motion.circle
                    r={2.6}
                    fill={flaggedEdge ? "var(--sev-error)" : "var(--accent)"}
                    animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.35,
                    }}
                  />
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const Icon = iconFor(n.kind);
            return (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={9}
                  fill="var(--surface-2)"
                  stroke={n.flagged ? "var(--sev-error)" : "var(--border-strong)"}
                  strokeWidth={n.flagged ? 1.4 : 1}
                />
                {n.flagged && (
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={9}
                    fill="none"
                    stroke="var(--sev-error)"
                    strokeOpacity={0.35}
                    strokeWidth={5}
                  />
                )}
                <foreignObject x={10} y={0} width={NODE_W - 10} height={NODE_H}>
                  <div className="h-full flex items-center gap-2 px-0.5">
                    <Icon
                      size={13}
                      strokeWidth={2}
                      color={n.flagged ? "var(--sev-error)" : "var(--text-secondary)"}
                    />
                    <span className="mono text-[11px] text-[var(--text-primary)] truncate">
                      {n.label}
                    </span>
                  </div>
                </foreignObject>
                {n.flagged && (
                  <g transform={`translate(${NODE_W - 16}, -8)`}>
                    <circle r={8} fill="var(--sev-error)" />
                    <foreignObject x={-5} y={-5} width={10} height={10}>
                      <AlertTriangle size={10} strokeWidth={2.5} color="#160b06" />
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* validation panel */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-raised)] p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="mono text-[11px] text-[var(--text-tertiary)]">validation — 3 findings</span>
          <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--sev-error-soft)] text-[var(--sev-error)]">
            1 error
          </span>
        </div>
        <ul className="space-y-2">
          <ValidationRow
            level="error"
            icon={AlertCircle}
            text={<><span className="mono text-[var(--sev-error)]">cache</span> has no eviction or rate-limit policy configured</>}
          />
          <ValidationRow
            level="warn"
            icon={AlertTriangle}
            text={<>2 services write to <span className="mono text-[var(--text-primary)]">orders_db</span> directly</>}
          />
          <ValidationRow
            level="info"
            icon={Info}
            text={<>single replica detected on <span className="mono text-[var(--text-primary)]">users-api</span></>}
          />
        </ul>
      </div>
    </div>
  );
}

function ValidationRow({
  level,
  icon: Icon,
  text,
}: {
  level: "error" | "warn" | "info";
  icon: typeof AlertCircle;
  text: React.ReactNode;
}) {
  const color =
    level === "error" ? "var(--sev-error)" : level === "warn" ? "var(--sev-warn)" : "var(--sev-info)";
  const soft =
    level === "error"
      ? "var(--sev-error-soft)"
      : level === "warn"
      ? "var(--sev-warn-soft)"
      : "var(--sev-info-soft)";
  return (
    <li className="flex items-start gap-2 text-[12.5px] text-[var(--text-secondary)]">
      <span
        className="mt-0.5 grid place-items-center size-4 rounded-full shrink-0"
        style={{ backgroundColor: soft, color }}
      >
        <Icon size={10} strokeWidth={2.5} />
      </span>
      <span className="mono text-[10.5px] uppercase tracking-wide shrink-0" style={{ color }}>
        {level}
      </span>
      <span className="leading-snug">{text}</span>
    </li>
  );
}
