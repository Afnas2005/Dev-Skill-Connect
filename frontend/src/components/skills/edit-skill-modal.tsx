"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillForm } from "./skill-form";
import type { Skill, SkillPayload } from "@/types/domain";

type EditSkillModalProps = {
    skill: Skill | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (payload: SkillPayload, files: File[]) => void;
};

export function EditSkillModal({
    skill,
    loading,
    onClose,
    onSubmit,
}: EditSkillModalProps) {
    if (!skill) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-5 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Edit Skill</h2>
                    <Button size="icon" variant="ghost" onClick={onClose}>
                        <X size={16} />
                    </Button>
                </div>
                <SkillForm
                    initial={skill}
                    loading={loading}
                    onSubmit={onSubmit}
                    submitLabel={loading ? "Saving..." : "Save changes"}
                />
            </div>
        </div>
    );
}
