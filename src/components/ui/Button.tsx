import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-40 select-none",
	{
		variants: {
			variant: {
				primary:
					"bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
				secondary:
					"bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 active:scale-[0.98]",
				ghost: "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100",
				outline:
					"border border-zinc-200 text-zinc-600 hover:bg-zinc-50",
				danger: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]",
			},
			size: {
				sm: "h-7 px-2.5 text-xs",
				md: "h-9 px-3.5",
				lg: "h-10 px-5",
				icon: "h-8 w-8",
				"icon-sm": "h-7 w-7",
			},
		},
		defaultVariants: { variant: "secondary", size: "md" },
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	),
);
Button.displayName = "Button";
