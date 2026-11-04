"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Repository } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/components/ui/toast";

const INDEXING_POLL_MS = 2000;

function isIndexingStatus(status?: string) {
  return status === "PENDING" || status === "INDEXING";
}

function updateRepoInListCache(
    queryClient: ReturnType<typeof useQueryClient>,
    repo: Repository
) {
  queryClient.setQueryData<Repository[]>(
      queryKeys.repo.list(),
      (current) => {
        if (!current) return current;

        return current.map((item) =>
            item.id === repo.id ? { ...item, ...repo } : item
        );
      }
  );
}

export function useRepos() {
  return useQuery({
    queryKey: queryKeys.repo.list(),
    queryFn: () => api.listRepos(false),
  });
}

export function useRepository(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repo.detail(repoId),
    queryFn: () => api.getRepo(repoId),
    enabled: Boolean(repoId),
    refetchInterval: (query) =>
        isIndexingStatus(query.state.data?.indexStatus)
            ? INDEXING_POLL_MS
            : false,
    retry: 1,
  });
}

export function useIndexStatus(
    repoId: string,
    enabled = false
) {
  return useQuery({
    queryKey: queryKeys.repo.status(repoId),
    queryFn: () => api.indexStatus(repoId),
    enabled: Boolean(repoId) && enabled,
    refetchInterval: (query) =>
        isIndexingStatus(query.state.data?.indexStatus)
            ? 1500
            : false,
    retry: 1,
  });
}

export function useStartIndexing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoId: string) => api.startIndex(repoId),

    onSuccess: (repo) => {
      queryClient.setQueryData(
          queryKeys.repo.detail(repo.id),
          repo
      );

      updateRepoInListCache(queryClient, repo);

      void queryClient.invalidateQueries({
        queryKey: queryKeys.repo.status(repo.id),
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.repo.detail(repo.id),
      });

      toast.add({
        title: "Indexing started",
        description: `Indexing ${repo.fullName}…`,
        type: "loading",
      });
    },

    onError: (error: Error) => {
      toast.add({
        title: "Could not start indexing",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useRefreshRepos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.listRepos(true),

    onSuccess: (repos) => {
      queryClient.setQueryData(
          queryKeys.repo.list(),
          repos
      );
    },

    onError: (error: Error) => {
      toast.add({
        title: "Sync failed",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function getRepoProgress(repo: {
  filesTotal?: number;
  fileTotal?: number;
  filesProcessed?: number;
  totalProcessed?: number;
  filesProceed?: number;
}) {
  const total = repo.filesTotal ?? repo.fileTotal ?? 0;

  const processed =
      repo.filesProcessed ??
      repo.totalProcessed ??
      repo.filesProceed ??
      0;

  if (total <= 0) return 0;

  return Math.min(
      100,
      Math.round((processed / total) * 100)
  );
}