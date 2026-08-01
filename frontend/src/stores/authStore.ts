/**
 * Authentication state.
 *
 * `initialize()` is called once by `AuthGuard` on first render: if a refresh
 * token exists the session is restored (the api client refreshes a stale
 * access token automatically); otherwise the app is unauthenticated.
 */

import { create } from "zustand";

import { clearTokens, getTokens, saveTokens } from "@/lib/tokenStorage";
import { authService, type AuthUser } from "@/services/authService";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
	user: AuthUser | null;
	status: AuthStatus;
	initialize: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, name?: string) => Promise<void>;
	logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	status: "initializing",

	initialize: async () => {
		const { refreshToken } = getTokens();
		if (!refreshToken) {
			set({ user: null, status: "unauthenticated" });
			return;
		}
		try {
			const user = await authService.me();
			set({ user, status: "authenticated" });
		} catch {
			set({ user: null, status: "unauthenticated" });
		}
	},

	login: async (email, password) => {
		const pair = await authService.login({ email, password });
		saveTokens(pair.access_token, pair.refresh_token);
		const user = await authService.me();
		set({ user, status: "authenticated" });
	},

	register: async (email, password, name) => {
		const pair = await authService.register({ email, password, name });
		saveTokens(pair.access_token, pair.refresh_token);
		const user = await authService.me();
		set({ user, status: "authenticated" });
	},

	logout: async () => {
		const { refreshToken } = getTokens();
		if (refreshToken) {
			try {
				await authService.logout(refreshToken);
			} catch {
				// Session already invalid server-side; clear locally regardless.
			}
		}
		clearTokens();
		set({ user: null, status: "unauthenticated" });
	},
}));
