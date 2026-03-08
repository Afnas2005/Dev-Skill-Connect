"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const uploadController_1 = require("../controllers/uploadController");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.post("/profile-image", auth_1.authMiddleware, upload_1.uploadSingleImage, uploadController_1.uploadProfileImage);
router.post("/skill-attachments", auth_1.authMiddleware, upload_1.uploadMultipleImages, uploadController_1.uploadSkillAttachments);
router.post("/post-screenshots", auth_1.authMiddleware, upload_1.uploadPostScreenshots, uploadController_1.uploadPostScreenshots);
router.post("/post-files", auth_1.authMiddleware, upload_1.uploadPostFiles, uploadController_1.uploadPostFiles);
exports.default = router;
