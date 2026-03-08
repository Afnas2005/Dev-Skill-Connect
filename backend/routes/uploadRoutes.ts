import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
    uploadProfileImage,
    uploadPostFiles,
    uploadPostScreenshots,
    uploadSkillAttachments,
} from "../controllers/uploadController";
import {
    uploadMultipleImages,
    uploadPostFiles as uploadPostFilesMiddleware,
    uploadPostScreenshots as uploadPostScreenshotsMiddleware,
    uploadSingleImage,
} from "../middleware/upload";

const router = express.Router();

router.post("/profile-image", authMiddleware, uploadSingleImage, uploadProfileImage);
router.post(
    "/skill-attachments",
    authMiddleware,
    uploadMultipleImages,
    uploadSkillAttachments
);
router.post(
    "/post-screenshots",
    authMiddleware,
    uploadPostScreenshotsMiddleware,
    uploadPostScreenshots
);
router.post(
    "/post-files",
    authMiddleware,
    uploadPostFilesMiddleware,
    uploadPostFiles
);

export default router;
