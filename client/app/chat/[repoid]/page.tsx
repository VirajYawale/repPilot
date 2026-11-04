// "use client";
//
// import { use } from "react";
//
// import { ChatView } from "@/components/chat/chat-view";
// import { RequireAuth } from "@/components/provider/require-auth";
//
// export default function ChatPage({
//     params,
// }: {
//     params: Promise<{ repoId: string }>;
// }) {
//     const { repoId } = use(params);
//
//     return (
//         <RequireAuth>
//             <ChatView repoId={repoId} />
//         </RequireAuth>
//     );
// }


import { ChatView } from "@/components/chat/chat-view";

type ChatPageProps = {
    params: Promise<{ repoid: string }>;
};

export default async function ChatPage({
                                           params,
                                       }: ChatPageProps) {
    const { repoid } = await params;

    if (!repoid) {
        return <div>Repository ID is missing from the URL.</div>;
    }

    return <ChatView repoId={repoid} />;
}
