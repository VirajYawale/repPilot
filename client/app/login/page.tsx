import type { Metadata } from "next";
import { Suspense } from "react";
import LoginLoading from "./loading";
import LoginContent from "./login-content";

export const metadata: Metadata = {
    title: "Sign In",
};

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginContent />
        </Suspense>
    );
}
