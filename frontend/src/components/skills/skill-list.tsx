import type { Skill } from "@/types/domain";
import { SkillCard } from "./skill-card";

type SkillListProps = {
    skills: Skill[];
    editable?: boolean;
    onEdit?: (skill: Skill) => void;
    onDelete?: (skill: Skill) => void;
};

export function SkillList({ skills, editable, onEdit, onDelete }: SkillListProps) {
    if (skills.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
                No skills found yet.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
                <SkillCard
                    key={skill._id}
                    skill={skill}
                    editable={editable}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
