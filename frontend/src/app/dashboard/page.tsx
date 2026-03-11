"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Bell,
    Code2,
    Compass,
    Ellipsis,
    House,
    Image as ImageIcon,
    MessageSquare,
    Settings,
    User,
    UserPlus,
    Video,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { createPost, getFeedPosts } from "@/services/postServices";
import { uploadPostFiles, uploadPostScreenshots } from "@/services/uploadServices";
import { searchSkills, sendConnectionRequest } from "@/services/searchServices";

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House, active: true },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/skills", label: "My Skills", icon: Code2 },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

const trending = [
    { name: "TypeScript", count: "1.2k posts", width: "w-[90%]", color: "bg-[#2b80e0]" },
    { name: "Next.js 14", count: "850 posts", width: "w-[76%]", color: "bg-[#18b07a]" },
    { name: "Rust", count: "640 posts", width: "w-[62%]", color: "bg-[#ef9b21]" },
    { name: "Kubernetes", count: "420 posts", width: "w-[46%]", color: "bg-[#4284f3]" },
];

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();
    const [postContent, setPostContent] = useState("");
    const [postImages, setPostImages] = useState<File[]>([]);
    const [postVideos, setPostVideos] = useState<File[]>([]);
    const [pendingConnectIds, setPendingConnectIds] = useState<string[]>([]);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const feedQuery = useQuery({
        queryKey: ["posts", "feed", user?.id || "anonymous"],
        queryFn: getFeedPosts,
        refetchOnMount: "always",
    });
    const createPostMutation = useMutation({
        mutationFn: async (content: string) => {
            let screenshotUrls: string[] = [];
            let attachmentUrls: string[] = [];

            if (postImages.length > 0) {
                const upload = await uploadPostScreenshots(postImages);
                screenshotUrls = upload.data.urls;
            }

            if (postVideos.length > 0) {
                const upload = await uploadPostFiles(postVideos);
                attachmentUrls = upload.data.urls;
            }

            return createPost({
                content,
                status: "published",
                visibility: "public",
                screenshots: screenshotUrls,
                attachments: attachmentUrls,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
            setPostContent("");
            setPostImages([]);
            setPostVideos([]);
            pushToast({
                type: "success",
                title: "Post published",
            });
        },
        onError: (error: unknown) => {
            const message =
                typeof error === "object" && error && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Could not publish post";
            pushToast({
                type: "error",
                title: message,
            });
        },
    });
    const suggestionsQuery = useQuery({
        queryKey: ["suggestions", user?.id || "anonymous"],
        queryFn: () => searchSkills({}),
        refetchOnMount: "always",
    });
    const connectMutation = useMutation({
        mutationFn: sendConnectionRequest,
        onMutate: (userId: string) => {
            setPendingConnectIds((prev) =>
                prev.includes(userId) ? prev : [...prev, userId]
            );
            return { userId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suggestions"] });
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
            pushToast({
                type: "success",
                title: "Connection request sent",
            });
        },
        onError: (error: unknown, _vars, context) => {
            if (context?.userId) {
                setPendingConnectIds((prev) =>
                    prev.filter((id) => id !== context.userId)
                );
            }
            const message =
                typeof error === "object" && error && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Could not send request";
            pushToast({
                type: "error",
                title: message,
            });
        },
    });
    const exploreSuggestions = (suggestionsQuery.data?.data || []).filter(
        (entry) => entry.user.id !== user?.id
    );
    const feedFallbackSuggestions = (feedQuery.data?.data || [])
        .map((post) => ({
            user: {
                id: post.user.id,
                name: post.user.name,
                email: post.user.email,
                profileImage: post.user.profileImage,
                professionalTitle: post.user.professionalTitle,
            },
            connectionStatus: "none" as const,
        }))
        .filter((entry) => entry.user.id !== user?.id);
    const combinedSuggestions = [...exploreSuggestions, ...feedFallbackSuggestions];
    const dedupedSuggestions = Array.from(
        new Map(combinedSuggestions.map((entry) => [String(entry.user.id), entry])).values()
    );
    const suggestions = dedupedSuggestions.slice(0, 3);

    return (
        <ProtectedRoute>
            <div className="h-screen overflow-hidden bg-[#0b1220] text-[#d3def1]">
                <div className="flex h-screen w-full">
                    <aside className="sticky top-0 hidden h-screen w-[250px] flex-col border-r border-[#1f2c44] bg-[#101a2e] p-4 lg:flex">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b80e0] text-white">
                                <Code2 size={18} />
                            </div>
                            <p className="text-3xl font-semibold text-[#e8f0ff]">DevConnect</p>
                        </div>

                        <nav className="space-y-1">
                            {leftNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium transition-colors",
                                            item.active
                                                ? "bg-[#1b2c49] text-[#6fb3ff]"
                                                : "text-[#94a7c7] hover:bg-[#17243b] hover:text-[#d8e6ff]"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto rounded-2xl bg-[#16233a] p-4">
                            <div className="flex items-center gap-3">
                                <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                                <div>
                                    <p className="text-base font-semibold text-[#e6eeff]">
                                        {user?.name || "Alex Dev"}
                                    </p>
                                    <p className="text-sm text-[#93a6c6]">
                                        @{(user?.email || "alex_fullstack").split("@")[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="no-scrollbar h-screen w-full flex-1 overflow-y-auto border-r border-[#1f2c44] p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 md:p-6">
                        <div className="mx-auto w-full max-w-[900px]">
                        <section className="rounded-3xl border border-[#23324d] bg-[#121d33] p-4 shadow-sm md:p-5">
                            <div className="flex items-start gap-3">
                                <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                                <div className="w-full space-y-4">
                                    <textarea
                                        value={postContent}
                                        onChange={(event) => setPostContent(event.target.value)}
                                        placeholder="Share an update on your latest project..."
                                        className="h-24 w-full resize-none rounded-2xl border border-[#253652] bg-[#0f1b30] px-4 py-3 text-sm text-[#d3def1] placeholder:text-[#8ea4c8] focus:border-[#2b80e0] focus:outline-none"
                                        maxLength={3000}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5 text-sm font-medium text-[#8da2c4]">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 hover:text-[#cfe0ff]"
                                                onClick={() => imageInputRef.current?.click()}
                                            >
                                                <ImageIcon size={15} className="text-[#2b80e0]" />
                                                Photo
                                            </button>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Code2 size={15} className="text-[#11a873]" />
                                                Code
                                            </span>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 hover:text-[#cfe0ff]"
                                                onClick={() => videoInputRef.current?.click()}
                                            >
                                                <Video size={15} className="text-[#9a57f5]" />
                                                Video
                                            </button>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                const trimmed = postContent.trim();
                                                if (!trimmed) return;
                                                createPostMutation.mutate(trimmed);
                                            }}
                                            disabled={createPostMutation.isPending || !postContent.trim()}
                                            className="h-10 rounded-xl bg-[#2b80e0] px-8 text-white hover:bg-[#236abd] disabled:cursor-not-allowed disabled:bg-[#1f3654]"
                                        >
                                            {createPostMutation.isPending ? "Posting..." : "Post"}
                                        </Button>
                                    </div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={(event) =>
                                            setPostImages(
                                                Array.from(event.target.files || []).slice(0, 6)
                                            )
                                        }
                                    />
                                    <input
                                        ref={videoInputRef}
                                        type="file"
                                        multiple
                                        accept="video/mp4,video/webm,video/quicktime"
                                        className="hidden"
                                        onChange={(event) =>
                                            setPostVideos(
                                                Array.from(event.target.files || []).slice(0, 3)
                                            )
                                        }
                                    />
                                    {(postImages.length > 0 || postVideos.length > 0) && (
                                        <div className="flex flex-wrap gap-2 text-xs text-[#7f96bd]">
                                            {postImages.map((file, index) => (
                                                <span
                                                    key={`${file.name}-${index}`}
                                                    className="rounded bg-[#10203f] px-2 py-1"
                                                >
                                                    {file.name}
                                                </span>
                                            ))}
                                            {postVideos.map((file, index) => (
                                                <span
                                                    key={`${file.name}-${index}`}
                                                    className="rounded bg-[#10203f] px-2 py-1"
                                                >
                                                    {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="mt-5 space-y-5">
                            {feedQuery.isLoading ? (
                                <article className="rounded-3xl border border-[#23324d] bg-[#121d33] p-4 text-sm text-[#8ea4c8] shadow-sm md:p-5">
                                    Loading feed...
                                </article>
                            ) : feedQuery.isError ? (
                                <article className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm md:p-5">
                                    Failed to load feed posts.
                                </article>
                            ) : (feedQuery.data?.data || []).length === 0 ? (
                                <article className="rounded-3xl border border-[#23324d] bg-[#121d33] p-4 text-sm text-[#8ea4c8] shadow-sm md:p-5">
                                    No published posts yet. Create the first post.
                                </article>
                            ) : (
                                (feedQuery.data?.data || []).map((post) => (
                                    <article
                                        key={post._id}
                                        className="rounded-3xl border border-[#23324d] bg-[#121d33] p-4 shadow-sm md:p-5"
                                    >
                                        <header className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Link href={`/profile/${post.user.id}`} className="shrink-0">
                                                    <Avatar
                                                        name={post.user.name || post.user.email}
                                                        src={post.user.profileImage}
                                                    />
                                                </Link>
                                                <div>
                                                    <Link
                                                        href={`/profile/${post.user.id}`}
                                                        className="text-xl font-semibold text-[#e6eeff] hover:text-[#6fb3ff]"
                                                    >
                                                        {post.user.name || "Developer"}
                                                    </Link>
                                                    <p className="text-sm text-[#90a4c6]">
                                                        {post.user.professionalTitle ||
                                                            "Full-stack developer"}{" "}
                                                        -{" "}
                                                        {new Date(post.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Ellipsis size={18} className="text-[#7f96bd]" />
                                        </header>

                                        {post.content ? (
                                            <p className="mb-4 whitespace-pre-wrap text-lg leading-8 text-[#bfcee8]">
                                                {post.content}
                                            </p>
                                        ) : null}

                                        {post.codeSnippet ? (
                                            <div className="mb-4 rounded-2xl border border-[#2a3d5f] bg-[#0b152b] p-4 text-sm text-[#a9bee0]">
                                                <p className="mb-2 text-xs uppercase tracking-wider text-[#7f97c0]">
                                                    {post.codeLanguage}
                                                </p>
                                                <pre className="whitespace-pre-wrap break-words font-mono">
                                                    {post.codeSnippet}
                                                </pre>
                                            </div>
                                        ) : null}

                                        {post.screenshots.length > 0 ? (
                                            <div className="mb-4 grid gap-2 sm:grid-cols-2">
                                                {post.screenshots.slice(0, 4).map((url) => (
                                                    <img
                                                        key={url}
                                                        src={url}
                                                        alt="Post screenshot"
                                                        className="h-40 w-full rounded-xl border border-[#2a3d5f] object-cover"
                                                    />
                                                ))}
                                            </div>
                                        ) : null}

                                        <footer className="flex items-center justify-between text-sm font-medium text-[#8da2c4]">
                                            <div className="flex items-center gap-6">
                                                <span>Attachments ({post.attachments.length})</span>
                                                <span className="capitalize">{post.status}</span>
                                            </div>
                                            {post.user.connectionStatus !== "pending" &&
                                            post.user.connectionStatus !== "connected" &&
                                            !pendingConnectIds.includes(String(post.user.id)) &&
                                            String(post.user.id) !== String(user?.id) ? (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#2a3d5f] bg-[#15253d] px-3 py-1.5 text-[#6fb3ff] disabled:cursor-not-allowed disabled:opacity-60"
                                                    disabled={connectMutation.isPending}
                                                    onClick={() => connectMutation.mutate(String(post.user.id))}
                                                >
                                                    <UserPlus size={14} />
                                                    Connect
                                                </button>
                                            ) : null}
                                        </footer>
                                    </article>
                                ))
                            )}
                        </section>
                        </div>
                    </main>

                    <aside className="sticky top-0 hidden h-screen w-[360px] overflow-hidden bg-[#0f182a] p-5 xl:block">
                        <section className="rounded-3xl border border-[#23324d] bg-[#121d33] p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-[#e6eeff]">
                                    Suggested Connections
                                </h3>
                                <Link href="/search" className="text-sm font-semibold text-[#2b80e0]">
                                    See All
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {suggestions.map((person) => (
                                    <div key={person.user.id} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/profile/${person.user.id}`}>
                                                <Avatar
                                                    name={person.user.name || person.user.email}
                                                    src={person.user.profileImage}
                                                />
                                            </Link>
                                            <div>
                                                <Link
                                                    href={`/profile/${person.user.id}`}
                                                    className="text-base font-semibold text-[#e6eeff] hover:text-[#6fb3ff]"
                                                >
                                                    {person.user.name || "Developer"}
                                                </Link>
                                                <p className="text-xs text-[#8ea4c8]">
                                                    {person.user.professionalTitle || "Full-stack developer"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-lg border border-[#2a3d5f] bg-[#15253d] p-2 text-[#6fb3ff] disabled:cursor-not-allowed disabled:opacity-60"
                                            disabled={
                                                connectMutation.isPending ||
                                                person.connectionStatus !== "none"
                                            }
                                            onClick={() => connectMutation.mutate(String(person.user.id))}
                                        >
                                            {person.connectionStatus === "none" ? (
                                                <UserPlus size={14} />
                                            ) : (
                                                <span className="px-1 text-xs font-semibold">
                                                    {person.connectionStatus === "pending"
                                                        ? "Requested"
                                                        : "Connected"}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                ))}
                                {suggestionsQuery.isLoading && suggestions.length === 0 ? (
                                    <p className="text-sm text-[#8ea4c8]">Loading suggestions...</p>
                                ) : null}
                                {suggestionsQuery.isError && suggestions.length === 0 ? (
                                    <p className="text-sm text-[#8ea4c8]">
                                        Couldn&apos;t load explore users, showing feed suggestions when available.
                                    </p>
                                ) : null}
                                {suggestions.length === 0 ? (
                                    <p className="text-sm text-[#8ea4c8]">No suggestions right now.</p>
                                ) : null}
                            </div>
                        </section>

                        <section className="mt-4 rounded-3xl border border-[#23324d] bg-[#121d33] p-5">
                            <h3 className="mb-4 text-2xl font-semibold text-[#e6eeff]">Trending Skills</h3>
                            <div className="space-y-3">
                                {trending.map((item) => (
                                    <div key={item.name}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium text-[#c1d0e8]">{item.name}</span>
                                            <span className="text-[#8ea4c8]">{item.count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-[#21324d]">
                                            <div
                                                className={cn("h-1.5 rounded-full", item.width, item.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mt-4 rounded-3xl bg-gradient-to-br from-[#2e82e4] to-[#2b6bd6] p-6 text-white shadow-[0_10px_20px_rgba(45,128,224,0.25)]">
                            <p className="text-xl font-semibold">Your Week</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-blue-100">Profile Views</p>
                                    <p className="text-4xl font-bold">248</p>
                                </div>
                                <div>
                                    <p className="text-blue-100">Post Reach</p>
                                    <p className="text-4xl font-bold">1.2k</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-5 h-11 w-full rounded-xl bg-white/20 text-sm font-semibold"
                            >
                                View Analytics
                            </button>
                        </section>

                        <footer className="mt-6 text-center text-xs text-[#8ea4c8]">
                            <p>About Privacy Terms Help</p>
                            <p className="mt-2">© 2024 DevConnect Inc.</p>
                        </footer>
                    </aside>
                </div>
            </div>
        </ProtectedRoute>
    );
}
