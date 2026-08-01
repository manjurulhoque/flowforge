"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Dashboard } from "@/features/dashboard/Dashboard";

export default function DashboardPage() {
	return (
		<AuthGuard>
			<Dashboard />
		</AuthGuard>
	);
}
