"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { ArchitectureMockup } from "./ArchitectureMockup";

const badges = [
	"PostgreSQL",
	"Redis",
	"Docker",
	"Kubernetes",
	"Terraform",
	"OpenAI",
];

export function Hero() {
	return (
		<section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 px-5 sm:px-8 overflow-hidden">
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-dot-grid"
				style={{
					maskImage: "linear-gradient(to bottom, black, transparent)",
					WebkitMaskImage:
						"linear-gradient(to bottom, black, transparent)",
				}}
			/>
			<div
				className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[-120px] h-[380px] w-[720px] rounded-full opacity-[0.18] blur-[110px]"
				style={{ background: "var(--accent)" }}
			/>

			<div className="relative mx-auto max-w-4xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="inline-flex items-center gap-2 mono text-[11.5px] px-3 py-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] text-[var(--text-secondary)] mb-7"
				>
					<span className="size-1.5 rounded-full bg-[var(--accent)]" />
					v2.3 — simulation mode in private beta
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.05 }}
					className="text-[2.4rem] sm:text-6xl font-semibold leading-[1.05] text-[var(--text-primary)]"
				>
					Design microservice architectures
					<br className="hidden sm:block" /> that actually deploy.
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.12 }}
					className="mt-6 text-[15.5px] sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
				>
					Drag services onto a canvas, connect them the way they
					actually talk, and let the rule engine catch anti-patterns
					before they ship. Then export straight to the artifacts your
					stack already reads.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.18 }}
					className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
				>
					<a
						href="/register"
						className="group inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[#160b06] font-medium text-[14.5px] hover:bg-[var(--accent-strong)] transition-colors"
					>
						Start designing free
						<ArrowRight
							size={15}
							className="transition-transform group-hover:translate-x-0.5"
						/>
					</a>
					<a
						href="#validation"
						className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-[14.5px] hover:bg-white/[0.04] transition-colors"
					>
						<PlayCircle size={15} />
						See how it works
					</a>
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.7,
					delay: 0.26,
					ease: [0.22, 1, 0.36, 1],
				}}
				className="relative mx-auto max-w-3xl mt-16"
			>
				<ArchitectureMockup />
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6, delay: 0.5 }}
				className="relative mx-auto max-w-3xl mt-12"
			>
				<p className="text-center mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-tertiary)] mb-4">
					Exports and integrates with the stack you run
				</p>
				<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
					{badges.map((b) => (
						<span
							key={b}
							className="mono text-[12.5px] text-[var(--text-secondary)]"
						>
							{b}
						</span>
					))}
				</div>
			</motion.div>
		</section>
	);
}
