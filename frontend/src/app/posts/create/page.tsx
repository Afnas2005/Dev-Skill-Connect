"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Calendar,
    ChevronLeft,
    Globe,
    Image as ImageIcon,
    Link2,
    List,
    Paperclip,
    Plus,
    Type,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { createPost } from "@/services/postServices";
import { uploadPostFiles, uploadPostScreenshots } from "@/services/uploadServices";
import { useToastStore } from "@/store/toastStore";
import type { PostCodeLanguage, PostStatus } from "@/types/domain";

const languages: Array<{ label: string; value: PostCodeLanguage }> = [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "Go", value: "go" },
    { label: "Rust", value: "rust" },
    { label: "C++", value: "cpp" },
    { label: "Other", value: "other" },
];

export default function CreatePostPage() {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [codeLanguage, setCodeLanguage] = useState<PostCodeLanguage>("typescript");
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [scheduleAt, setScheduleAt] = useState("");
    const pushToast = useToastStore((state) => state.pushToast);
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (status: PostStatus) => {
            let screenshotUrls: string[] = [];
            let fileUrls: string[] = [];

            if (screenshots.length > 0) {
                const upload = await uploadPostScreenshots(screenshots);
                screenshotUrls = upload.data.urls;
            }
            if (files.length > 0) {
                const upload = await uploadPostFiles(files);
                fileUrls = upload.data.urls;
            }

            return createPost({
                content: content.trim(),
                codeSnippet: codeSnippet.trim(),
                codeLanguage,
                screenshots: screenshotUrls,
                attachments: fileUrls,
                visibility: "public",
                status,
                scheduledAt: scheduleAt ? new Date(scheduleAt).toISOString() : null,
            });
        },
        onSuccess: (_data, status) => {
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
            queryClient.invalidateQueries({ queryKey: ["posts", "me"] });
            pushToast({
                type: "success",
                title: status === "draft" ? "Draft saved" : "Post published",
            });
            router.push("/dashboard");
        },
        onError: (error: unknown) => {
            const message =
                typeof error === "object" && error && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Please try again.";
            pushToast({
                type: "error",
                title: "Failed to create post",
                description: message,
            });
        },
    });

    const submit = (status: PostStatus) => {
        if (!content.trim() && !codeSnippet.trim()) {
            pushToast({
                type: "error",
                title: "Add content first",
                description: "Write something or add a code snippet.",
            });
            return;
        }
        mutation.mutate(status);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#070b1f] px-4 py-8 text-[#e2e8f0] md:px-8">
                <div className="mx-auto max-w-3xl space-y-5">
                    <div className="mb-4 -ml-4 sm:-ml-30">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#223e65] bg-[#0b1a31] px-3 py-2 text-sm text-[#cfe0ff] hover:bg-[#122544]"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>
                    </div>
                    <section className="rounded-2xl border border-[#172f56] bg-[#0b1230] px-6 py-5 shadow-[0_12px_30px_rgba(5,10,25,0.35)]">
                        <h1 className="text-4xl font-semibold text-white">Create Post</h1>
                        <p className="mt-2 text-base text-[#8aa0c2]">
                            Share your latest technical breakthrough or project update with the
                            community.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#172f56] bg-[#0b1230]">
                        <div className="flex items-center gap-5 border-b border-[#172f56] px-5 py-3 text-[#7f98be]">
                            <Type size={16} />
                            <List size={16} />
                            <Link2 size={16} />
                        </div>
                        <textarea
                            rows={6}
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="What have you been working on lately?"
                            className="w-full resize-none bg-transparent px-5 py-4 text-xl text-[#dce8fa] placeholder:text-[#607da7] focus:outline-none"
                        />
                    </section>

                    <section className="rounded-2xl border border-[#172f56] bg-[#0b1230]">
                        <div className="flex items-center justify-between border-b border-[#172f56] px-5 py-3">
                            <p className="text-lg font-semibold text-white">CODE SNIPPET</p>
                            <select
                                value={codeLanguage}
                                onChange={(event) => setCodeLanguage(event.target.value as PostCodeLanguage)}
                                className="h-9 rounded-lg border border-[#28456d] bg-[#0f1b39] px-3 text-sm text-[#dce8fa]"
                            >
                                {languages.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            rows={5}
                            value={codeSnippet}
                            onChange={(event) => setCodeSnippet(event.target.value)}
                            placeholder="// Paste your code here..."
                            className="w-full resize-none bg-[#081327] px-5 py-4 font-mono text-sm text-[#dce8fa] placeholder:text-[#607da7] focus:outline-none"
                        />
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#2c4b74] bg-[#0b1230] text-center">
                            <ImageIcon size={24} className="text-[#61a9ff]" />
                            <p className="mt-2 text-xl font-semibold text-white">Add Screenshots</p>
                            <p className="text-sm text-[#7f98be]">PNG, JPG up to 10MB</p>
                            <input
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                                onChange={(event) =>
                                    setScreenshots(Array.from(event.target.files || []).slice(0, 6))
                                }
                            />
                        </label>

                        <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#2c4b74] bg-[#0b1230] text-center">
                            <Paperclip size={24} className="text-[#61a9ff]" />
                            <p className="mt-2 text-xl font-semibold text-white">Attach Files</p>
                            <p className="text-sm text-[#7f98be]">Zip, PDF, JSON up to 50MB</p>
                            <input
                                type="file"
                                multiple
                                accept=".zip,.pdf,.json,.txt"
                                className="hidden"
                                onChange={(event) =>
                                    setFiles(Array.from(event.target.files || []).slice(0, 5))
                                }
                            />
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-[#8aa0c2]">
                        {screenshots.map((file, index) => (
                            <span key={`${file.name}-${index}`} className="rounded bg-[#10203f] px-2 py-1">
                                {file.name}
                            </span>
                        ))}
                        {files.map((file, index) => (
                            <span key={`${file.name}-${index}`} className="rounded bg-[#10203f] px-2 py-1">
                                {file.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-4 text-[#8aa0c2]">
                            <span className="inline-flex items-center gap-1">
                                <Globe size={14} />
                                Public
                            </span>
                            <label className="inline-flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Schedule</span>
                                <input
                                    type="datetime-local"
                                    value={scheduleAt}
                                    onChange={(event) => setScheduleAt(event.target.value)}
                                    className="h-9 rounded border border-[#2c4b74] bg-[#0b1230] px-2 text-xs text-[#dce8fa]"
                                />
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="h-11 rounded-xl border-[#2c4b74] bg-[#0b1230] text-white hover:bg-[#112042]"
                                disabled={mutation.isPending}
                                onClick={() => submit("draft")}
                            >
                                Save Draft
                            </Button>
                            <Button
                                className="h-11 rounded-xl bg-[#2f6df6] px-6 text-white hover:bg-[#265bd1]"
                                disabled={mutation.isPending}
                                onClick={() => submit("published")}
                            >
                                <Plus size={15} className="mr-2" />
                                {mutation.isPending ? "Posting..." : "Post Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
