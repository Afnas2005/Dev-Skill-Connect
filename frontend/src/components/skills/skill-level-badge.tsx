import type { SkillLevel } from "@/types/domain";
import { cn } from "@/lib/utils";

const levelStyles: Record<SkillLevel, string> = {
    beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    intermediate: "bg-amber-50 text-amber-700 border-amber-200",
    advanced: "bg-sky-50 text-sky-700 border-sky-200",
};

export function SkillLevelBadge({ level }: { level: SkillLevel }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                levelStyles[level]
            )}
        >
            {level}
        </span>
    );
}
