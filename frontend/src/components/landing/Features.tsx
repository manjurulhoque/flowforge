import {
  MousePointerSquareDashed,
  ShieldCheck,
  Download,
  FolderKanban,
  Users,
  Sparkles,
} from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: MousePointerSquareDashed,
    title: "Visual canvas",
    body: "Drag services, databases, message queues, caches, infra, and external systems from the node library, then wire them the way they actually talk.",
  },
  {
    icon: ShieldCheck,
    title: "Validation engine",
    body: "Rule checks flag anti-patterns as info, warning, or error, with a suggested fix and the affected node highlighted on the canvas.",
  },
  {
    icon: Download,
    title: "One-click export",
    body: "Turn any diagram into JSON, Mermaid, Docker Compose, draw.io, PNG, or SVG — the same architecture, in the format your tooling reads.",
  },
  {
    icon: FolderKanban,
    title: "Project workspaces",
    body: "Every project keeps its own name, description, status, and accent color, with a running count of nodes and edges at a glance.",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    body: "See teammates' cursors and edits land on the canvas as they happen, with presence indicators for who's looking at what.",
    soon: true,
  },
  {
    icon: Sparkles,
    title: "AI-assisted design",
    body: "Describe a system in plain language and get a first-pass architecture and load simulation to refine from there.",
    soon: true,
  },
];

export function Features() {
  return (
    <section id="product" className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <Reveal className="max-w-xl">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-strong)]">
            Product
          </span>
          <h2 className="mt-3 text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
            Everything the diagram needs to be true
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="h-full p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors">
                <div className="flex items-start justify-between">
                  <span className="grid place-items-center size-8 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <f.icon size={16} strokeWidth={2} />
                  </span>
                  {f.soon && (
                    <span className="mono text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-strong)] text-[var(--text-tertiary)]">
                      coming soon
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-[15px] font-medium text-[var(--text-primary)]">{f.title}</h3>
                <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
