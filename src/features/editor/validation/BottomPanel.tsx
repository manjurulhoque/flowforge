import { useQuery } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import {
	ChevronUp,
	ChevronDown,
	ShieldCheck,
	ScrollText,
	History,
	Sparkles,
	AlertCircle,
	AlertTriangle,
	Info,
	CheckCircle2,
} from "lucide-react";
import { useUiStore, type BottomTab } from "@/store/uiStore";
import { useDiagnosticsStore } from "@/store/diagnosticsStore";
import { validationService } from "@/services/validationService";
import { formatRelativeTime } from "@/utils/factory";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { Severity, ValidationIssue } from "@/types";

const TABS: { id: BottomTab; label: string; icon: React.ReactNode }[] = [
	{
		id: "validation",
		label: "Validation",
		icon: <ShieldCheck className="h-3.5 w-3.5" />,
	},
	{ id: "logs", label: "Logs", icon: <ScrollText className="h-3.5 w-3.5" /> },
	{
		id: "events",
		label: "Events",
		icon: <History className="h-3.5 w-3.5" />,
	},
	{
		id: "ai",
		label: "AI Suggestions",
		icon: <Sparkles className="h-3.5 w-3.5" />,
	},
];

export function BottomPanel() {
	const open = useUiStore((s) => s.bottomOpen);
	const tab = useUiStore((s) => s.bottomTab);
	const setTab = useUiStore((s) => s.setBottomTab);
	const toggle = useUiStore((s) => s.toggleBottom);
	const issues = useDiagnosticsStore((s) => s.issues);
	const errorCount = issues.filter((i) => i.severity === "error").length;

	return (
		<div className="flex shrink-0 flex-col border-t border-zinc-200 bg-white">
			<div className="flex h-9 items-center gap-1 px-2">
				{TABS.map((t) => (
					<button
						key={t.id}
						onClick={() => setTab(t.id)}
						className={cn(
							"flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
							open && tab === t.id
								? "bg-zinc-100 text-zinc-800"
								: "text-zinc-400 hover:text-zinc-600",
						)}
					>
						{t.icon}
						{t.label}
						{t.id === "validation" && issues.length > 0 && (
							<span
								className={cn(
									"rounded-full px-1.5 text-[9px] font-bold",
									errorCount
										? "bg-red-100 text-red-600"
										: "bg-zinc-100 text-zinc-500",
								)}
							>
								{issues.length}
							</span>
						)}
					</button>
				))}
				<Button
					variant="ghost"
					size="icon-sm"
					className="ml-auto"
					onClick={toggle}
					aria-label="Toggle panel"
				>
					{open ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronUp className="h-4 w-4" />
					)}
				</Button>
			</div>

			{open && (
				<div className="h-52 overflow-y-auto border-t border-zinc-100 px-3 py-2.5">
					{tab === "validation" && <ValidationView issues={issues} />}
					{tab === "logs" && <LogsView />}
					{tab === "events" && <EventsView />}
					{tab === "ai" && <AiView />}
				</div>
			)}
		</div>
	);
}

const SEV_ICON: Record<Severity, React.ReactNode> = {
	error: <AlertCircle className="h-4 w-4 text-red-400" />,
	warning: <AlertTriangle className="h-4 w-4 text-zinc-400" />,
	info: <Info className="h-4 w-4 text-zinc-400" />,
};

function ValidationView({ issues }: { issues: ValidationIssue[] }) {
	const { fitView, setNodes } = useReactFlow();
	const lastRunAt = useDiagnosticsStore((s) => s.lastRunAt);

	function focus(ids: string[]) {
		if (!ids.length) return;
		setNodes((nds) =>
			nds.map((n) => ({ ...n, selected: ids.includes(n.id) })),
		);
		fitView({
			nodes: ids.map((id) => ({ id })),
			duration: 500,
			padding: 0.5,
		});
	}

	if (!lastRunAt) {
		return (
			<Empty
				icon={<ShieldCheck className="h-5 w-5" />}
				text="Run validation to analyze your architecture."
			/>
		);
	}
	if (issues.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
				<CheckCircle2 className="h-6 w-6 text-zinc-400" />
				<p className="text-[13px] font-medium text-zinc-600">
					No issues found
				</p>
				<p className="text-[11px] text-zinc-400">
					Your architecture passed all checks.
				</p>
			</div>
		);
	}
	return (
		<div className="space-y-1.5">
			{issues.map((issue) => (
				<button
					key={issue.id}
					onClick={() => focus(issue.affectedNodeIds)}
					className="flex w-full items-start gap-2.5 rounded-lg border border-zinc-200 bg-white p-2.5 text-left transition-colors hover:bg-zinc-50"
				>
					<span className="mt-0.5">{SEV_ICON[issue.severity]}</span>
					<span className="min-w-0 flex-1">
						<span className="block text-[12.5px] font-medium text-zinc-800">
							{issue.message}
						</span>
						<span className="mt-0.5 block text-[11px] text-zinc-500">
							{issue.suggestion}
						</span>
					</span>
				</button>
			))}
		</div>
	);
}

function LogsView() {
	const { data } = useQuery({
		queryKey: ["logs"],
		queryFn: () => validationService.logs(),
	});
	const color: Record<string, string> = {
		info: "text-zinc-400",
		warn: "text-zinc-500",
		error: "text-red-400",
		success: "text-zinc-600",
	};
	return (
		<div className="space-y-0.5 font-mono text-[11.5px]">
			{(data ?? []).map((log) => (
				<div
					key={log.id}
					className="flex gap-2.5 rounded px-2 py-1 hover:bg-zinc-50"
				>
					<span className="text-zinc-300">
						{new Date(log.timestamp).toLocaleTimeString()}
					</span>
					<span
						className={cn(
							"w-14 shrink-0 font-semibold uppercase",
							color[log.level],
						)}
					>
						{log.level}
					</span>
					<span className="text-zinc-600">{log.message}</span>
				</div>
			))}
		</div>
	);
}

function EventsView() {
	const { data } = useQuery({
		queryKey: ["events"],
		queryFn: () => validationService.events(),
	});
	return (
		<div className="space-y-2">
			{(data ?? []).map((evt) => (
				<div
					key={evt.id}
					className="flex items-center gap-2.5 text-[12px]"
				>
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-500">
						{evt.actor === "you" ? "AK" : "SY"}
					</span>
					<span className="text-zinc-600">
						<b className="text-zinc-800">{evt.actor}</b>{" "}
						{evt.action}
					</span>
					<span className="ml-auto text-[11px] text-zinc-400">
						{formatRelativeTime(evt.timestamp)}
					</span>
				</div>
			))}
		</div>
	);
}

function AiView() {
	const { data } = useQuery({
		queryKey: ["ai"],
		queryFn: () => validationService.aiSuggestions(),
	});
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11.5px] text-zinc-500">
				<Sparkles className="h-3.5 w-3.5" /> AI architecture review ·
				preview
			</div>
			{(data ?? []).map((s) => (
				<div
					key={s.id}
					className="rounded-lg border border-zinc-200 bg-white p-2.5"
				>
					<p className="text-[12.5px] font-medium text-zinc-800">
						{s.title}
					</p>
					<p className="mt-0.5 text-[11.5px] text-zinc-500">
						{s.detail}
					</p>
				</div>
			))}
		</div>
	);
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-zinc-400">
			{icon}
			<p className="text-[12px]">{text}</p>
		</div>
	);
}
