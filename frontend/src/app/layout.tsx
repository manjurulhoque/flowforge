import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
	title: "FlowForge — Design microservice architectures that actually deploy",
	description:
		"Drag, connect, and validate distributed systems on a visual canvas, then export straight to Docker Compose, Mermaid, draw.io, JSON, PNG, or SVG.",
	openGraph: {
		title: "FlowForge — Design microservice architectures that actually deploy",
		description:
			"A visual canvas for microservice architecture: design, validate against best-practice rules, and export real artifacts.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className="font-sans antialiased"
				suppressHydrationWarning={true}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
