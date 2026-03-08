import express from "express";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createPost, getFeedPosts, getMyPosts } from "../controllers/postController";
import { createPostSchema } from "../validations/postValidation";

const router = express.Router();

router.post("/", authMiddleware, validate(createPostSchema), createPost);
router.get("/feed", authMiddleware, getFeedPosts);
router.get("/me", authMiddleware, getMyPosts);

export default router;
