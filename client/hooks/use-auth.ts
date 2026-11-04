"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiBaseUrl";
import { queryKeys } from "@/lib/query-keys";

export const AUTH_COOKIE = "devpilot_auth";

export function setAuthCookie(authed: boolean) {
    if (typeof document == "undefined") return;

    if (authed) {
        document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
        document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; sameSite=Lax`;
    }
}

export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.auth.me(),
        queryFn: async () => {
            try {
                const user = await api.me();
                setAuthCookie(true);
                return user;
            } catch (error) {
                setAuthCookie(false);
                throw error;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.logout();
        },
        onSuccess: () => {
            setAuthCookie(false);
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
            router.replace("/login");
        },
    });
}

export function useAuth() {
    const query = useCurrentUser();
    const logoutMutation = useLogout();

    return {
        user: query.data ?? null,
        isLoading: query.isLoading,
        isAuthenticated: !!query.data,
        error: query.error,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
        refetch: query.refetch,
    };
}