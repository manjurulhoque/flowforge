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

const themeBootScript = `(function(){try{var t=localStorage.getItem("flowforge.theme");document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
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
