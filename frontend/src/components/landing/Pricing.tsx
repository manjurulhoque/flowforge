import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

const tiers = [
	{
		name: "Free",
		price: "$0",
		unit: "/ user / mo",
		cta: "Start for free",
		features: [
			"1 project workspace",
			"Visual canvas & node library",
			"Core validation rules",
			"PNG & SVG export",
		],
	},
	{
		name: "Pro",
		price: "$12",
		unit: "/ user / mo",
		cta: "Start free trial",
		highlighted: true,
		features: [
			"Unlimited project workspaces",
			"Full validation rule set",
			"Docker Compose, Mermaid & JSON export",
			"Custom node types",
			"Version history",
		],
	},
	{
		name: "Team",
		price: "$24",
		unit: "/ user / mo",
		cta: "Talk to sales",
		features: [
			"Everything in Pro",
			"Real-time collaboration",
			"Shared team workspaces",
			"Audit log & SSO",
			"Priority support",
		],
	},
];

export function Pricing() {
	return (
		<section
			id="pricing"
			className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]"
		>
			<div className="mx-auto max-w-5xl">
				<Reveal className="max-w-xl">
					<h2 className="text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
						Straightforward pricing, per user
					</h2>
					<p className="mt-4 text-[15px] text-[var(--text-secondary)]">
						Start free on a single workspace. Upgrade when the team
						needs more rooms to design in.
					</p>
				</Reveal>

				<div className="mt-12 grid sm:grid-cols-3 gap-5 items-start">
					{tiers.map((t, i) => (
						<Reveal
							key={t.name}
							delay={i * 0.08}
							className="h-full"
						>
							<div
								className={cn(
									"h-full rounded-[var(--radius-lg)] p-6 border flex flex-col",
									t.highlighted
										? "border-[var(--accent-line)] bg-[var(--surface)] relative"
										: "border-[var(--border)] bg-[var(--surface)]",
								)}
							>
								{t.highlighted && (
									<span className="absolute -top-3 left-6 mono text-[10px] px-2 py-1 rounded-full bg-[var(--accent)] text-[#160b06] font-medium">
										Most popular
									</span>
								)}
								<h3 className="text-[15px] font-medium text-[var(--text-primary)]">
									{t.name}
								</h3>
								<p className="mt-3 flex items-baseline gap-1.5">
									<span className="text-3xl font-semibold text-[var(--text-primary)] font-display">
										{t.price}
									</span>
									<span className="text-[12.5px] text-[var(--text-tertiary)]">
										{t.unit}
									</span>
								</p>

								<ul className="mt-6 space-y-2.5 flex-1">
									{t.features.map((f) => (
										<li
											key={f}
											className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]"
										>
											<Check
												size={14}
												className="mt-0.5 shrink-0 text-[var(--accent-strong)]"
												strokeWidth={2.5}
											/>
											{f}
										</li>
									))}
								</ul>

								<a
									href="/register"
									className={cn(
										"mt-7 inline-flex justify-center px-4 py-2.5 rounded-[var(--radius-sm)] text-[13.5px] font-medium transition-colors",
										t.highlighted
											? "bg-[var(--accent)] text-[#160b06] hover:bg-[var(--accent-strong)]"
											: "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-white/[0.04]",
									)}
								>
									{t.cta}
								</a>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
