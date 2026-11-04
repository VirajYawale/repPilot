"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { GithubIcon } from "@/components/icons/GithubIcon";
import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from "@/lib/apiBaseUrl";
import { LanguageIcon } from "@/components/icons/language-icon";
import LoginLoading from "./loading";
import { useCurrentUser } from "@/hooks/use-auth";

export default function LoginContent() {
    const params = useSearchParams();
    const router = useRouter();
    const error = params.get("error");
    const next = params.get("next") || "/dashboard";
    const { data: user, isLoading } = useCurrentUser();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace(next.startsWith("/") ? next : "/dashboard");
        }
    }, [user, isLoading, router, next]);

    if (isLoading || user) {
        return <LoginLoading />;
    }

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-background overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            {/* Mode Toggle Button */}
            <div className="absolute top-6 right-6 z-10">
                <ModeToggle />
            </div>

            <div className="w-full max-w-sm space-y-6 z-10">
                <div className="flex flex-col items-center text-center">
                    <BrandMark className="scale-110 mb-2" />
                </div>

                <Card className="shadow-xl border-border/60">
                    <CardHeader className="text-center space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Connect your GitHub account to chat with your repositories
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="size-4" />
                                <AlertTitle>Sign in failed</AlertTitle>
                                <AlertDescription>
                                    Please try again to sign in with GitHub.
                                </AlertDescription>
                            </Alert>
                        )}

                        <a
                            href={getGithubLoginUrl()}
                            className={cn(
                                buttonVariants({ variant: "default", size: "lg" }),
                                "w-full gap-2.5 font-medium shadow-sm hover:shadow transition-all"
                            )}
                        >
                            <GithubIcon className="size-5" />
                            Continue with GitHub
                        </a>

                        <div className="pt-2 border-t border-border/40">
                            <p className="text-center text-[11px] text-muted-foreground mb-2.5 font-medium">
                                Chat & query across repositories in
                            </p>
                            <div className="flex items-center justify-center gap-3.5 text-muted-foreground">
                                <span title="TypeScript"><LanguageIcon language="typescript" size={18} /></span>
                                <span title="Python"><LanguageIcon language="python" size={18} /></span>
                                <span title="Java"><LanguageIcon language="java" size={18} /></span>
                                <span title="Go"><LanguageIcon language="go" size={18} /></span>
                                <span title="Rust"><LanguageIcon language="rust" size={18} /></span>
                                <span title="C++"><LanguageIcon language="cpp" size={18} /></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
