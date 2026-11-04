import { ApiError, ChatMessage, ChatSession, IndexStatusResponse, Repository, User } from "./api";

export function getApiBaseUrl() {
    return (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080"
    );
}

export function getGithubLoginUrl() {
    return `${getApiBaseUrl()}/oauth2/authorization/github`;
}

export async function parseError(res: Response): Promise<string> {
    try {
        const data = await res.json();
        return data.message ?? data.error ?? res.statusText;
    } catch {
        return res.statusText || "Request failed";
    }
}

export async function apiFetch<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const url = path.startsWith("http")
        ? path
        : `${getApiBaseUrl()}${path.startsWith("/") ? path : "/" + path}`;

    const res = await fetch(url, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        throw new ApiError(res.status, await parseError(res));
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export const api = {
    me: () => apiFetch<User>("/api/auth/me"),
    logout: () =>
        apiFetch<void>("/api/auth/logout", {
            method: "POST",
        }),

    listrepos: (refresh = true) =>
        apiFetch<Repository[]>(`/api/repos?refresh=${refresh}`),
    getRepo: (id: string) => apiFetch<Repository>(`/api/repos/${id}`),
    startIndex: (id: string) =>
        apiFetch<Repository>(`/api/repos/${id}/index`, { method: "POST" }),
    indexStatus: (id: string) =>
        apiFetch<IndexStatusResponse>(`/api/repos/${id}/index/status`),

    listChatSessions: (repoId: string) =>
        apiFetch<ChatSession[]>(`/api/chat/sessions?repositoryId=${repoId}`),
    listSessions: (repoId: string) =>
        apiFetch<ChatSession[]>(`/api/chat/sessions?repositoryId=${repoId}`),
    createChatSession: (repoId: string, title?: string) =>
        apiFetch<ChatSession>(`/api/chat/sessions`, {
            method: "POST",
            body: JSON.stringify({ repositoryId: repoId, title: title || "New chat" }),
        }),
    createSession: (repoId: string, title?: string) =>
        apiFetch<ChatSession>(`/api/chat/sessions`, {
            method: "POST",
            body: JSON.stringify({ repositoryId: repoId, title: title || "New chat" }),
        }),
    getChatMessages: (repoId: string, sessionId: string) =>
        apiFetch<ChatMessage[]>(`/api/chat/sessions/${sessionId}`),
    getMessages: (sessionId: string) =>
        apiFetch<ChatMessage[]>(`/api/chat/sessions/${sessionId}`),
};