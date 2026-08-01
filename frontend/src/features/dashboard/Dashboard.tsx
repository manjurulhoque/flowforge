"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Plus,
	Search,
	Boxes,
	MoreHorizontal,
	Copy,
	Archive,
	Trash2,
	ArrowUpRight,
} from "lucide-react";
import { projectService } from "@/services/projectService";
import { formatRelativeTime } from "@/utils/factory";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/Badge";
import { UserMenu } from "@/components/auth/UserMenu";
import { CreateProjectDialog } from "./CreateProjectDialog";
import type { ProjectSummary } from "@/types";
import { cn } from "@/utils/cn";

type Filter = "all" | "active" | "archived";

export function Dashboard() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<Filter>("all");
	const [creating, setCreating] = useState(false);

	const { data: projects = [], isLoading } = useQuery({
		queryKey: ["projects"],
		queryFn: () => projectService.list(),
	});

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return projects
			.filter((p) => (filter === "all" ? true : p.status === filter))
			.filter(
				(p) =>
					!q ||
					p.name.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q),
			);
	}, [projects, search, filter]);

	return (
		<div className="min-h-screen bg-zinc-50">
			<header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-100/90 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a2b] text-[15px] font-bold text-white">
						F
					</div>
					<span className="text-[15px] font-semibold tracking-tight text-zinc-900">
						FlowForge
					</span>
					<Badge className="ml-1">Beta</Badge>
					<div className="ml-auto flex items-center gap-2">
						<UserMenu />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-10">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
						Projects
					</h1>
					<p className="text-[13.5px] text-zinc-500">
						Design, validate and export distributed system
						architectures.
					</p>
				</div>

				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search projects…"
							className="pl-9"
						/>
					</div>
					<div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
						{(["all", "active", "archived"] as Filter[]).map(
							(f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className={cn(
										"rounded-md px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
										filter === f
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-500 hover:text-zinc-700",
									)}
								>
									{f}
								</button>
							),
						)}
					</div>
					<Button variant="primary" onClick={() => setCreating(true)}>
						<Plus className="h-4 w-4" /> New Project
					</Button>
				</div>

				{isLoading ? (
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100"
							/>
						))}
					</div>
				) : filtered.length === 0 ? (
					<EmptyState onCreate={() => setCreating(true)} />
				) : (
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{filtered.map((p, i) => (
							<ProjectCard key={p.id} project={p} index={i} />
						))}
					</div>
				)}
			</main>

			{creating && (
				<CreateProjectDialog onClose={() => setCreating(false)} />
			)}
		</div>
	);
}

function ProjectCard({
	project,
	index,
}: {
	project: ProjectSummary;
	index: number;
}) {
	const router = useRouter();
	const qc = useQueryClient();
	const [menu, setMenu] = useState(false);

	async function action(fn: () => Promise<unknown>) {
		setMenu(false);
		await fn();
		qc.invalidateQueries({ queryKey: ["projects"] });
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, delay: index * 0.03 }}
			onClick={() => router.push(`/editor/${project.id}`)}
			className="group relative cursor-pointer rounded-2xl border border-zinc-200 bg-zinc-100 p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
		>
			<div className="flex items-start justify-between">
				<div
					className="flex h-10 w-10 items-center justify-center rounded-xl"
					style={{
						backgroundColor: `${project.accent}18`,
						color: project.accent,
					}}
				>
					<Boxes className="h-5 w-5" />
				</div>
				<div className="relative">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setMenu((v) => !v);
						}}
						className="rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100"
						aria-label="Project menu"
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
					{menu && (
						<div
							onClick={(e) => e.stopPropagation()}
							className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 p-1 shadow-lg"
						>
							<MenuItem
								icon={<Copy className="h-3.5 w-3.5" />}
								label="Duplicate"
								onClick={() =>
									action(() =>
										projectService.duplicate(project.id),
									)
								}
							/>
							<MenuItem
								icon={<Archive className="h-3.5 w-3.5" />}
								label={
									project.status === "archived"
										? "Unarchive"
										: "Archive"
								}
								onClick={() =>
									action(() =>
										projectService.archive(project.id),
									)
								}
							/>
							<MenuItem
								icon={<Trash2 className="h-3.5 w-3.5" />}
								label="Delete"
								danger
								onClick={() =>
									action(() =>
										projectService.remove(project.id),
									)
								}
							/>
						</div>
					)}
				</div>
			</div>

			<h3 className="mt-4 flex items-center gap-1 text-[15px] font-semibold text-zinc-900">
				{project.name}
				<ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
			</h3>
			<p className="mt-1 line-clamp-2 text-[12.5px] text-zinc-500">
				{project.description}
			</p>

			<div className="mt-4 flex items-center gap-3 text-[11.5px] text-zinc-400">
				<span>{project.nodeCount} nodes</span>
				<span className="h-1 w-1 rounded-full bg-zinc-200" />
				<span>{project.edgeCount} edges</span>
				{project.status === "archived" && (
					<Badge className="ml-1">Archived</Badge>
				)}
				<span className="ml-auto">
					{formatRelativeTime(project.updatedAt)}
				</span>
			</div>
		</motion.div>
	);
}

function MenuItem({
	icon,
	label,
	onClick,
	danger,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	danger?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors hover:bg-zinc-50",
				danger ? "text-red-600" : "text-zinc-700",
			)}
		>
			{icon}
			{label}
		</button>
	);
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
	return (
		<div className="mt-16 flex flex-col items-center gap-3 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100">
				<Boxes className="h-6 w-6 text-zinc-300" />
			</div>
			<p className="text-[14px] font-medium text-zinc-700">
				No projects yet
			</p>
			<p className="max-w-xs text-[12.5px] text-zinc-400">
				Create your first architecture to start designing microservices.
			</p>
			<Button variant="primary" className="mt-2" onClick={onCreate}>
				<Plus className="h-4 w-4" /> New Project
			</Button>
		</div>
	);
}
