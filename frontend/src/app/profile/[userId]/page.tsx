"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    BriefcaseBusiness,
    CheckCircle2,
    ExternalLink,
    Github,
    Linkedin,
    MapPin,
    MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPublicProfile } from "@/services/profileServices";
import { cn } from "@/lib/utils";

export default function PublicProfilePage() {
    const params = useParams<{ userId: string }>();
    const userId = params.userId;

    const profileQuery = useQuery({
        queryKey: ["profile", "public", userId],
        queryFn: () => getPublicProfile(userId),
        enabled: Boolean(userId),
    });

    const profile = profileQuery.data?.data?.profile;
    const skills = profileQuery.data?.data?.skills || [];

    const expertSkills = skills.filter((skill) => skill.level === "advanced").slice(0, 6);
    const advancedSkills = skills.filter((skill) => skill.level === "intermediate").slice(0, 6);
    const intermediateSkills = skills.filter((skill) => skill.level === "beginner").slice(0, 6);

    return (
        <div className="min-h-screen bg-[#07101f] px-4 py-6 text-[#dce8fa] md:px-8">
            <div className="mx-auto max-w-[1180px] rounded-2xl border border-[#123357] bg-[linear-gradient(180deg,#0a172b,#081325)] p-6 md:p-8">
                {profileQuery.isLoading ? (
                    <div className="py-12 text-[#8aa0c2]">Loading profile...</div>
                ) : profileQuery.isError || !profile ? (
                    <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                        Unable to load this profile.
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <section>
                            <div className="mb-8 rounded-2xl border border-[#123357] bg-[#091a31] p-3 pb-8">
                                <div
                                    className="h-56 w-full rounded-xl bg-[linear-gradient(145deg,#284563,#20324f)] bg-cover bg-center"
                                    style={
                                        profile.backgroundImage
                                            ? { backgroundImage: `url(${profile.backgroundImage})` }
                                            : undefined
                                    }
                                />
                                <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar
                                            name={profile.name || "Developer"}
                                            src={profile.profileImage}
                                            className="h-24 w-24 rounded-xl border border-[#2b4972]"
                                        />
                                        <div>
                                            <h1 className="text-4xl font-semibold text-white">
                                                {profile.name || "Unnamed Developer"}
                                            </h1>
                                            <p className="mt-1 text-xl text-[#2f9dff]">
                                                {profile.professionalTitle || "Senior Full-Stack Engineer"}
                                            </p>
                                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#8ca4c6]">
                                                <MapPin size={14} />
                                                {profile.location || "Location not added"}
                                            </p>
                                            <div className="mt-2 flex gap-2 text-[#6f88ad]">
                                                {profile.socialLinks?.github ? (
                                                    <a href={profile.socialLinks.github} target="_blank" rel="noreferrer">
                                                        <Github size={15} />
                                                    </a>
                                                ) : null}
                                                {profile.socialLinks?.linkedin ? (
                                                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer">
                                                        <Linkedin size={15} />
                                                    </a>
                                                ) : null}
                                                {profile.socialLinks?.twitter ? (
                                                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer">
                                                        <ExternalLink size={15} />
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-lg border-[#36557d] bg-[#152843] text-[#dce8fa] hover:bg-[#1d3456]"
                                        >
                                            <BriefcaseBusiness size={14} className="mr-2" />
                                            Connect
                                        </Button>
                                        <Button className="h-10 rounded-lg bg-[#2186eb] text-white hover:bg-[#1a70c3]">
                                            <MessageSquare size={14} className="mr-2" />
                                            Send Message
                                        </Button>
                                    </div>
                                </header>
                            </div>

                            <section className="mb-8">
                                <h2 className="mb-3 border-l-2 border-[#1f86ff] pl-3 text-3xl font-semibold text-white">
                                    About Me
                                </h2>
                                <p className="text-[#9eb2cf]">
                                    {profile.bio ||
                                        "Passionate full-stack developer with 8+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture."}
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 border-l-2 border-[#1f86ff] pl-3 text-3xl font-semibold text-white">
                                    Technical Skills
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#32d296]">
                                            Expert
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {(expertSkills.length ? expertSkills : skills.slice(0, 5)).map(
                                                (skill) => (
                                                    <span
                                                        key={skill._id}
                                                        className="rounded-md bg-[#0e2f2c] px-3 py-1 text-sm text-[#4fe0ae]"
                                                    >
                                                        {skill.skillName}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#2f9dff]">
                                            Advanced
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {advancedSkills.map((skill) => (
                                                <span
                                                    key={skill._id}
                                                    className="rounded-md bg-[#102941] px-3 py-1 text-sm text-[#69b7ff]"
                                                >
                                                    {skill.skillName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f4c84a]">
                                            Intermediate
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {intermediateSkills.map((skill) => (
                                                <span
                                                    key={skill._id}
                                                    className="rounded-md bg-[#3a3318] px-3 py-1 text-sm text-[#f4c84a]"
                                                >
                                                    {skill.skillName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="border-l-2 border-[#1f86ff] pl-3 text-3xl font-semibold text-white">
                                        Work Samples
                                    </h2>
                                    <button className="text-sm text-[#2f9dff]">View GitHub</button>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        "Nexus Analytics Dashboard",
                                        "Streamline API Engine",
                                    ].map((project, index) => (
                                        <article
                                            key={project}
                                            className="rounded-xl border border-[#1d3a63] bg-[#0b1a31] p-3"
                                        >
                                            <div
                                                className={cn(
                                                    "mb-3 h-40 rounded-lg",
                                                    index === 0
                                                        ? "bg-[linear-gradient(145deg,#284563,#20324f)]"
                                                        : "bg-[linear-gradient(145deg,#19304d,#1f405e)]"
                                                )}
                                            />
                                            <h3 className="text-xl font-semibold text-white">{project}</h3>
                                            <p className="mt-1 text-sm text-[#8ea5c8]">
                                                A high-performance project showcasing full-stack engineering.
                                            </p>
                                            <a className="mt-2 inline-flex items-center gap-1 text-sm text-[#2f9dff]">
                                                Case Study <ExternalLink size={12} />
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </section>

                        <aside className="space-y-4">
                            <section className="rounded-xl border border-[#1d3a63] bg-[#0b1a31] p-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">Stats & Impact</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8ea5c8]">Total Commits</span>
                                        <span className="font-semibold text-white">4,281</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8ea5c8]">Projects Shipped</span>
                                        <span className="font-semibold text-white">24</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8ea5c8]">OSS Contributions</span>
                                        <span className="font-semibold text-white">115</span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#1d3a63] bg-[#0b1a31] p-4">
                                <h3 className="mb-2 text-lg font-semibold text-white">Availability</h3>
                                <p className="inline-flex items-center gap-1 text-sm text-[#8ea5c8]">
                                    <CheckCircle2 size={14} className="text-[#34d399]" />
                                    Open to full-time roles & consulting
                                </p>
                                <Button className="mt-3 h-10 w-full rounded-lg bg-[#243c62] text-white hover:bg-[#2e4f80]">
                                    Download Resume
                                </Button>
                            </section>

                            <section className="rounded-xl border border-[#1d3a63] bg-[#0b1a31] p-4">
                                <h3 className="mb-2 text-lg font-semibold text-[#2f9dff]">Education</h3>
                                <p className="text-sm text-white">B.S. Computer Science</p>
                                <p className="text-xs text-[#8ea5c8]">Stanford University · 2012-2016</p>
                                <p className="mt-3 text-sm text-white">Full-Stack Certification</p>
                                <p className="text-xs text-[#8ea5c8]">Advanced Web Systems · 2017</p>
                            </section>

                            <section className="h-44 rounded-xl border border-[#1d3a63] bg-[linear-gradient(145deg,#c5d8db,#7bb0bc)] p-3">
                                <div className="mt-auto rounded-md bg-[#0b1a31] p-2 text-xs text-white">
                                    <p className="text-[#2f9dff]">CURRENT BASE</p>
                                    <p>Pacific Heights, San Francisco</p>
                                </div>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
