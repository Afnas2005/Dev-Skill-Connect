import Post from "../models/Post";
import User from "../models/User";

const POST_SELECTION =
    "userId content codeSnippet codeLanguage screenshots attachments visibility status scheduledAt createdAt updatedAt";

export const createPost = async (
    userId: string,
    payload: {
        content?: string;
        codeSnippet?: string;
        codeLanguage?: "typescript" | "javascript" | "python" | "java" | "go" | "rust" | "cpp" | "other";
        screenshots?: string[];
        attachments?: string[];
        visibility?: "public" | "private";
        status?: "draft" | "published";
        scheduledAt?: string | null;
    }
) => {
    const post = await Post.create({
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

    return Post.findById(post._id).select(POST_SELECTION).lean();
};

export const getMyPosts = async (userId: string) => {
    return Post.find({ userId }).select(POST_SELECTION).sort({ createdAt: -1 }).lean();
};

export const getFeedPosts = async () => {
    const now = new Date();
    const posts = await Post.find({
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
    const users = await User.find({ _id: { $in: userIds } })
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
