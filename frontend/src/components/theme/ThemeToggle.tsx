"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
	className?: string;
	/** Use landing semantic tokens instead of zinc utilities. */
	variant?: "app" | "landing";
};

export function ThemeToggle({
	className,
	variant = "app",
}: ThemeToggleProps) {
	const theme = useThemeStore((s) => s.theme);
	const toggleTheme = useThemeStore((s) => s.toggleTheme);
	const isLight = theme === "light";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
			title={isLight ? "Dark theme" : "Light theme"}
			className={cn(
				"grid place-items-center size-9 rounded-[var(--radius-sm)] transition-colors cursor-pointer",
				variant === "landing"
					? "border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-fill)]"
					: "border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100",
				className,
			)}
		>
			{isLight ? (
				<Moon size={16} strokeWidth={2} />
			) : (
				<Sun size={16} strokeWidth={2} />
			)}
		</button>
	);
}
