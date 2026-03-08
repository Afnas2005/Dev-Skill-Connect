"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const postController_1 = require("../controllers/postController");
const postValidation_1 = require("../validations/postValidation");
const router = express_1.default.Router();
router.post("/", auth_1.authMiddleware, (0, validate_1.validate)(postValidation_1.createPostSchema), postController_1.createPost);
router.get("/feed", auth_1.authMiddleware, postController_1.getFeedPosts);
router.get("/me", auth_1.authMiddleware, postController_1.getMyPosts);
exports.default = router;
