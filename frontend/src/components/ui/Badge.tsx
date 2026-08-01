import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import type { NodeStatus } from "@/types";

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
	{
		variants: {
			tone: {
				neutral: "bg-zinc-100 text-zinc-500 border border-zinc-200",
				indigo: "bg-zinc-100 text-zinc-500 border border-zinc-200",
				green: "bg-zinc-100 text-zinc-500 border border-zinc-200",
				amber: "bg-zinc-100 text-zinc-500 border border-zinc-200",
				red: "bg-red-50 text-red-600 border border-red-200/60",
			},
		},
		defaultVariants: { tone: "neutral" },
	},
);

export interface BadgeProps
	extends
		React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ tone }), className)} {...props} />
	);
}

const STATUS_TONE: Record<NodeStatus, NonNullable<BadgeProps["tone"]>> = {
	healthy: "green",
	warning: "amber",
	error: "red",
	unknown: "neutral",
};
const STATUS_LABEL: Record<NodeStatus, string> = {
	healthy: "Healthy",
	warning: "Degraded",
	error: "Unhealthy",
	unknown: "Unknown",
};

export function StatusBadge({ status }: { status: NodeStatus }) {
	return (
		<Badge tone={STATUS_TONE[status]}>
			<span
				className={cn(
					"h-1.5 w-1.5 rounded-full",
					status === "healthy" && "bg-zinc-400",
					status === "warning" && "bg-zinc-500",
					status === "error" && "bg-red-400",
					status === "unknown" && "bg-zinc-300",
				)}
			/>
			{STATUS_LABEL[status]}
		</Badge>
	);
}
