/**
 * Persisted auth tokens.
 *
 * Kept separate from the auth store so the fetch wrapper (`lib/api.ts`)
 * can read/refresh tokens without importing the store (no circular deps).
 * Access is guarded for SSR — the browser is the only consumer.
 */

const ACCESS_KEY = "flowforge.access_token";
const REFRESH_KEY = "flowforge.refresh_token";

export function getTokens(): {
	accessToken: string | null;
	refreshToken: string | null;
} {
	if (typeof window === "undefined") {
		return { accessToken: null, refreshToken: null };
	}
	return {
		accessToken: window.localStorage.getItem(ACCESS_KEY),
		refreshToken: window.localStorage.getItem(REFRESH_KEY),
	};
}

export function saveTokens(accessToken: string, refreshToken: string): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(ACCESS_KEY, accessToken);
	window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(ACCESS_KEY);
	window.localStorage.removeItem(REFRESH_KEY);
}
