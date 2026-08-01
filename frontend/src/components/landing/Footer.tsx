import { GitBranch } from "lucide-react";

const columns = [
	{
		title: "Product",
		links: ["Canvas", "Validation", "Export", "Pricing"],
	},
	{
		title: "Resources",
		links: ["Docs", "Changelog", "Rule reference"],
	},
	{
		title: "Company",
		links: ["About", "Blog", "Careers"],
	},
	{
		title: "Legal",
		links: ["Privacy", "Terms"],
	},
];

export function Footer() {
	return (
		<footer className="px-5 sm:px-8 pt-16 pb-10 border-t border-[var(--border)]">
			<div className="mx-auto max-w-5xl">
				<div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
					<div className="lg:col-span-1">
						<a href="#" className="inline-flex items-center gap-2">
							<span className="grid place-items-center size-7 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent-strong)]">
								<GitBranch size={15} strokeWidth={2.25} />
							</span>
							<span className="font-display font-semibold text-[15px] text-[var(--text-primary)]">
								FlowForge
							</span>
						</a>
						<p className="mt-4 text-[13px] text-[var(--text-tertiary)] leading-relaxed max-w-[220px]">
							Design, validate, and export microservice
							architectures.
						</p>
					</div>

					{columns.map((col) => (
						<div key={col.title}>
							<h4 className="mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
								{col.title}
							</h4>
							<ul className="mt-4 space-y-2.5">
								{col.links.map((l) => (
									<li key={l}>
										<a
											href="#"
											className="text-[13.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
										>
											{l}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-14 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-[12.5px] text-[var(--text-tertiary)]">
						© {new Date().getFullYear()} FlowForge. All rights
						reserved.
					</p>
					<div className="inline-flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)]">
						<span className="size-1.5 rounded-full bg-[#3ecf72]" />
						All systems operational
					</div>
				</div>
			</div>
		</footer>
	);
}
