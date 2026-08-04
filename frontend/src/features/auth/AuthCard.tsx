"use client";

import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Shared visual shell for the login / register pages: centered card with
 * the FlowForge brand and an optional footer link.
 */
export function AuthCard({
	title,
	subtitle,
	footer,
	children,
}: {
	title: string;
	subtitle: string;
	footer?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="relative flex min-h-screen items-center justify-center bg-zinc-50 px-4">
			<div className="absolute right-4 top-4 sm:right-6 sm:top-6">
				<ThemeToggle />
			</div>
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25 }}
				className="w-full max-w-sm"
			>
				<div className="mb-6 flex items-center justify-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff6a2b] text-white">
						<Network className="h-4.5 w-4.5" strokeWidth={2} />
					</div>
					<span className="text-lg font-semibold tracking-tight text-zinc-900">
						FlowForge
					</span>
				</div>

				<div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm shadow-black/20">
					<h1 className="text-lg font-semibold tracking-tight text-zinc-900">
						{title}
					</h1>
					<p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
						{subtitle}
					</p>
					<div className="mt-5">{children}</div>
				</div>

				{footer && (
					<p className="mt-5 text-center text-[13px] text-zinc-500">
						{footer}
					</p>
				)}
			</motion.div>
		</div>
	);
}
