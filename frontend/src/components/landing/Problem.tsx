import { FileX2, GitCompareArrows, ShieldAlert } from "lucide-react";
import { Reveal } from "./Reveal";

const points = [
  {
    icon: FileX2,
    title: "Whiteboard diagrams rot",
    body: "The photo from last quarter's design review is still the source of truth, and nobody trusts it anymore.",
  },
  {
    icon: GitCompareArrows,
    title: "Docs drift from reality",
    body: "The architecture doc describes the system you meant to build, not the one three teams have since bolted onto.",
  },
  {
    icon: ShieldAlert,
    title: "Anti-patterns ship quietly",
    body: "A shared database, a missing gateway, a single replica — nobody catches it until the incident review.",
  },
];

export function Problem() {
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <Reveal className="max-w-xl">
          <h2 className="text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
            Architecture that&rsquo;s reviewable, testable, and exportable
          </h2>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
            Most teams describe their system twice: once in a diagramming tool
            nobody maintains, and once in the code that actually ships.
            FlowForge makes the diagram the source of truth &mdash; one that
            can be validated and exported like any other artifact.
          </p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-3 gap-5">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="h-full p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
                <span className="grid place-items-center size-8 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-strong)] mb-4">
                  <p.icon size={16} strokeWidth={2} />
                </span>
                <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{p.title}</h3>
                <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
