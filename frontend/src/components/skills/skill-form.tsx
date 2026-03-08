"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Skill, SkillLevel, SkillPayload } from "@/types/domain";

type SkillFormProps = {
    initial?: Partial<Skill>;
    loading?: boolean;
    onSubmit: (payload: SkillPayload, files: File[]) => void;
    submitLabel: string;
};

const levels: SkillLevel[] = ["beginner", "intermediate", "advanced"];

export function SkillForm({ initial, loading, onSubmit, submitLabel }: SkillFormProps) {
    const [skillName, setSkillName] = useState(initial?.skillName || "");
    const [level, setLevel] = useState<SkillLevel>(initial?.level || "beginner");
    const [description, setDescription] = useState(initial?.description || "");
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!skillName.trim()) {
            return;
        }

        onSubmit(
            {
                skillName: skillName.trim(),
                level,
                description: description.trim(),
                attachments: initial?.attachments || [],
            },
            files
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Skill name</label>
                <Input
                    value={skillName}
                    onChange={(event) => setSkillName(event.target.value)}
                    placeholder="React, Node.js, TypeScript..."
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Skill level</label>
                <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value as SkillLevel)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                    disabled={loading}
                >
                    {levels.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                    placeholder="Optional details about this skill"
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => setFiles(Array.from(event.target.files || []))}
                    disabled={loading}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {submitLabel}
            </Button>
        </form>
    );
}
