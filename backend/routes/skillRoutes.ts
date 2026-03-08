import express from "express";
import {
    createSkill,
    deleteSkill,
    getMySkills,
    getSkillsByUserId,
    updateSkill,
} from "../controllers/skillController";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    createSkillSchema,
    skillIdParamSchema,
    skillUserIdParamSchema,
    updateSkillSchema,
} from "../validations/skillValidation";

const router = express.Router();

router.post("/", authMiddleware, validate(createSkillSchema), createSkill);
router.put(
    "/:id",
    authMiddleware,
    validate({ params: skillIdParamSchema, body: updateSkillSchema }),
    updateSkill
);
router.delete(
    "/:id",
    authMiddleware,
    validate({ params: skillIdParamSchema }),
    deleteSkill
);
router.get("/me", authMiddleware, getMySkills);
router.get(
    "/user/:userId",
    validate({ params: skillUserIdParamSchema }),
    getSkillsByUserId
);

export default router;
