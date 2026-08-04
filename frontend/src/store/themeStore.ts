import { create } from "zustand";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "flowforge.theme";

function readStored(): Theme {
	if (typeof window === "undefined") return "dark";
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		if (value === "light" || value === "dark") return value;
	} catch {
		/* ignore */
	}
	return "dark";
}

export function applyTheme(theme: Theme): void {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("data-theme", theme);
}

interface ThemeState {
	theme: Theme;
	hydrated: boolean;
	hydrate: () => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
	theme: "dark",
	hydrated: false,
	hydrate: () => {
		const theme = readStored();
		applyTheme(theme);
		set({ theme, hydrated: true });
	},
	setTheme: (theme) => {
		applyTheme(theme);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			/* ignore */
		}
		set({ theme });
	},
	toggleTheme: () => {
		const next: Theme = get().theme === "dark" ? "light" : "dark";
		get().setTheme(next);
	},
}));
