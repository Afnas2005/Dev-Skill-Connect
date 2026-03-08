"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Github, Linkedin, MapPin, Twitter, UploadCloud, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { AuthUser, ProfilePayload } from "@/types/domain";

type ProfileFormProps = {
    initial: AuthUser;
    loading?: boolean;
    onSubmit: (
        payload: ProfilePayload,
        imageFile: File | null,
        removeImage: boolean,
        backgroundFile: File | null,
        removeBackgroundImage: boolean
    ) => void;
    onCancel?: () => void;
};

export function ProfileForm({ initial, loading, onSubmit, onCancel }: ProfileFormProps) {
    const [name, setName] = useState(initial.name || "");
    const [bio, setBio] = useState(initial.bio || "");
    const [location, setLocation] = useState(initial.location || "");
    const [title, setTitle] = useState(initial.professionalTitle || "");
    const [github, setGithub] = useState(initial.socialLinks?.github || "");
    const [linkedin, setLinkedin] = useState(initial.socialLinks?.linkedin || "");
    const [twitter, setTwitter] = useState(initial.socialLinks?.twitter || "");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(initial.profileImage || "");
    const [removeImage, setRemoveImage] = useState(false);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState(initial.backgroundImage || "");
    const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const backgroundFileInputRef = useRef<HTMLInputElement | null>(null);

    const inputClass =
        "h-12 rounded-xl border border-[#1a365f] bg-[#08162f] text-sm text-[#dce8fa] placeholder:text-[#5d789f] focus-visible:ring-[#2b6ef5]";
    const textareaClass =
        "w-full rounded-xl border border-[#1a365f] bg-[#08162f] px-3 py-3 text-sm text-[#dce8fa] placeholder:text-[#5d789f] focus:outline-none focus:ring-2 focus:ring-[#2b6ef5]";

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0] || null;
        setFile(nextFile);
        if (nextFile) {
            setPreviewUrl(URL.createObjectURL(nextFile));
            setRemoveImage(false);
        }
    };

    const handleBackgroundImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0] || null;
        setBackgroundFile(nextFile);
        if (nextFile) {
            setBackgroundPreviewUrl(URL.createObjectURL(nextFile));
            setRemoveBackgroundImage(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        onSubmit(
            {
                name: name.trim(),
                bio: bio.trim(),
                professionalTitle: title.trim(),
                location: location.trim(),
                socialLinks: {
                    github: github.trim(),
                    linkedin: linkedin.trim(),
                    twitter: twitter.trim(),
                },
            },
            file,
            removeImage,
            backgroundFile,
            removeBackgroundImage
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-4xl font-semibold text-white">Edit Profile Settings</h1>
                <p className="text-[#7f98be]">
                    Update your professional information and how you appear to the community.
                </p>
            </section>

            <section>
                <h2 className="mb-3 text-2xl font-semibold text-[#dbeafe]">Profile Picture</h2>
                <div className="rounded-2xl border border-[#1a365f] bg-[#08162f]/80 p-5">
                    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                        <div className="flex flex-col items-center justify-center">
                            <Avatar
                                name={name || initial.email}
                                src={removeImage ? undefined : previewUrl || initial.profileImage}
                                className="h-24 w-24 border-4 border-[#0b1530] ring-2 ring-[#2b6ef5]"
                            />
                            <button
                                type="button"
                                className="mt-3 text-sm text-red-400 hover:text-red-300"
                                onClick={() => {
                                    setFile(null);
                                    setPreviewUrl("");
                                    setRemoveImage(true);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                            >
                                Remove Image
                            </button>
                        </div>
                        <div className="rounded-2xl border border-dashed border-[#2b4972] bg-[#061227] p-6 text-center">
                            <UploadCloud size={28} className="mx-auto text-[#8fb0de]" />
                            <p className="mt-3 text-lg font-semibold text-white">Upload a new photo</p>
                            <p className="mt-1 text-sm text-[#7f98be]">
                                Drag and drop your image here, or click to browse. PNG, JPG up to
                                10MB.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4 rounded-lg border-[#1f3b62] bg-[#12233f] text-[#dbeafe] hover:bg-[#183158]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select File
                            </Button>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-2xl font-semibold text-[#dbeafe]">Profile Background</h2>
                <div className="rounded-2xl border border-[#1a365f] bg-[#08162f]/80 p-5">
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-xl border border-[#1a365f] bg-[#061227]">
                            <div
                                className="h-44 w-full bg-[radial-gradient(circle_at_center,#13364f_0%,#08172a_48%,#020617_100%)] bg-cover bg-center"
                                style={
                                    removeBackgroundImage
                                        ? undefined
                                        : backgroundPreviewUrl || initial.backgroundImage
                                          ? {
                                                backgroundImage: `url(${backgroundPreviewUrl || initial.backgroundImage})`,
                                            }
                                          : undefined
                                }
                            />
                        </div>
                        <div className="rounded-2xl border border-dashed border-[#2b4972] bg-[#061227] p-6 text-center">
                            <UploadCloud size={28} className="mx-auto text-[#8fb0de]" />
                            <p className="mt-3 text-lg font-semibold text-white">
                                Upload a background image
                            </p>
                            <p className="mt-1 text-sm text-[#7f98be]">
                                Recommended ratio 3:1. PNG, JPG up to 10MB.
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg border-[#1f3b62] bg-[#12233f] text-[#dbeafe] hover:bg-[#183158]"
                                    onClick={() => backgroundFileInputRef.current?.click()}
                                >
                                    Select Background
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-[#122744] hover:text-red-300"
                                    onClick={() => {
                                        setBackgroundFile(null);
                                        setBackgroundPreviewUrl("");
                                        setRemoveBackgroundImage(true);
                                        if (backgroundFileInputRef.current) {
                                            backgroundFileInputRef.current.value = "";
                                        }
                                    }}
                                >
                                    Remove Background
                                </Button>
                            </div>
                            <Input
                                ref={backgroundFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBackgroundImageChange}
                                disabled={loading}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-2xl font-semibold text-[#dbeafe]">Professional Information</h2>
                <div className="space-y-4 rounded-2xl border border-[#1a365f] bg-[#08162f]/80 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm text-[#9ab1d3]">Full Name</label>
                            <Input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                disabled={loading}
                                className={inputClass}
                                placeholder="e.g. Alex Rivera"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-[#9ab1d3]">Professional Title</label>
                            <Input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                disabled={loading}
                                className={inputClass}
                                placeholder="e.g. Senior Full-Stack Developer"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-[#9ab1d3]">Bio</label>
                        <textarea
                            rows={4}
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            className={textareaClass}
                            disabled={loading}
                            placeholder="Tell the community about yourself, your tech stack, and what you're building..."
                        />
                    </div>
                    <div className="space-y-2 md:max-w-md">
                        <label className="text-sm text-[#9ab1d3]">Location</label>
                        <div className="relative">
                            <MapPin
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5d789f]"
                            />
                            <Input
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                disabled={loading}
                                className={`${inputClass} pl-9`}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-2xl font-semibold text-[#dbeafe]">Social Profiles</h2>
                <div className="space-y-3 rounded-2xl border border-[#1a365f] bg-[#08162f]/80 p-5">
                    <div className="relative">
                        <Github
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa6c7]"
                        />
                        <Input
                            value={github}
                            onChange={(event) => setGithub(event.target.value)}
                            disabled={loading}
                            className={`${inputClass} pl-9`}
                            placeholder="github.com/username"
                        />
                    </div>
                    <div className="relative">
                        <Linkedin
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa6c7]"
                        />
                        <Input
                            value={linkedin}
                            onChange={(event) => setLinkedin(event.target.value)}
                            disabled={loading}
                            className={`${inputClass} pl-9`}
                            placeholder="linkedin.com/in/username"
                        />
                    </div>
                    <div className="relative">
                        <Twitter
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa6c7]"
                        />
                        <Input
                            value={twitter}
                            onChange={(event) => setTwitter(event.target.value)}
                            disabled={loading}
                            className={`${inputClass} pl-9`}
                            placeholder="twitter.com/username"
                        />
                    </div>
                </div>
            </section>

            <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#1a365f] bg-[#0a1428]/95 py-4 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-sm text-[#6e86aa]">
                    <UserCircle2 size={14} />
                    <span>Your changes will be public immediately.</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-[#a7bddd] hover:bg-[#122744] hover:text-white"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-xl bg-[#2563eb] px-6 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </footer>
        </form>
    );
}
