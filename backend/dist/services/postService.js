"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedPosts = exports.getMyPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const POST_SELECTION = "userId content codeSnippet codeLanguage screenshots attachments visibility status scheduledAt createdAt updatedAt";
const createPost = async (userId, payload) => {
    const post = await Post_1.default.create({
        userId,
        content: payload.content || "",
        codeSnippet: payload.codeSnippet || "",
        codeLanguage: payload.codeLanguage || "typescript",
        screenshots: payload.screenshots || [],
        attachments: payload.attachments || [],
        visibility: payload.visibility || "public",
        status: payload.status || "published",
        scheduledAt: payload.scheduledAt || null,
    });
    return Post_1.default.findById(post._id).select(POST_SELECTION).lean();
};
exports.createPost = createPost;
const getMyPosts = async (userId) => {
    return Post_1.default.find({ userId }).select(POST_SELECTION).sort({ createdAt: -1 }).lean();
};
exports.getMyPosts = getMyPosts;
const getFeedPosts = async () => {
    const now = new Date();
    const posts = await Post_1.default.find({
        status: "published",
        visibility: "public",
        $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
    })
        .select(POST_SELECTION)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    if (posts.length === 0) {
        return [];
    }
    const userIds = [...new Set(posts.map((item) => item.userId.toString()))];
    const users = await User_1.default.find({ _id: { $in: userIds } })
        .select("name email profileImage professionalTitle location")
        .lean();
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    return posts.map((post) => {
        const owner = userMap.get(post.userId.toString());
        return {
            ...post,
            user: {
                id: owner?._id || post.userId,
                name: owner?.name || "",
                email: owner?.email || "",
                profileImage: owner?.profileImage || "",
                professionalTitle: owner?.professionalTitle || "",
                location: owner?.location || "",
            },
        };
    });
};
exports.getFeedPosts = getFeedPosts;
