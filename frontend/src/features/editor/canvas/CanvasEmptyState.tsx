import { MousePointerSquareDashed } from "lucide-react";

export function CanvasEmptyState() {
	return (
		<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div className="animate-fade-in-up flex flex-col items-center gap-3 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100">
					<MousePointerSquareDashed className="h-6 w-6 text-zinc-300" />
				</div>
				<div>
					<p className="text-sm font-medium text-zinc-500">
						Start designing your system
					</p>
					<p className="mt-1 text-[12.5px] text-zinc-400">
						Drag services, databases, and infrastructure from the
						left panel.
					</p>
				</div>
			</div>
		</div>
	);
}
