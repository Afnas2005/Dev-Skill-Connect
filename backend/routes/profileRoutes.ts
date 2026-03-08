import express from "express";
import {
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
} from "../controllers/profileController";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    profileUpdateSchema,
    userIdParamSchema,
} from "../validations/profileValidation";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, validate(profileUpdateSchema), updateMyProfile);
router.get(
    "/:userId",
    validate({ params: userIdParamSchema }),
    getPublicProfile
);

export default router;
