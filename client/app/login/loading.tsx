"use client";

import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginLoading() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-background">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-52" />
                </div>
                <Card className="shadow-lg border-border/50">
                    <CardHeader className="items-center pb-2">
                        <Spinner className="size-8 text-primary" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <Skeleton className="h-10 w-full rounded-md" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}