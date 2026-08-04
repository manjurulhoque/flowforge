"use client";

import { useEffect, useState } from "react";
import { Menu, X, GitBranch } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const links = [
	{ label: "Product", href: "#product" },
	{ label: "Validation", href: "#validation" },
	{ label: "Export", href: "#export" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "Docs", href: "#", disabled: true },
];

export function Nav() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.documentElement.style.overflow = open ? "hidden" : "";
		return () => {
			document.documentElement.style.overflow = "";
		};
	}, [open]);

	return (
		<header
			className={cn(
				"fixed top-0 inset-x-0 z-50 transition-colors duration-300",
				scrolled
					? "backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--border)]"
					: "bg-transparent border-b border-transparent",
			)}
		>
			<nav className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
				<Link
					href={"/"}
					className="flex items-center gap-2 shrink-0 cursor-pointer"
				>
					<span className="grid place-items-center size-7 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent-strong)]">
						<GitBranch size={15} strokeWidth={2.25} />
					</span>
					<span className="font-display font-semibold text-[15px] tracking-tight text-[var(--text-primary)]">
						FlowForge
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-1">
					{links.map((l) => (
						<a
							key={l.label}
							href={l.href}
							aria-disabled={l.disabled}
							className={cn(
								"px-3.5 py-2 text-[13.5px] rounded-[var(--radius-sm)] transition-colors",
								l.disabled
									? "text-[var(--text-tertiary)] cursor-default"
									: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-fill)]",
							)}
							onClick={(e) => l.disabled && e.preventDefault()}
						>
							{l.label}
						</a>
					))}
				</div>

				<div className="hidden md:flex items-center gap-2">
					<ThemeToggle variant="landing" />
					<a
						href="/login"
						className="px-3.5 py-2 text-[13.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
					>
						Sign in
					</a>
					<a
						href="/register"
						className="px-4 py-2 text-[13.5px] font-medium rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-strong)] transition-colors"
					>
						Get started
					</a>
				</div>

				<button
					aria-label={open ? "Close menu" : "Open menu"}
					className="md:hidden grid place-items-center size-9 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-primary)]"
					onClick={() => setOpen((v) => !v)}
				>
					{open ? <X size={18} /> : <Menu size={18} />}
				</button>
			</nav>

			{open && (
				<div className="md:hidden fixed inset-0 top-16 bg-[var(--bg)] border-t border-[var(--border)]">
					<div className="flex flex-col p-5 gap-1">
						{links.map((l) => (
							<a
								key={l.label}
								href={l.href}
								aria-disabled={l.disabled}
								onClick={(e) => {
									if (l.disabled) e.preventDefault();
									else setOpen(false);
								}}
								className={cn(
									"px-3 py-3.5 text-[15px] border-b border-[var(--border)]",
									l.disabled
										? "text-[var(--text-tertiary)]"
										: "text-[var(--text-primary)]",
								)}
							>
								{l.label}
							</a>
						))}
						<div className="flex flex-col gap-2 mt-4">
							<div className="flex items-center justify-between px-1 py-2">
								<span className="text-[13px] text-[var(--text-secondary)]">
									Theme
								</span>
								<ThemeToggle variant="landing" />
							</div>
							<a
								href="/login"
								className="px-4 py-3 text-center text-[14px] rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-primary)]"
							>
								Sign in
							</a>
							<a
								href="/register"
								className="px-4 py-3 text-center text-[14px] font-medium rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)]"
							>
								Get started
							</a>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
