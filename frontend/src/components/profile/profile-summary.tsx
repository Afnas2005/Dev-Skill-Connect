import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/types/domain";

export function ProfileSummary({
    profile,
    editable = true,
}: {
    profile: AuthUser;
    editable?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle>Profile</CardTitle>
                    {editable ? (
                        <Button asChild size="sm" variant="outline" className="gap-2">
                            <Link href="/profile/edit">
                                <Pencil size={14} />
                                Edit
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={profile.name || profile.email}
                        src={profile.profileImage}
                        className="h-14 w-14"
                    />
                    <div>
                        <p className="text-lg font-semibold">{profile.name || "Unnamed user"}</p>
                        <p className="text-sm text-zinc-500">{profile.email}</p>
                    </div>
                </div>

                <p className="text-sm text-zinc-600">{profile.bio || "No bio added yet."}</p>

                {profile.location ? (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin size={14} />
                        <span>{profile.location}</span>
                    </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                    {profile.socialLinks?.github ? (
                        <a
                            href={profile.socialLinks.github}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-zinc-200 px-2 py-1 text-xs"
                        >
                            GitHub
                        </a>
                    ) : null}
                    {profile.socialLinks?.linkedin ? (
                        <a
                            href={profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-zinc-200 px-2 py-1 text-xs"
                        >
                            LinkedIn
                        </a>
                    ) : null}
                    {profile.socialLinks?.twitter ? (
                        <a
                            href={profile.socialLinks.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-zinc-200 px-2 py-1 text-xs"
                        >
                            Twitter
                        </a>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
