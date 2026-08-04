"use client";

import { type ReactNode, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const hydrate = useThemeStore((s) => s.hydrate);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	return children;
}
