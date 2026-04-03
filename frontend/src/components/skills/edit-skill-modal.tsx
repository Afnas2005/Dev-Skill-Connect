"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    return (
        <AnimatePresence>
            {skill ? (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
                        initial={{ opacity: 0, scale: 0.97, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 10 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    >
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
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
