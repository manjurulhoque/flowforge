import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
	title: "FlowForge — Microservice Architecture Designer",
	description:
		"Design, validate and export distributed system architectures.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased"
				suppressHydrationWarning={true}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
