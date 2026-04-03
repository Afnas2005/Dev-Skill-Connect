"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedPostsForViewer = exports.getFeedPosts = exports.getMyPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const ConnectionRequest_1 = __importDefault(require("../models/ConnectionRequest"));
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
    return (0, exports.getFeedPostsForViewer)();
};
exports.getFeedPosts = getFeedPosts;
const getFeedPostsForViewer = async (viewerId) => {
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
    const statusMap = new Map();
    userIds.forEach((id) => statusMap.set(id, "none"));
    if (viewerId && userIds.length > 0) {
        const outgoing = await ConnectionRequest_1.default.find({
            senderId: viewerId,
            receiverId: { $in: userIds },
            status: { $in: ["pending", "accepted"] },
        })
            .select("receiverId status")
            .lean();
        for (const item of outgoing) {
            statusMap.set(item.receiverId.toString(), item.status === "accepted" ? "connected" : "pending");
        }
        const incoming = await ConnectionRequest_1.default.find({
            receiverId: viewerId,
            senderId: { $in: userIds },
            status: { $in: ["pending", "accepted"] },
        })
            .select("senderId status")
            .lean();
        for (const item of incoming) {
            statusMap.set(item.senderId.toString(), item.status === "accepted" ? "connected" : "pending");
        }
    }
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
                connectionStatus: statusMap.get(post.userId.toString()) || "none",
            },
        };
    });
};
exports.getFeedPostsForViewer = getFeedPostsForViewer;
