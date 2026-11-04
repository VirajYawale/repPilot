// "use client";
//
// import { useRouter } from "next/navigation";
// import {
//     ArrowRight,
//     ExternalLink,
//     GitBranch,
//     Lock,
//     MessageSquare,
//     RotateCcw,
//     Sparkles,
//     Globe,
// } from "lucide-react";
//
// import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
// import { LanguageBadge } from "@/components/dashboard/language-badge";
// import { IndexStatusBadge } from "@/components/dashboard/repo-status";
// import { LanguageIcon } from "@/components/icons/language-icon";
// import { GithubIcon } from "@/components/icons/GithubIcon";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Spinner } from "@/components/ui/spinner";
// import { getRepoProgress, useStartIndexing } from "@/hooks/use-repo";
// import type { Repository } from "@/lib/api";
// import { cn } from "@/lib/utils";
//
// export function RepoCard({
//     repo,
//     onVisibilityClick,
// }: {
//     repo: Repository;
//     onVisibilityClick?: (visibility: "public" | "private") => void;
// }) {
//     const router = useRouter();
//     const indexMutation = useStartIndexing();
//     const isIndexing = repo.indexStatus === "INDEXING" || indexMutation.isPending;
//     const isFailed = repo.indexStatus === "FAILED";
//     const progress = getRepoProgress(repo);
//
//     function openChat() {
//         router.push(`/chat/${repo.id}`);
//     }
//
//     function handlePrimary() {
//         if (repo.indexStatus === "READY") {
//             openChat();
//             return;
//         }
//         indexMutation.mutate(repo.id, {
//             onSuccess: () => router.push(`/chat/${repo.id}`),
//         });
//     }
//
//     return (
//         <article
//             className={cn(
//                 "group flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border bg-background/50 shadow-sm backdrop-blur-sm transition-all duration-300",
//                 isFailed
//                     ? "border-destructive/30 bg-destructive/5 hover:border-destructive/40 hover:shadow-md"
//                     : "border-border/50 hover:-translate-y-1 hover:border-border/80 hover:bg-background/80 hover:shadow-md"
//             )}
//         >
//             <div className="border-b border-border/50 p-5">
//                 <div className="flex items-start justify-between gap-3">
//                     <div className="flex min-w-0 items-start gap-3">
//                         <LanguageBadge language={repo.language} showLabel={false} iconSize="sm" />
//                         <div className="min-w-0">
//                             <p className="truncate text-xs text-muted-foreground">{repo.owner}</p>
//                             <a
//                                 href={repo.htmlUrl || "#"}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="flex items-center gap-1.5 hover:underline"
//                             >
//                                 <GithubIcon className="size-3.5" />
//                                 <h3 className="truncate font-medium">{repo.name}</h3>
//                             </a>
//                         </div>
//                     </div>
//                     <IndexStatusBadge status={repo.indexStatus} />
//                 </div>
//             </div>
//
//             <div className="flex flex-1 flex-col gap-4 p-5">
//                 {!isFailed && (
//                     <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
//                         {repo.description || "No description provided."}
//                     </p>
//                 )}
//
//                 {isFailed && repo.description && (
//                     <p className="line-clamp-1 text-sm text-muted-foreground">
//                         {repo.description}
//                     </p>
//                 )}
//
//                 <div className="flex flex-wrap items-center gap-2">
//                     {repo.isPrivate ? (
//                         <button
//                             type="button"
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 onVisibilityClick?.("private");
//                             }}
//                             className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
//                         >
//                             <Lock className="size-3" />
//                             Private
//                         </button>
//                     ) : (
//                         <button
//                             type="button"
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 onVisibilityClick?.("public");
//                             }}
//                             className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
//                         >
//                             <Globe className="size-3" />
//                             Public
//                         </button>
//                     )}
//                     <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
//                         <GitBranch className="size-3" />
//                         {repo.defaultBranch}
//                     </span>
//                     {repo.language && (
//                         <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium">
//                             <LanguageIcon language={repo.language} size="sm" />
//                             {repo.language}
//                         </span>
//                     )}
//                     {repo.chunkCount > 0 && (
//                         <span
//                             className={cn(
//                                 "rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium",
//                                 isFailed
//                                     ? "border-destructive/20 text-destructive/80"
//                                     : "text-muted-foreground"
//                             )}
//                         >
//                             {repo.chunkCount.toLocaleString()} chunks
//                             {isFailed ? " indexed" : ""}
//                         </span>
//                     )}
//                 </div>
//
//                 {isIndexing && (
//                     <div className="mt-auto space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3">
//                         <div className="flex items-center justify-between text-xs text-muted-foreground">
//                             <span>Indexing…</span>
//                             <span>
//                                 {repo.filesProceed}/{repo.filesTotal || "?"}
//                             </span>
//                         </div>
//                         <Progress value={progress || 8} />
//                     </div>
//                 )}
//
//                 {isFailed && repo.errorMessage && (
//                     <IndexErrorAlert message={repo.errorMessage} />
//                 )}
//             </div>
//
//             <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 bg-muted/10 p-4 sm:p-5">
//                 {repo.htmlUrl ? (
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
//                     >
//                         <ExternalLink data-icon="inline-start" />
//                         GitHub
//                     </Button>
//                 ) : (
//                     <span />
//                 )}
//
//                 <div className="flex gap-2">
//                     {repo.indexStatus === "READY" && (
//                         <Button variant="secondary" size="sm" onClick={openChat}>
//                             <MessageSquare data-icon="inline-start" />
//                             Chat
//                         </Button>
//                     )}
//                     <Button
//                         size="sm"
//                         variant={isFailed ? "outline" : "default"}
//                         className={cn(isFailed && "border-destructive/30 text-destructive hover:bg-destructive/10")}
//                         disabled={isIndexing}
//                         onClick={handlePrimary}
//                     >
//                         {isIndexing ? (
//                             <>
//                                 <Spinner data-icon="inline-start" />
//                                 Indexing
//                             </>
//                         ) : repo.indexStatus === "READY" ? (
//                             <>
//                                 Open
//                                 <ArrowRight data-icon="inline-end" />
//                             </>
//                         ) : isFailed ? (
//                             <>
//                                 <RotateCcw data-icon="inline-start" />
//                                 Retry
//                             </>
//                         ) : (
//                             <>
//                                 <Sparkles data-icon="inline-start" />
//                                 Index
//                             </>
//                         )}
//                     </Button>
//                 </div>
//             </div>
//         </article>
//     );
// }

"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  GitBranch,
  Lock,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Globe,
} from "lucide-react";

import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { LanguageIcon } from "@/components/icons/language-icon";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repo";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RepoCard({
  repo,
  onVisibilityClick,
}: {
  repo: Repository;
  onVisibilityClick?: (visibility: "public" | "private") => void;
}) {
  const router = useRouter();
  const indexMutation = useStartIndexing();

  const isIndexing =
    repo.indexStatus === "INDEXING" || indexMutation.isPending;
  const isFailed = repo.indexStatus === "FAILED";
  const progress = getRepoProgress(repo);

  function openChat() {
    router.push(`/chat/${repo.id}`);
  }

  function handlePrimary() {
    if (repo.indexStatus === "READY") {
      openChat();
      return;
    }

    indexMutation.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  return (
    <article
      className={cn(
        "group flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border bg-background/50 shadow-sm backdrop-blur-sm transition-all duration-300",
        isFailed
          ? "border-destructive/30 bg-destructive/5 hover:border-destructive/40 hover:shadow-md"
          : "border-border/50 hover:-translate-y-1 hover:border-border/80 hover:bg-background/80 hover:shadow-md"
      )}
    >
      <div className="border-b border-border/50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <LanguageBadge
              language={repo.language}
              showLabel={false}
              iconSize="sm"
            />

            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {repo.owner}
              </p>

              <a
                href={repo.htmlUrl || undefined}
                target={repo.htmlUrl ? "_blank" : undefined}
                rel={repo.htmlUrl ? "noreferrer" : undefined}
                className="flex items-center gap-1.5 hover:underline"
                onClick={(event) => {
                  if (!repo.htmlUrl) event.preventDefault();
                }}
              >
                <GithubIcon className="size-3.5" />
                <h3 className="truncate font-medium">{repo.name}</h3>
              </a>
            </div>
          </div>

          <IndexStatusBadge status={repo.indexStatus} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {!isFailed && (
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {repo.description || "No description provided."}
          </p>
        )}

        {isFailed && repo.description && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {repo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onVisibilityClick?.(repo.isPrivate ? "private" : "public")
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {repo.isPrivate ? (
              <>
                <Lock className="size-3" />
                Private
              </>
            ) : (
              <>
                <Globe className="size-3" />
                Public
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
            <GitBranch className="size-3" />
            {repo.defaultBranch}
          </span>

          {repo.language && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium">
              <LanguageIcon language={repo.language} size="sm" />
              {repo.language}
            </span>
          )}

          {repo.chunkCount > 0 && (
            <span
              className={cn(
                "rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs font-medium",
                isFailed
                  ? "border-destructive/20 text-destructive/80"
                  : "text-muted-foreground"
              )}
            >
              {repo.chunkCount.toLocaleString()} chunks
              {isFailed ? " indexed" : ""}
            </span>
          )}
        </div>

        {isIndexing && (
          <div className="mt-auto space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Indexing…</span>
              <span>
                {repo.filesProceed}/{repo.filesTotal || "?"}
              </span>
            </div>
            <Progress value={progress || 8} />
          </div>
        )}

        {isFailed && repo.errorMessage && (
          <IndexErrorAlert message={repo.errorMessage} />
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 bg-muted/10 p-4 sm:p-5">
        {repo.htmlUrl ? (
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            GitHub
          </a>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          {repo.indexStatus === "READY" && (
            <Button variant="secondary" size="sm" onClick={openChat}>
              <MessageSquare data-icon="inline-start" />
              Chat
            </Button>
          )}

          <Button
            size="sm"
            variant={isFailed ? "outline" : "default"}
            className={cn(
              isFailed &&
                "border-destructive/30 text-destructive hover:bg-destructive/10"
            )}
            disabled={isIndexing}
            onClick={handlePrimary}
          >
            {isIndexing ? (
              <>
                <Spinner data-icon="inline-start" />
                Indexing
              </>
            ) : repo.indexStatus === "READY" ? (
              <>
                Open
                <ArrowRight data-icon="inline-end" />
              </>
            ) : isFailed ? (
              <>
                <RotateCcw data-icon="inline-start" />
                Retry
              </>
            ) : (
              <>
                <Sparkles data-icon="inline-start" />
                Index
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
