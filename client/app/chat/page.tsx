
"use client";

import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { MessageSquare, Plus, FolderGit2 } from "lucide-react";

import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
    const repositoriesQuery = useQuery({
        queryKey: ["repositories"],
        queryFn: () => api.listRepos(false),
    });

    const repositories = repositoriesQuery.data ?? [];

    const sessionQueries = useQueries({
        queries: repositories.map((repo) => ({
            queryKey: ["chat-sessions", repo.id],
            queryFn: () => api.listSessions(repo.id),
            enabled: repo.indexStatus === "READY" ||
                repo.indexStatus === "COMPLETED",
        })),
    });

    const loading =
        repositoriesQuery.isLoading || sessionQueries.some((query) => query.isLoading);

    const conversations = repositories.flatMap((repo, index) =>
        (sessionQueries[index]?.data ?? []).map((session) => ({
            ...session,
            repositoryId: repo.id,
            repositoryName: repo.fullName,
        }))
    );

    return (
        <AppShell
            title="Chat history"
            description="All your repository conversations in one place"
        >
            <main className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Your conversations</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Reopen a previous conversation or start a new one.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/repositories"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        <Plus className="size-4" />
                        New chat
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-20 rounded-xl" />
                        ))}
                    </div>
                ) : repositoriesQuery.isError ? (
                    <p className="text-sm text-destructive">
                        Could not load repositories. Please refresh and try again.
                    </p>
                ) : conversations.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
                        <h3 className="font-semibold">No conversations yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Index a repository and start chatting with its code.
                        </p>
                        <Link
                            href="/dashboard/repositories"
                            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                        >
                            Browse repositories
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={`/chat/${conversation.repositoryId}?sessionId=${conversation.id}`}
                                className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="rounded-lg bg-muted p-3">
                                    <MessageSquare className="size-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-medium">
                                        {conversation.title}
                                    </h3>
                                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
                                        <FolderGit2 className="size-4 shrink-0" />
                                        {conversation.repositoryName}
                                    </p>
                                </div>

                                <span className="text-sm text-muted-foreground">
                  Open →
                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </AppShell>
    );
}
