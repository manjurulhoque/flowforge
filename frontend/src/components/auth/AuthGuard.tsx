"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

/**
 * Client-side route guard. Initializes the session once, then either
 * renders children (authenticated) or redirects to /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const status = useAuthStore((s) => s.status);
	const initialize = useAuthStore((s) => s.initialize);

	useEffect(() => {
		if (status === "initializing") void initialize();
	}, [status, initialize]);

	useEffect(() => {
		if (status === "unauthenticated") router.replace("/login");
	}, [status, router]);

	if (status !== "authenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-400">
				<Loader2 className="h-5 w-5 animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
