"use client";

import { RequireAuth } from "@/components/provider/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { RepoDashboard } from "@/components/dashboard/repo-dashboard";

export function DashboardContent() {
    return (
        <RequireAuth>
            <AppShell hideHeader={true}>
                <div className="p-6">
                    <RepoDashboard />
                </div>
            </AppShell>
        </RequireAuth>
    );
}
