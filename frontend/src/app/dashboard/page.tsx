"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Code2,
    Ellipsis,
    Image as ImageIcon,
    UserPlus,
    Video,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { createPost, getFeedPosts } from "@/services/postServices";
import { uploadPostFiles, uploadPostScreenshots } from "@/services/uploadServices";
import { searchSkills, sendConnectionRequest } from "@/services/searchServices";

const trending = [
    { name: "TypeScript", count: "1.2k posts", width: "w-[90%]", color: "bg-[var(--app-primary)]" },
    { name: "Next.js 14", count: "850 posts", width: "w-[76%]", color: "bg-[var(--app-success)]" },
    { name: "Rust", count: "640 posts", width: "w-[62%]", color: "bg-[var(--app-warning)]" },
    { name: "Kubernetes", count: "420 posts", width: "w-[46%]", color: "bg-[var(--app-secondary)]" },
];

const staggerList = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeItem = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();
    
    // State
    const [postContent, setPostContent] = useState("");
    const [postImages, setPostImages] = useState<File[]>([]);
    const [postVideos, setPostVideos] = useState<File[]>([]);
    const [pendingConnectIds, setPendingConnectIds] = useState<string[]>([]);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    
    // Queries
    const feedQuery = useQuery({
        queryKey: ["posts", "feed", user?.id || "anonymous"],
        queryFn: getFeedPosts,
        refetchOnMount: "always",
    });
    
    const suggestionsQuery = useQuery({
        queryKey: ["suggestions", user?.id || "anonymous"],
        queryFn: () => searchSkills({}),
        refetchOnMount: "always",
    });

    // Mutations
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
            pushToast({ type: "success", title: "Post published into the network" });
        },
        onError: (error: unknown) => {
            const message = typeof error === "object" && error && "message" in error
                ? String((error as { message?: string }).message)
                : "Could not publish post";
            pushToast({ type: "error", title: message });
        },
    });

    const connectMutation = useMutation({
        mutationFn: sendConnectionRequest,
        onMutate: (userId: string) => {
            setPendingConnectIds((prev) => prev.includes(userId) ? prev : [...prev, userId]);
            return { userId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suggestions"] });
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
            pushToast({ type: "success", title: "Connection request sent" });
        },
        onError: (error: unknown, _vars, context) => {
            if (context?.userId) {
                setPendingConnectIds((prev) => prev.filter((id) => id !== context.userId));
            }
            const message = typeof error === "object" && error && "message" in error
                ? String((error as { message?: string }).message)
                : "Could not send request";
            pushToast({ type: "error", title: message });
        },
    });

    // Suggestion logic
    const exploreSuggestions = (suggestionsQuery.data?.data || []).filter((entry) => entry.user.id !== user?.id);
    const feedFallbackSuggestions = (feedQuery.data?.data || [])
        .map((post) => ({
            user: { ...post.user },
            connectionStatus: "none" as const,
        }))
        .filter((entry) => entry.user.id !== user?.id);
    const dedupedSuggestions = Array.from(new Map([...exploreSuggestions, ...feedFallbackSuggestions].map((entry) => [String(entry.user.id), entry])).values());
    const suggestions = dedupedSuggestions.slice(0, 3);

    return (
        <DashboardLayout>
            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 mx-auto w-full max-w-7xl">
                
                {/* Main Feed Column */}
                <div className="flex-1 w-full max-w-3xl min-w-0">
                    <motion.section
                        className="app-card p-5 lg:p-6 mb-6"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="flex items-start gap-4">
                            <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                            <div className="w-full space-y-4">
                                <textarea
                                    value={postContent}
                                    onChange={(event) => setPostContent(event.target.value)}
                                    placeholder="Share your latest system architecture or project update..."
                                    className="h-28 w-full resize-none rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] px-4 py-3 text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_var(--app-primary-soft)] focus:outline-none transition-all"
                                    maxLength={3000}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <button type="button" className="flex items-center gap-2 text-[var(--app-text-soft)] hover:text-[var(--app-primary)] transition-colors" onClick={() => imageInputRef.current?.click()}>
                                            <div className="p-2 app-glass rounded-lg text-[var(--app-primary)]"><ImageIcon size={16} /></div>
                                            <span className="hidden sm:inline">Image</span>
                                        </button>
                                        <button type="button" className="flex items-center gap-2 text-[var(--app-text-soft)] hover:text-[var(--app-success)] transition-colors">
                                            <div className="p-2 app-glass rounded-lg text-[var(--app-success)]"><Code2 size={16} /></div>
                                            <span className="hidden sm:inline">Code</span>
                                        </button>
                                        <button type="button" className="flex items-center gap-2 text-[var(--app-text-soft)] hover:text-[var(--app-secondary)] transition-colors" onClick={() => videoInputRef.current?.click()}>
                                            <div className="p-2 app-glass rounded-lg text-[var(--app-secondary)]"><Video size={16} /></div>
                                            <span className="hidden sm:inline">Video</span>
                                        </button>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const trimmed = postContent.trim();
                                            if (!trimmed) return;
                                            createPostMutation.mutate(trimmed);
                                        }}
                                        disabled={createPostMutation.isPending || !postContent.trim()}
                                        className="h-10 px-8 text-sm"
                                    >
                                        {createPostMutation.isPending ? "Syncing..." : "Transmit"}
                                    </Button>
                                </div>
                                <input ref={imageInputRef} type="file" multiple accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => setPostImages(Array.from(e.target.files || []).slice(0, 6))} />
                                <input ref={videoInputRef} type="file" multiple accept="video/mp4,video/webm" className="hidden" onChange={(e) => setPostVideos(Array.from(e.target.files || []).slice(0, 3))} />
                                
                                {(postImages.length > 0 || postVideos.length > 0) && (
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {postImages.map((f, i) => <span key={i} className="rounded-md app-glass px-2 py-1 border border-[var(--app-line)]">{f.name}</span>)}
                                        {postVideos.map((f, i) => <span key={i} className="rounded-md app-glass px-2 py-1 border border-[var(--app-line)]">{f.name}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    <section className="space-y-4">
                        {feedQuery.isLoading ? (
                            <div className="app-card p-6 text-center text-[var(--app-muted)] animate-pulse">Syncing feed data...</div>
                        ) : feedQuery.isError ? (
                            <div className="app-card border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">Failed to establish connection to the feed.</div>
                        ) : (feedQuery.data?.data || []).length === 0 ? (
                            <div className="app-card p-8 text-center text-[var(--app-muted)] border-dashed border-2">Network is silent. Transmit the first signal.</div>
                        ) : (
                            <motion.div variants={staggerList} initial="hidden" animate="show" className="space-y-6">
                            {(feedQuery.data?.data || []).map((post) => (
                                <motion.article
                                    key={post._id}
                                    variants={fadeItem}
                                    className="app-card p-5 lg:p-6 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--app-primary)]/5 rounded-bl-[100px] pointer-events-none group-hover:bg-[var(--app-primary)]/10 transition-colors" />
                                    <header className="mb-4 flex items-start justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/profile/${post.user.id}`}>
                                                <Avatar name={post.user.name || post.user.email} src={post.user.profileImage} />
                                            </Link>
                                            <div>
                                                <Link href={`/profile/${post.user.id}`} className="text-lg font-bold text-[var(--app-text)] hover:text-gradient-primary">
                                                    {post.user.name || "Developer"}
                                                </Link>
                                                <p className="text-xs font-medium text-[var(--app-muted)]">
                                                    {post.user.professionalTitle || "Full-stack Engineer"} • {new Date(post.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-[var(--app-muted)] hover:text-[var(--app-text)] p-2 rounded-lg hover:bg-[var(--app-surface-soft)]">
                                            <Ellipsis size={18} />
                                        </button>
                                    </header>

                                    {post.content && (
                                        <p className="mb-5 whitespace-pre-wrap text-[0.95rem] leading-7 text-[var(--app-text-soft)] relative z-10">
                                            {post.content}
                                        </p>
                                    )}

                                    {post.codeSnippet && (
                                        <div className="mb-5 rounded-[16px] border border-[var(--app-line)] bg-black/40 p-4 text-sm relative z-10 backdrop-blur-md">
                                            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                                                {post.codeLanguage}
                                            </p>
                                            <pre className="whitespace-pre-wrap break-words font-mono text-[var(--app-text-soft)]">
                                                {post.codeSnippet}
                                            </pre>
                                        </div>
                                    )}

                                    {post.screenshots.length > 0 && (
                                        <div className="mb-5 grid gap-2 relative z-10">
                                            {post.screenshots.slice(0, 4).map((url) => (
                                                <img key={url} src={url} alt="Screenshot attachment" className="rounded-[16px] border border-[var(--app-line)] object-cover w-full max-h-[400px]" />
                                            ))}
                                        </div>
                                    )}

                                    <footer className="flex items-center justify-between pt-2 border-t border-[var(--app-line)] relative z-10">
                                        <div className="flex items-center gap-4 text-xs font-bold text-[var(--app-muted)] tracking-wider">
                                            <span>{post.attachments.length} ATTACHMENTS</span>
                                            <span className="uppercase text-[var(--app-primary)]">{post.status}</span>
                                        </div>
                                        {post.user.connectionStatus !== "pending" && post.user.connectionStatus !== "connected" && !pendingConnectIds.includes(String(post.user.id)) && String(post.user.id) !== String(user?.id) && (
                                            <Button
                                                variant="outline" size="sm"
                                                disabled={connectMutation.isPending}
                                                onClick={() => connectMutation.mutate(String(post.user.id))}
                                                className="border-[var(--app-primary-glow)] text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] gap-2 h-8"
                                            >
                                                <UserPlus size={14} /> Connect
                                            </Button>
                                        )}
                                    </footer>
                                </motion.article>
                            ))}
                            </motion.div>
                        )}
                    </section>
                </div>

                {/* Right Sidebar Column */}
                <aside className="w-full xl:w-[380px] space-y-6">
                    <section className="app-card p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-[var(--app-text)]">Network Suggestions</h3>
                            <Link href="/search" className="text-xs font-bold text-[var(--app-primary)] hover:underline tracking-wider uppercase">See All</Link>
                        </div>
                        <motion.div className="space-y-4" variants={staggerList} initial="hidden" animate="show">
                            {suggestions.map((person) => (
                                <motion.div key={person.user.id} variants={fadeItem} className="flex items-center justify-between gap-3 p-3 rounded-[16px] hover:bg-[var(--app-surface-soft)] border border-transparent hover:border-[var(--app-line)] transition-all">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={person.user.name || person.user.email} src={person.user.profileImage} />
                                        <div>
                                            <Link href={`/profile/${person.user.id}`} className="text-sm font-bold text-[var(--app-text)] hover:text-[var(--app-primary)]">
                                                {person.user.name || "Engineer"}
                                            </Link>
                                            <p className="text-[11px] text-[var(--app-muted)] truncate max-w-[120px]">
                                                {person.user.professionalTitle || "Full-stack developer"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant={person.connectionStatus === "none" ? "outline" : "ghost"}
                                        size="sm"
                                        disabled={connectMutation.isPending || person.connectionStatus !== "none"}
                                        onClick={() => connectMutation.mutate(String(person.user.id))}
                                        className="h-8 w-8 p-0 rounded-full shrink-0 border-[var(--app-line)] text-[var(--app-primary)]"
                                    >
                                        {person.connectionStatus === "none" ? <UserPlus size={14} /> : <span className="text-[10px]">✓</span>}
                                    </Button>
                                </motion.div>
                            ))}
                            {suggestionsQuery.isLoading && <div className="text-center py-4 text-sm text-[var(--app-muted)] animate-pulse">Scanning network...</div>}
                            {suggestions.length === 0 && !suggestionsQuery.isLoading && <div className="text-center py-4 text-sm text-[var(--app-muted)]">No connections found.</div>}
                        </motion.div>
                    </section>

                    <section className="app-card p-6">
                        <h3 className="mb-5 text-lg font-extrabold text-[var(--app-text)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--app-success)] shadow-glow animate-pulse"></span>
                            Trending Tech Stack
                        </h3>
                        <motion.div className="space-y-4" variants={staggerList} initial="hidden" animate="show">
                            {trending.map((item) => (
                                <motion.div key={item.name} variants={fadeItem}>
                                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                                        <span className="text-[var(--app-text)]">{item.name}</span>
                                        <span className="text-[var(--app-muted)]">{item.count}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--app-surface-soft)] overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full", item.width, item.color)}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                            style={{ originX: 0 }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    <section className="rounded-[24px] border border-[var(--app-primary-glow)] bg-gradient-to-br from-[var(--app-primary-strong)] to-[#1e3a8a] p-6 text-white shadow-glow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px]" />
                        <p className="text-lg font-bold drop-shadow-md">Telemetry</p>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="app-glass-strong p-3 rounded-xl border border-white/20">
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Views</p>
                                <p className="text-3xl font-extrabold mt-1">248</p>
                            </div>
                            <div className="app-glass-strong p-3 rounded-xl border border-white/20">
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Reach</p>
                                <p className="text-3xl font-extrabold mt-1">1.2k</p>
                            </div>
                        </div>
                    </section>

                    <footer className="text-center text-xs text-[var(--app-muted)] font-medium pt-4">
                        <div className="flex justify-center gap-4 mb-2">
                            <span className="hover:text-[var(--app-primary)] cursor-pointer">About</span>
                            <span className="hover:text-[var(--app-primary)] cursor-pointer">Privacy</span>
                            <span className="hover:text-[var(--app-primary)] cursor-pointer">Terms</span>
                        </div>
                        <p>© 2024 DevSkill Connect System</p>
                    </footer>
                </aside>
            </div>
        </DashboardLayout>
    );
}
