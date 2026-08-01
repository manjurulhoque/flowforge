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

const registerSchema = z
	.object({
		name: z.string().max(120).optional(),
		email: z.string().email("Enter a valid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128),
		confirm: z.string(),
	})
	.refine((v) => v.password === v.confirm, {
		message: "Passwords do not match",
		path: ["confirm"],
	});
type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const router = useRouter();
	const register = useAuthStore((s) => s.register);
	const status = useAuthStore((s) => s.status);
	const [formError, setFormError] = useState<string | null>(null);

	const {
		register: registerField,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: "", email: "", password: "", confirm: "" },
	});

	useEffect(() => {
		if (status === "authenticated") router.replace("/dashboard");
	}, [status, router]);

	async function onSubmit(values: RegisterValues) {
		setFormError(null);
		try {
			await register(values.email, values.password, values.name?.trim());
			router.replace("/dashboard");
		} catch (error) {
			setFormError(
				error instanceof ApiError
					? error.message
					: "Unable to create your account. Please try again.",
			);
		}
	}

	return (
		<AuthCard
			title="Create your account"
			subtitle="Start designing, validating and exporting microservice architectures."
			footer={
				<>
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-zinc-900 hover:underline"
					>
						Sign in
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
					<Label htmlFor="name">Name (optional)</Label>
					<Input
						id="name"
						type="text"
						autoComplete="name"
						placeholder="Ada Lovelace"
						{...registerField("name")}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						placeholder="you@company.com"
						{...registerField("email")}
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
						autoComplete="new-password"
						placeholder="At least 8 characters"
						{...registerField("password")}
					/>
					{errors.password && (
						<p className="text-[11px] text-red-500">
							{errors.password.message}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="confirm">Confirm password</Label>
					<Input
						id="confirm"
						type="password"
						autoComplete="new-password"
						placeholder="Repeat your password"
						{...registerField("confirm")}
					/>
					{errors.confirm && (
						<p className="text-[11px] text-red-500">
							{errors.confirm.message}
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
					{isSubmitting ? "Creating account…" : "Create account"}
				</Button>
			</form>
		</AuthCard>
	);
}
