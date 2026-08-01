"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X, Loader2, Sparkles } from "lucide-react";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/primitives";

export function CreateProjectDialog({ onClose }: { onClose: () => void }) {
	const router = useRouter();
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setSubmitting(true);
		const project = await projectService.create(
			name.trim(),
			description.trim(),
		);
		await qc.invalidateQueries({ queryKey: ["projects"] });
		router.push(`/editor/${project.id}`);
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<motion.form
				initial={{ opacity: 0, scale: 0.96, y: 8 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.18 }}
				onClick={(e) => e.stopPropagation()}
				onSubmit={submit}
				className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
							<Sparkles className="h-4 w-4" />
						</div>
						<h2 className="text-[15px] font-semibold text-zinc-900">
							New Project
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-5 space-y-4">
					<div className="space-y-1.5">
						<Label>Project name</Label>
						<Input
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Payments Platform"
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							placeholder="What does this system do?"
						/>
					</div>
				</div>

				<div className="mt-6 flex justify-end gap-2">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						disabled={!name.trim() || submitting}
					>
						{submitting && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Create Project
					</Button>
				</div>
			</motion.form>
		</div>
	);
}
