import express from "express";
import {
    register,
    login,
    getMe,
    updateProfile,
    logout,
    googleAuth,
    refreshSession,
} from "../controllers/authController";
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import {
    registerSchema,
    loginSchema,
    profileUpdateSchema,
} from "../validations/authValidation";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleAuth);
router.post("/refresh", refreshSession);
router.get("/me", authMiddleware, getMe);
router.put(
    "/profile",
    authMiddleware,
    validate(profileUpdateSchema),
    updateProfile
);
router.post("/logout", logout);

export default router;
