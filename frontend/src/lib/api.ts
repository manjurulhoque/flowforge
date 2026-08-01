/**
 * Typed fetch wrapper for the FlowForge API.
 *
 * - Serializes JSON bodies, parses the backend error envelope
 *   `{"error": {"code", "message", "details"}}` into a typed `ApiError`.
 * - Attaches the bearer token when `auth` is set.
 * - On a 401 it refreshes the session once via `/auth/refresh` and retries
 *   the original request. Concurrent 401s share a single refresh call.
 */

import { clearTokens, getTokens, saveTokens } from "@/lib/tokenStorage";

export const API_BASE =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface ErrorEnvelope {
	error?: { code?: string; message?: string; details?: unknown };
}

export class ApiError extends Error {
	readonly status: number;
	readonly code: string | undefined;
	readonly details: unknown;

	constructor(
		status: number,
		message: string,
		code?: string,
		details?: unknown,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	/** Attach the bearer access token. Default: false. */
	auth?: boolean;
	/** Allow a 401 → refresh → retry cycle. Default: true. */
	retry?: boolean;
}

async function rawFetch<T>(path: string, options: RequestOptions): Promise<T> {
	const { method = "GET", body, auth = false } = options;
	const headers: Record<string, string> = { Accept: "application/json" };
	if (body !== undefined) headers["Content-Type"] = "application/json";
	if (auth) {
		const { accessToken } = getTokens();
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
	}

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	if (res.status === 204) return undefined as T;

	const text = await res.text();
	let payload: unknown = null;
	if (text) {
		try {
			payload = JSON.parse(text) as unknown;
		} catch {
			payload = text;
		}
	}

	if (!res.ok) {
		const envelope = payload as ErrorEnvelope;
		throw new ApiError(
			res.status,
			envelope?.error?.message ?? `Request failed (${res.status})`,
			envelope?.error?.code,
			envelope?.error?.details,
		);
	}
	return payload as T;
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
	const { refreshToken } = getTokens();
	if (!refreshToken) return false;
	try {
		const pair = await rawFetch<{
			access_token: string;
			refresh_token: string;
		}>("/auth/refresh", {
			method: "POST",
			body: { refresh_token: refreshToken },
		});
		saveTokens(pair.access_token, pair.refresh_token);
		return true;
	} catch {
		clearTokens();
		return false;
	}
}

function refreshSession(): Promise<boolean> {
	refreshPromise ??= doRefresh().finally(() => {
		refreshPromise = null;
	});
	return refreshPromise;
}

export async function apiFetch<T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	try {
		return await rawFetch<T>(path, options);
	} catch (error) {
		if (
			error instanceof ApiError &&
			error.status === 401 &&
			options.auth === true &&
			options.retry !== false
		) {
			const refreshed = await refreshSession();
			if (refreshed) return rawFetch<T>(path, options);
		}
		throw error;
	}
}
