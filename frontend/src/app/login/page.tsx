"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/features/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/primitives";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/api";

const loginSchema = z.object({
	email: z.string().email("Enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const login = useAuthStore((s) => s.login);
	const status = useAuthStore((s) => s.status);
	const [formError, setFormError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	useEffect(() => {
		if (status === "authenticated") router.replace("/dashboard");
	}, [status, router]);

	async function onSubmit(values: LoginValues) {
		setFormError(null);
		try {
			await login(values.email, values.password);
			router.replace("/dashboard");
		} catch (error) {
			setFormError(
				error instanceof ApiError
					? error.message
					: "Unable to sign in. Please try again.",
			);
		}
	}

	return (
		<AuthCard
			title="Sign in"
			subtitle="Access your architecture workspace."
			footer={
				<>
					No account yet?{" "}
					<Link
						href="/register"
						className="font-medium text-zinc-900 hover:underline"
					>
						Create one
					</Link>
				</>
			}
		>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4"
				noValidate
			>
				<div className="space-y-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						placeholder="you@company.com"
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-[11px] text-red-500">
							{errors.email.message}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						placeholder="••••••••"
						{...register("password")}
					/>
					{errors.password && (
						<p className="text-[11px] text-red-500">
							{errors.password.message}
						</p>
					)}
				</div>

				{formError && (
					<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-600">
						{formError}
					</div>
				)}

				<Button
					type="submit"
					variant="primary"
					size="lg"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting && (
						<Loader2 className="h-4 w-4 animate-spin" />
					)}
					{isSubmitting ? "Signing in…" : "Sign in"}
				</Button>
			</form>
		</AuthCard>
	);
}
