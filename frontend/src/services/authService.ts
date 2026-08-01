/**
 * Auth API client. Pure HTTP calls — no state, no localStorage.
 * State lives in `stores/authStore.ts`; token persistence in `lib/tokenStorage`.
 */

import { apiFetch } from "@/lib/api";

export interface TokenPair {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface RegisterInput {
	email: string;
	password: string;
	name?: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export const authService = {
	register: (input: RegisterInput) =>
		apiFetch<TokenPair>("/auth/register", {
			method: "POST",
			body: input,
		}),

	login: (input: LoginInput) =>
		apiFetch<TokenPair>("/auth/login", { method: "POST", body: input }),

	logout: (refreshToken: string) =>
		apiFetch<void>("/auth/logout", {
			method: "POST",
			body: { refresh_token: refreshToken },
		}),

	me: () => apiFetch<AuthUser>("/auth/me", { auth: true }),
};
