import { Server, Database, Globe } from "lucide-react";
import { Reveal } from "./Reveal";

const lines = [
	{
		level: "error",
		text: 'Service "orders-api" has no API gateway entry point',
		fix: "→ suggested fix: route orders-api through api-gateway",
	},
	{
		level: "warn",
		text: '3+ services share database "users_db"',
		fix: "→ suggested fix: split read access behind a users-api facade",
	},
	{
		level: "info",
		text: "single replica detected on notifications-service",
		fix: "→ consider 2+ replicas before production traffic",
	},
];

const colors: Record<string, string> = {
	error: "var(--sev-error)",
	warn: "var(--sev-warn)",
	info: "var(--sev-info)",
};

export function ValidationDeepDive() {
	return (
		<section
			id="validation"
			className="px-5 sm:px-8 py-20 sm:py-28 border-t border-[var(--border)]"
		>
			<div className="mx-auto max-w-5xl">
				<Reveal className="max-w-xl">
					<span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-strong)]">
						Validation
					</span>
					<h2 className="mt-3 text-2xl sm:text-[2rem] font-semibold text-[var(--text-primary)]">
						The rule engine reads the diagram like a reviewer would
					</h2>
					<p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
						Every edge and node is checked against a growing rule
						set for distributed systems &mdash; missing entry
						points, shared databases, under-replicated services
						&mdash; before you export anything.
					</p>
				</Reveal>

				<div className="mt-12 grid lg:grid-cols-2 gap-5 items-stretch">
					<Reveal className="h-full">
						<div className="h-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 flex items-center justify-center">
							<svg
								viewBox="0 0 320 220"
								className="w-full max-w-xs"
								role="img"
								aria-label="Small diagram: gateway connecting to orders-api and users-api, both linked to a shared users_db"
							>
								<line
									x1="60"
									y1="110"
									x2="150"
									y2="50"
									stroke="var(--border-strong)"
									strokeWidth="1.5"
								/>
								<line
									x1="60"
									y1="110"
									x2="150"
									y2="170"
									stroke="var(--sev-error)"
									strokeOpacity="0.6"
									strokeWidth="1.5"
								/>
								<line
									x1="150"
									y1="50"
									x2="250"
									y2="110"
									stroke="var(--border-strong)"
									strokeWidth="1.5"
								/>
								<line
									x1="150"
									y1="170"
									x2="250"
									y2="110"
									stroke="var(--sev-warn)"
									strokeOpacity="0.7"
									strokeWidth="1.5"
									strokeDasharray="4 4"
								/>

								<MiniNode
									x={20}
									y={92}
									label="gateway"
									Icon={Globe}
								/>
								<MiniNode
									x={110}
									y={32}
									label="orders-api"
									Icon={Server}
									flagged="error"
								/>
								<MiniNode
									x={110}
									y={152}
									label="notifs"
									Icon={Server}
									flagged="info"
								/>
								<MiniNode
									x={210}
									y={92}
									label="users_db"
									Icon={Database}
									flagged="warn"
								/>
							</svg>
						</div>
					</Reveal>

					<Reveal delay={0.1} className="h-full">
						<div className="h-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-raised)] overflow-hidden flex flex-col">
							<div className="flex items-center gap-1.5 px-4 h-10 border-b border-[var(--border)] shrink-0">
								<span className="size-2.5 rounded-full bg-white/10" />
								<span className="size-2.5 rounded-full bg-white/10" />
								<span className="size-2.5 rounded-full bg-white/10" />
								<span className="mono text-[11px] text-[var(--text-tertiary)] ml-2">
									flowforge validate --project
									checkout-platform
								</span>
							</div>
							<div className="p-5 space-y-4 mono text-[12.5px] leading-relaxed overflow-x-auto">
								{lines.map((l) => (
									<div key={l.text}>
										<p>
											<span
												style={{
													color: colors[l.level],
												}}
											>
												[{l.level}]
											</span>{" "}
											<span className="text-[var(--text-primary)]">
												{l.text}
											</span>
										</p>
										<p className="text-[var(--text-tertiary)] pl-[3.5ch]">
											{l.fix}
										</p>
									</div>
								))}
								<p className="text-[var(--text-tertiary)] pt-2 border-t border-[var(--border)]">
									3 findings &middot; 1 error &middot; 1
									warning &middot; 1 info
									<span className="inline-block w-[7px] h-[13px] bg-[var(--text-tertiary)] ml-2 align-middle animate-pulse" />
								</p>
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

function MiniNode({
	x,
	y,
	label,
	Icon,
	flagged,
}: {
	x: number;
	y: number;
	label: string;
	Icon: typeof Server;
	flagged?: "error" | "warn" | "info";
}) {
	const stroke = flagged ? colors[flagged] : "var(--border-strong)";
	return (
		<g transform={`translate(${x}, ${y})`}>
			<rect
				width={96}
				height={34}
				rx={8}
				fill="var(--surface-2)"
				stroke={stroke}
				strokeWidth={flagged ? 1.4 : 1}
			/>
			<foreignObject x={8} y={0} width={84} height={34}>
				<div className="h-full flex items-center gap-1.5">
					<Icon
						size={11}
						strokeWidth={2}
						color={flagged ? stroke : "var(--text-secondary)"}
					/>
					<span className="mono text-[10px] text-[var(--text-primary)] truncate">
						{label}
					</span>
				</div>
			</foreignObject>
		</g>
	);
}
