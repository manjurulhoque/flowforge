import { Reveal } from "./Reveal";

const steps = [
	{
		n: "01",
		title: "Design",
		body: "Drag services, databases, queues, and infra onto the canvas. Draw edges the way requests actually flow.",
	},
	{
		n: "02",
		title: "Validate",
		body: "The rule engine flags anti-patterns as you build — shared databases, missing gateways, under-replicated services.",
	},
	{
		n: "03",
		title: "Ship",
		body: "Export to Docker Compose, Mermaid, draw.io, JSON, PNG, or SVG. The diagram becomes an artifact your stack reads.",
	},
];

export function Workflow() {
	return (
		<section className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]">
			<div className="mx-auto max-w-5xl">
				<Reveal className="max-w-xl">
					<h2 className="text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
						Three steps, one source of truth
					</h2>
				</Reveal>

				<div className="mt-12 grid sm:grid-cols-3 gap-8 sm:gap-5">
					{steps.map((s, i) => (
						<Reveal key={s.n} delay={i * 0.1}>
							<div className="relative">
								<span className="mono text-[13px] text-[var(--accent-strong)]">
									{s.n}
								</span>
								<h3 className="mt-2 text-[17px] font-medium text-[var(--text-primary)]">
									{s.title}
								</h3>
								<p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
									{s.body}
								</p>
								{i < steps.length - 1 && (
									<span className="hidden sm:block absolute top-1.5 -right-2.5 w-5 h-px bg-[var(--border-strong)]" />
								)}
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
