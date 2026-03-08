import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillLevelBadge } from "./skill-level-badge";
import type { Skill } from "@/types/domain";

type SkillCardProps = {
    skill: Skill;
    editable?: boolean;
    onEdit?: (skill: Skill) => void;
    onDelete?: (skill: Skill) => void;
};

export function SkillCard({ skill, editable, onEdit, onDelete }: SkillCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{skill.skillName}</CardTitle>
                    <SkillLevelBadge level={skill.level} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {skill.description ? (
                    <p className="text-sm text-zinc-600">{skill.description}</p>
                ) : (
                    <p className="text-sm text-zinc-400">No description provided.</p>
                )}

                {skill.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skill.attachments.map((url) => (
                            <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                            >
                                Attachment
                            </a>
                        ))}
                    </div>
                ) : null}

                {editable ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => onEdit?.(skill)}
                        >
                            <Pencil size={14} />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => onDelete?.(skill)}
                        >
                            <Trash2 size={14} />
                            Delete
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
