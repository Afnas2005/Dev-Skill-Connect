import express from "express";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    deleteMyAccount,
    getMySettings,
    updateMySettings,
} from "../controllers/settingController";
import { updateSettingsSchema } from "../validations/settingValidation";

const router = express.Router();

router.get("/me", authMiddleware, getMySettings);
router.put("/me", authMiddleware, validate(updateSettingsSchema), updateMySettings);
router.delete("/me", authMiddleware, deleteMyAccount);

export default router;
