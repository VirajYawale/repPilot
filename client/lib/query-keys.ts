export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        me: () => [...queryKeys.auth.all, "me"] as const,
    },
    repo: {
        all: ["repo"] as const,
        list: () => [...queryKeys.repo.all, "list"] as const,
        detail: (id: string) => [...queryKeys.repo.all, "details", id] as const,
        status: (id: string) => [...queryKeys.repo.all, "status", id] as const,
    },
    chat: {
        all: ["chat"] as const,
        sessions: (repositoryId: string) =>
            [...queryKeys.chat.all, "sessions", repositoryId] as const,
        messages: (sessionId: string) =>
            [...queryKeys.chat.all, "messages", sessionId] as const,
    },
    fileTree: {
        all: ["fileTree"] as const,
        list: (repositoryId: string) =>
            [...queryKeys.fileTree.all, "list", repositoryId] as const,
    },
};