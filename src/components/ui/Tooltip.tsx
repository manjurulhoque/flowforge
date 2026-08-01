import { cn } from "@/utils/cn";

/** Lightweight CSS tooltip. */
export function Tooltip({
	label,
	children,
	side = "bottom",
	className,
}: {
	label: string;
	children: React.ReactNode;
	side?: "top" | "bottom";
	className?: string;
}) {
	return (
		<span className={cn("group/tt relative inline-flex", className)}>
			{children}
			<span
				className={cn(
					"pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover/tt:opacity-100",
					side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
				)}
			>
				{label}
			</span>
		</span>
	);
}
