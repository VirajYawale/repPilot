//
// "use client";
//
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import { ArrowLeft } from "lucide-react";
//
// import { ChatComposer } from "@/components/chat/chat-composer";
// import { ChatMessages } from "@/components/chat/chat-messages";
// import { ChatSidebar } from "@/components/chat/chat-sidebar";
// import { IndexingState } from "@/components/chat/indexing-state";
// import { AppShell } from "@/components/layout/app-shell";
// import { Skeleton } from "@/components/ui/skeleton";
//
// import {
//   useChatMessages,
//   useChatSessions,
//   useCreateChatSession,
//   useStreamChat,
// } from "@/hooks/use-chat";
//
// import { useIndexStatus, useRepository } from "@/hooks/use-repo";
//
// export function ChatView({ repoId }: { repoId: string }) {
//   const repoQuery = useRepository(repoId);
//
//   const initialStatus = repoQuery.data?.indexStatus;
//
//   const statusQuery = useIndexStatus(
//     repoId,
//     initialStatus === "INDEXING" ||
//       initialStatus === "PENDING" ||
//       initialStatus === "COMPLETED"
//   );
//
//   // Normalize backend status to the status values used by the UI.
//   const rawStatus =
//     statusQuery.data?.indexStatus ?? repoQuery.data?.indexStatus;
//
//   const indexStatus =
//     rawStatus === "COMPLETED" ? "READY" : rawStatus;
//
//   const ready = indexStatus === "READY";
//   const isIndexing = indexStatus === "INDEXING";
//
//   const sessionsQuery = useChatSessions(repoId, ready);
//   const createSession = useCreateChatSession(repoId);
//
//   const [selectedSessionId, setSelectedSessionId] =
//     useState<string | null>(null);
//
//   const autoCreateRef = useRef(false);
//
//   const sessionId =
//     selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;
//
//   const messagesQuery = useChatMessages(sessionId);
//
//   const { send, stop, streaming, streamText } =
//     useStreamChat(sessionId);
//
//   // Reset local session selection when the repository changes.
//   useEffect(() => {
//     setSelectedSessionId(null);
//     autoCreateRef.current = false;
//   }, [repoId]);
//
//   // Create a chat session only after indexing is complete
//   // and the existing session list has loaded successfully.
//   useEffect(() => {
//     if (!ready || !sessionsQuery.isSuccess) {
//       return;
//     }
//
//     if ((sessionsQuery.data?.length ?? 0) > 0) {
//       return;
//     }
//
//     if (createSession.isPending || autoCreateRef.current) {
//       return;
//     }
//
//     autoCreateRef.current = true;
//
//     createSession.mutate(undefined, {
//       onSuccess: (session) => {
//         setSelectedSessionId(session.id);
//       },
//       onError: (error) => {
//         console.error("Failed to create chat session:", error);
//         autoCreateRef.current = false;
//       },
//     });
//   }, [
//     ready,
//     sessionsQuery.isSuccess,
//     sessionsQuery.data,
//     createSession.isPending,
//     createSession.mutate,
//   ]);
//
//   if (repoQuery.isLoading) {
//     return (
//       <AppShell title="Loading chat…">
//         <div className="grid flex-1 gap-4 p-4 md:grid-cols-[18rem_1fr]">
//           <Skeleton className="min-h-80 rounded-2xl" />
//           <Skeleton className="min-h-80 rounded-2xl" />
//         </div>
//       </AppShell>
//     );
//   }
//
//   if (repoQuery.isError || !repoQuery.data) {
//     return (
//       <AppShell title="Repository unavailable">
//         <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
//           <p className="text-sm text-muted-foreground">
//             {repoQuery.error instanceof Error
//               ? repoQuery.error.message
//               : "Repository not found"}
//           </p>
//
//           <Link
//             href="/dashboard"
//             className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
//           >
//             Back to dashboard
//           </Link>
//         </div>
//       </AppShell>
//     );
//   }
//
//   const repo = repoQuery.data;
//
//   const chatRepo = {
//     ...repo,
//     indexStatus: indexStatus ?? repo.indexStatus,
//     filesProceed:
//       statusQuery.data?.filesProcessed ?? repo.filesProceed,
//     filesTotal:
//       statusQuery.data?.filesTotal ?? repo.filesTotal,
//     chunkCount:
//       statusQuery.data?.chunkCount ?? repo.chunkCount,
//     errorMessage:
//       statusQuery.data?.errorMessage ?? repo.errorMessage,
//   };
//
//   return (
//     <AppShell
//       title={repo.fullName}
//       description={
//         ready
//           ? "Ask questions grounded in this repository"
//           : isIndexing
//             ? "Indexing repository files…"
//             : "Waiting for indexing to finish"
//       }
//       actions={
//         <Link
//           href="/dashboard"
//           className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
//         >
//           <ArrowLeft className="size-4" />
//           Repos
//         </Link>
//       }
//     >
//       <div className="flex min-h-0 flex-1 flex-col md:flex-row">
//         <ChatSidebar
//           repo={chatRepo}
//           sessionId={sessionId}
//           onSelectSession={setSelectedSessionId}
//         />
//
//         <section className="flex min-h-[70vh] min-w-0 flex-1 flex-col">
//           {!ready ? (
//             <IndexingState
//               repo={chatRepo}
//               status={statusQuery.data}
//             />
//           ) : (
//             <>
//               <ChatMessages
//                 repo={repo}
//                 messages={messagesQuery.data ?? []}
//                 streamText={streamText}
//                 isLoading={messagesQuery.isLoading}
//               />
//
//               <ChatComposer
//                 disabled={!sessionId}
//                 streaming={streaming}
//                 onSend={send}
//                 onStop={stop}
//               />
//             </>
//           )}
//         </section>
//       </div>
//     </AppShell>
//   );
// }



"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useStreamChat,
} from "@/hooks/use-chat";

import { useIndexStatus, useRepository } from "@/hooks/use-repo";

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);

  const initialStatus = repoQuery.data?.indexStatus;

  const statusQuery = useIndexStatus(
      repoId,
      initialStatus === "INDEXING" ||
      initialStatus === "PENDING" ||
      initialStatus === "COMPLETED"
  );

  const rawStatus =
      statusQuery.data?.indexStatus ?? repoQuery.data?.indexStatus;

  const indexStatus =
      rawStatus === "COMPLETED" ? "READY" : rawStatus;

  const ready = indexStatus === "READY";
  const isIndexing =
      indexStatus === "INDEXING" || indexStatus === "PENDING";

  const sessionsQuery = useChatSessions(repoId, ready);
  const createSession = useCreateChatSession(repoId);

  const [selectedSessionId, setSelectedSessionId] =
      useState<string | null>(null);

  const autoCreateRef = useRef(false);

  const sessionId =
      selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } =
      useStreamChat(sessionId);

  useEffect(() => {
    setSelectedSessionId(null);
    autoCreateRef.current = false;
  }, [repoId]);

  useEffect(() => {
    if (!ready || !sessionsQuery.isSuccess) return;
    if ((sessionsQuery.data?.length ?? 0) > 0) return;
    if (createSession.isPending || autoCreateRef.current) return;

    autoCreateRef.current = true;

    createSession.mutate(undefined, {
      onSuccess: (session) => {
        setSelectedSessionId(session.id);
      },
      onError: (error) => {
        console.error("Failed to create chat session:", error);
        autoCreateRef.current = false;
      },
    });
  }, [
    ready,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession.isPending,
    createSession.mutate,
  ]);

  if (repoQuery.isLoading) {
    return (
        <AppShell title="Loading chat…">
          <div className="grid flex-1 gap-4 p-4 md:grid-cols-[18rem_1fr]">
            <Skeleton className="min-h-80 rounded-2xl" />
            <Skeleton className="min-h-80 rounded-2xl" />
          </div>
        </AppShell>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    const errorMessage =
        repoQuery.error instanceof Error
            ? repoQuery.error.message
            : "Repository query returned no data.";

    return (
        <AppShell title="Repository unavailable">
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
            <p className="text-sm text-destructive">{errorMessage}</p>

            <p className="text-xs text-muted-foreground">
              Repository ID: {repoId || "(empty)"}
            </p>

            <button
                type="button"
                onClick={() => void repoQuery.refetch()}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Retry loading repository
            </button>

            <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to dashboard
            </Link>
          </div>
        </AppShell>
    );
  }

  const repo = repoQuery.data;

  const chatRepo = {
    ...repo,
    indexStatus: indexStatus ?? repo.indexStatus,
    filesProcessed:
        statusQuery.data?.filesProcessed ??
        repo.filesProcessed ??
        repo.filesProceed ??
        0,
    filesProceed:
        statusQuery.data?.filesProcessed ??
        repo.filesProceed ??
        repo.filesProcessed ??
        0,
    filesTotal:
        statusQuery.data?.filesTotal ??
        repo.filesTotal ??
        0,
    chunkCount:
        statusQuery.data?.chunkCount ?? repo.chunkCount,
    errorMessage:
        statusQuery.data?.errorMessage ?? repo.errorMessage,
  };

  return (
      <AppShell
          title={repo.fullName}
          description={
            ready
                ? "Ask questions grounded in this repository"
                : isIndexing
                    ? "Indexing repository files…"
                    : "Waiting for indexing to finish"
          }
          actions={
            <Link
                href="/dashboard"
                className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="size-4" />
              Repos
            </Link>
          }
      >
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <ChatSidebar
              repo={chatRepo}
              sessionId={sessionId}
              onSelectSession={setSelectedSessionId}
          />

          <section className="flex min-h-[70vh] min-w-0 flex-1 flex-col">
            {!ready ? (
                <IndexingState
                    repo={chatRepo}
                    status={statusQuery.data}
                />
            ) : (
                <>
                  <ChatMessages
                      repo={chatRepo}
                      messages={messagesQuery.data ?? []}
                      streamText={streamText}
                      isLoading={messagesQuery.isLoading}
                  />

                  <ChatComposer
                      disabled={!sessionId}
                      streaming={streaming}
                      onSend={send}
                      onStop={stop}
                  />
                </>
            )}
          </section>
        </div>
      </AppShell>
  );
}
