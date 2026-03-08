import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Skill from "../models/Skill";
import Post from "../models/Post";
import Setting from "../models/Setting";
import Notification from "../models/Notification";
import ConnectionRequest from "../models/ConnectionRequest";

const dotenvPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../.env"),
];

for (const dotenvPath of dotenvPaths) {
    const result = dotenv.config({ path: dotenvPath });
    if (!result.error) break;
}

const SAMPLE_DOMAIN = "@sample.devconnect.com";
const SAMPLE_PASSWORD = "Sample@123";

type SeedUser = {
    name: string;
    handle: string;
    professionalTitle: string;
    location: string;
    bio: string;
};

const seedUsers: SeedUser[] = [
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
    { skillName: "React", level: "advanced" as const },
    { skillName: "TypeScript", level: "advanced" as const },
    { skillName: "Node.js", level: "intermediate" as const },
    { skillName: "Express", level: "intermediate" as const },
    { skillName: "MongoDB", level: "intermediate" as const },
    { skillName: "Docker", level: "beginner" as const },
    { skillName: "AWS", level: "intermediate" as const },
    { skillName: "Next.js", level: "advanced" as const },
    { skillName: "Kubernetes", level: "beginner" as const },
    { skillName: "Redis", level: "intermediate" as const },
    { skillName: "Python", level: "intermediate" as const },
    { skillName: "GraphQL", level: "beginner" as const },
];

const codeSnippets = [
    `const isEven = (n: number) => n % 2 === 0;`,
    `app.get("/health", (_req, res) => res.json({ ok: true }));`,
    `const cache = new Map<string, string>();`,
    `kubectl rollout status deploy/api-gateway`,
    `db.users.createIndex({ email: 1 }, { unique: true });`,
];

const makePostContent = (name: string, idx: number) =>
    `${name} shared an update about improving reliability and performance in feature batch ${
        idx + 1
    }.`;

const run = async () => {
    await connectDB();

    const existingUsers = await User.find({
        email: { $regex: `${SAMPLE_DOMAIN.replace(".", "\\.")}$`, $options: "i" },
    })
        .select("_id")
        .lean();
    const existingIds = existingUsers.map((item) => item._id);

    if (existingIds.length > 0) {
        await Promise.all([
            Skill.deleteMany({ userId: { $in: existingIds } }),
            Post.deleteMany({ userId: { $in: existingIds } }),
            Setting.deleteMany({ userId: { $in: existingIds } }),
            Notification.deleteMany({ userId: { $in: existingIds } }),
            ConnectionRequest.deleteMany({
                $or: [{ senderId: { $in: existingIds } }, { receiverId: { $in: existingIds } }],
            }),
            User.deleteMany({ _id: { $in: existingIds } }),
        ]);
    }

    const hashedPassword = await bcrypt.hash(SAMPLE_PASSWORD, 10);

    const users = await User.insertMany(
        seedUsers.map((item) => ({
            name: item.name,
            email: `${item.handle}${SAMPLE_DOMAIN}`,
            password: hashedPassword,
            bio: item.bio,
            professionalTitle: item.professionalTitle,
            location: item.location,
            profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                item.name
            )}`,
            socialLinks: {
                github: `https://github.com/${item.handle}`,
                linkedin: `https://www.linkedin.com/in/${item.handle}`,
                twitter: `https://x.com/${item.handle}`,
            },
        }))
    );

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
    await Setting.insertMany(settings);

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
    await Skill.insertMany(skills);

    const posts = users.flatMap((user, index) =>
        [0, 1].map((postIdx) => ({
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
        }))
    );
    await Post.insertMany(posts);

    const connections = [];
    for (let i = 0; i < users.length - 1; i += 1) {
        connections.push({
            senderId: users[i]._id,
            receiverId: users[i + 1]._id,
            status: "pending",
        });
    }
    await ConnectionRequest.insertMany(connections);

    const notifications = users.slice(1).map((receiver, idx) => ({
        userId: receiver._id,
        type: "connections" as const,
        name: users[idx].name || users[idx].email,
        message: "sent you a connection request.",
        actionLabel: "Accept",
        secondaryAction: "Decline",
        unread: true,
    }));
    await Notification.insertMany(notifications);

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
        await mongoose.disconnect();
    });
