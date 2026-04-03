"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../src/config/db");
const User_1 = __importDefault(require("../src/models/User"));
const Skill_1 = __importDefault(require("../src/models/Skill"));
const Post_1 = __importDefault(require("../src/models/Post"));
const Setting_1 = __importDefault(require("../src/models/Setting"));
const Notification_1 = __importDefault(require("../src/models/Notification"));
const ConnectionRequest_1 = __importDefault(require("../src/models/ConnectionRequest"));
const dotenvPaths = [
    path_1.default.resolve(process.cwd(), ".env"),
    path_1.default.resolve(__dirname, "../.env"),
];
for (const dotenvPath of dotenvPaths) {
    const result = dotenv_1.default.config({ path: dotenvPath });
    if (!result.error)
        break;
}
const SAMPLE_DOMAIN = "@sample.devconnect.com";
const SAMPLE_PASSWORD = "Sample@123";
const seedUsers = [
    {
        name: "Alex Rivera",
        handle: "alex_rivera",
        professionalTitle: "Senior Frontend Engineer",
        location: "San Francisco, CA",
        bio: "Building fast product experiences with React, TypeScript, and design systems.",
    },
    {
        name: "Priya Nair",
        handle: "priya_nair",
        professionalTitle: "Backend Engineer",
        location: "Austin, TX",
        bio: "Focused on resilient APIs, queues, and clean service architecture.",
    },
    {
        name: "Marcus Lee",
        handle: "marcus_lee",
        professionalTitle: "Full-stack Developer",
        location: "Seattle, WA",
        bio: "Shipping feature-rich SaaS products from schema to UI.",
    },
    {
        name: "Sofia Patel",
        handle: "sofia_patel",
        professionalTitle: "DevOps Engineer",
        location: "Denver, CO",
        bio: "Automating cloud infra and CI/CD pipelines for high availability.",
    },
    {
        name: "Daniel Kim",
        handle: "daniel_kim",
        professionalTitle: "Platform Engineer",
        location: "New York, NY",
        bio: "Scaling internal platforms that help product teams ship faster.",
    },
    {
        name: "Aisha Thompson",
        handle: "aisha_thompson",
        professionalTitle: "Data Engineer",
        location: "Chicago, IL",
        bio: "Designing reliable data pipelines and analytics-ready datasets.",
    },
    {
        name: "Noah Chen",
        handle: "noah_chen",
        professionalTitle: "Mobile & Web Engineer",
        location: "San Diego, CA",
        bio: "Cross-platform developer blending mobile UX with robust backend logic.",
    },
    {
        name: "Elena Garcia",
        handle: "elena_garcia",
        professionalTitle: "Security Engineer",
        location: "Boston, MA",
        bio: "Securing web systems with practical auth, threat modeling, and monitoring.",
    },
    {
        name: "Rahul Verma",
        handle: "rahul_verma",
        professionalTitle: "Cloud Engineer",
        location: "Phoenix, AZ",
        bio: "Optimizing cloud architecture cost, performance, and observability.",
    },
    {
        name: "Maya Johnson",
        handle: "maya_johnson",
        professionalTitle: "Product Engineer",
        location: "Portland, OR",
        bio: "Turning product ideas into polished features with measurable impact.",
    },
];
const skillTemplates = [
    { skillName: "React", level: "advanced" },
    { skillName: "TypeScript", level: "advanced" },
    { skillName: "Node.js", level: "intermediate" },
    { skillName: "Express", level: "intermediate" },
    { skillName: "MongoDB", level: "intermediate" },
    { skillName: "Docker", level: "beginner" },
    { skillName: "AWS", level: "intermediate" },
    { skillName: "Next.js", level: "advanced" },
    { skillName: "Kubernetes", level: "beginner" },
    { skillName: "Redis", level: "intermediate" },
    { skillName: "Python", level: "intermediate" },
    { skillName: "GraphQL", level: "beginner" },
];
const codeSnippets = [
    `const isEven = (n: number) => n % 2 === 0;`,
    `app.get("/health", (_req, res) => res.json({ ok: true }));`,
    `const cache = new Map<string, string>();`,
    `kubectl rollout status deploy/api-gateway`,
    `db.users.createIndex({ email: 1 }, { unique: true });`,
];
const makePostContent = (name, idx) => `${name} shared an update about improving reliability and performance in feature batch ${idx + 1}.`;
const run = async () => {
    await (0, db_1.connectDB)();
    const existingUsers = await User_1.default.find({
        email: { $regex: `${SAMPLE_DOMAIN.replace(".", "\\.")}$`, $options: "i" },
    })
        .select("_id")
        .lean();
    const existingIds = existingUsers.map((item) => item._id);
    if (existingIds.length > 0) {
        await Promise.all([
            Skill_1.default.deleteMany({ userId: { $in: existingIds } }),
            Post_1.default.deleteMany({ userId: { $in: existingIds } }),
            Setting_1.default.deleteMany({ userId: { $in: existingIds } }),
            Notification_1.default.deleteMany({ userId: { $in: existingIds } }),
            ConnectionRequest_1.default.deleteMany({
                $or: [{ senderId: { $in: existingIds } }, { receiverId: { $in: existingIds } }],
            }),
            User_1.default.deleteMany({ _id: { $in: existingIds } }),
        ]);
    }
    const hashedPassword = await bcrypt_1.default.hash(SAMPLE_PASSWORD, 10);
    const users = await User_1.default.insertMany(seedUsers.map((item) => ({
        name: item.name,
        email: `${item.handle}${SAMPLE_DOMAIN}`,
        password: hashedPassword,
        bio: item.bio,
        professionalTitle: item.professionalTitle,
        location: item.location,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name)}`,
        socialLinks: {
            github: `https://github.com/${item.handle}`,
            linkedin: `https://www.linkedin.com/in/${item.handle}`,
            twitter: `https://x.com/${item.handle}`,
        },
    })));
    const settings = users.map((user, index) => ({
        userId: user._id,
        account: { username: seedUsers[index].handle },
        privacy: {
            publicProfile: true,
            showOnlineStatus: index % 2 === 0,
            searchVisibility: true,
        },
        notifications: {
            emailRequests: true,
            emailMessages: true,
            emailUpdates: index % 3 === 0,
            pushDesktop: true,
            pushSound: true,
        },
    }));
    await Setting_1.default.insertMany(settings);
    const skills = users.flatMap((user, index) => {
        const start = (index * 2) % skillTemplates.length;
        return [0, 1, 2].map((offset) => {
            const template = skillTemplates[(start + offset) % skillTemplates.length];
            return {
                userId: user._id,
                skillName: template.skillName,
                level: template.level,
                description: `${seedUsers[index].name} uses ${template.skillName} in production projects.`,
                attachments: [],
            };
        });
    });
    await Skill_1.default.insertMany(skills);
    const posts = users.flatMap((user, index) => [0, 1].map((postIdx) => ({
        userId: user._id,
        content: makePostContent(seedUsers[index].name, postIdx),
        codeSnippet: codeSnippets[(index + postIdx) % codeSnippets.length],
        codeLanguage: "typescript",
        screenshots: [],
        attachments: [],
        visibility: "public",
        status: "published",
        scheduledAt: null,
        createdAt: new Date(Date.now() - (index * 2 + postIdx) * 60 * 60 * 1000),
        updatedAt: new Date(),
    })));
    await Post_1.default.insertMany(posts);
    const connections = [];
    for (let i = 0; i < users.length - 1; i += 1) {
        connections.push({
            senderId: users[i]._id,
            receiverId: users[i + 1]._id,
            status: "pending",
        });
    }
    await ConnectionRequest_1.default.insertMany(connections);
    const notifications = users.slice(1).map((receiver, idx) => ({
        userId: receiver._id,
        type: "connections",
        name: users[idx].name || users[idx].email,
        message: "sent you a connection request.",
        actionLabel: "Accept",
        secondaryAction: "Decline",
        unread: true,
    }));
    await Notification_1.default.insertMany(notifications);
    console.log("[SEED] Sample data created successfully.");
    console.log(`[SEED] Users: ${users.length}`);
    console.log(`[SEED] Skills: ${skills.length}`);
    console.log(`[SEED] Posts: ${posts.length}`);
    console.log(`[SEED] Connection requests: ${connections.length}`);
    console.log(`[SEED] Notifications: ${notifications.length}`);
    console.log(`[SEED] Login password for sample users: ${SAMPLE_PASSWORD}`);
    console.log(`[SEED] Example login email: ${seedUsers[0].handle}${SAMPLE_DOMAIN}`);
};
run()
    .catch((error) => {
    console.error("[SEED] Failed:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await mongoose_1.default.disconnect();
});
