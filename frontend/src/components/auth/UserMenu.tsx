"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

function initialsOf(name: string, email: string): string {
	const source = name.trim() || email;
	const parts = source.split(/[\s@.]+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "?";
	const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
	return (first + last).toUpperCase().slice(0, 2);
}

export function UserMenu() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const logout = useAuthStore((s) => s.logout);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onMouseDown(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onMouseDown);
		return () => document.removeEventListener("mousedown", onMouseDown);
	}, []);

	async function handleLogout() {
		await logout();
		router.replace("/login");
	}

	const displayName = user?.name || user?.email || "Account";
	const initials = initialsOf(user?.name ?? "", user?.email ?? "");

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-300"
				aria-label="Account menu"
				aria-expanded={open}
			>
				{initials}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.12 }}
						className="absolute right-0 top-10 z-50 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-lg shadow-black/30"
					>
						<div className="border-b border-zinc-100 px-3.5 py-2.5">
							<p className="truncate text-[13px] font-medium text-zinc-800">
								{displayName}
							</p>
							{user?.email && (
								<p className="mt-0.5 truncate text-[11.5px] text-zinc-400">
									{user.email}
								</p>
							)}
						</div>
						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							<LogOut className="h-3.5 w-3.5" />
							Sign out
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
