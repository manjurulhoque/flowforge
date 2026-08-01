import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
	<input
		ref={ref}
		className={cn(
			"h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/40",
			className,
		)}
		{...props}
	/>
));
Input.displayName = "Input";

export const Textarea = forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
	<textarea
		ref={ref}
		className={cn(
			"w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/40 resize-none",
			className,
		)}
		{...props}
	/>
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
	HTMLSelectElement,
	React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
	<select
		ref={ref}
		className={cn(
			"h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/40",
			className,
		)}
		{...props}
	>
		{children}
	</select>
));
Select.displayName = "Select";

export function Label({
	className,
	...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		<label
			className={cn("text-xs font-medium text-zinc-500", className)}
			{...props}
		/>
	);
}

export function Switch({
	checked,
	onCheckedChange,
	disabled,
}: {
	checked: boolean;
	onCheckedChange: (v: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/50 disabled:opacity-40",
				checked ? "bg-zinc-700" : "bg-zinc-300",
			)}
		>
			<span
				className={cn(
					"inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
					checked ? "translate-x-[18px]" : "translate-x-1",
				)}
			/>
		</button>
	);
}
