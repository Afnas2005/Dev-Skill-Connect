import api from "./api";
import type { ApiResponse, Skill, SkillPayload } from "@/types/domain";

export const getMySkills = async () => {
    return api.get<ApiResponse<Skill[]>>("/skills/me");
};

export const getUserSkills = async (userId: string) => {
    return api.get<ApiResponse<Skill[]>>(`/skills/user/${userId}`);
};

export const createSkill = async (payload: SkillPayload) => {
    return api.post<ApiResponse<Skill>>("/skills", payload);
};

export const updateSkill = async (
    id: string,
    payload: Partial<SkillPayload>
) => {
    return api.put<ApiResponse<Skill>>(`/skills/${id}`, payload);
};

export const deleteSkill = async (id: string) => {
    return api.delete<ApiResponse<{ id: string }>>(`/skills/${id}`);
};
