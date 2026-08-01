import { Reveal } from "./Reveal";

const quotes = [
  {
    quote:
      "We caught a shared-database anti-pattern in review that would've taken an incident to surface otherwise. The validation panel paid for the seat in the first week.",
    name: "Priya Nandakumar",
    role: "Platform Engineer",
    company: "Ledgerly",
  },
  {
    quote:
      "Export to Docker Compose is exactly right — it's the same file our onboarding script already expects, not a new format to reconcile.",
    name: "Tomas Vranić",
    role: "Staff Engineer",
    company: "Northwind Freight",
  },
  {
    quote:
      "The canvas replaced our draw.io board and the doc that was always a version behind it. Now there's one artifact, and it's checked automatically.",
    name: "Ade Okafor",
    role: "Engineering Manager",
    company: "Fenwick Labs",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

export function Testimonials() {
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <Reveal className="max-w-xl">
          <h2 className="text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
            Used by teams who read the diagram before the incident
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.08} className="h-full">
              <figure className="h-full p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex flex-col">
                <blockquote className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed flex-1">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid place-items-center size-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] mono text-[12px] font-medium shrink-0">
                    {initials(q.name)}
                  </span>
                  <span className="text-[13px]">
                    <span className="block text-[var(--text-primary)] font-medium">{q.name}</span>
                    <span className="block text-[var(--text-tertiary)]">
                      {q.role}, {q.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
