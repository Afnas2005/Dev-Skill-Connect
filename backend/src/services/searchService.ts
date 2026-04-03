import Skill from "../models/Skill";
import User from "../models/User";
import ConnectionRequest from "../models/ConnectionRequest";
import Notification from "../models/Notification";

type SearchPayload = {
    skill?: string;
    level?: "beginner" | "intermediate" | "advanced";
    viewerId?: string;
};

const buildConnectionStatusMap = async (
    viewerId: string | undefined,
    userIds: string[]
) => {
    const statusMap = new Map<string, "none" | "pending" | "connected">();
    userIds.forEach((id) => statusMap.set(id, "none"));

    if (!viewerId || userIds.length === 0) {
        return statusMap;
    }

    const outgoing = await ConnectionRequest.find({
        senderId: viewerId,
        receiverId: { $in: userIds },
        status: { $in: ["pending", "accepted"] },
    })
        .select("receiverId status")
        .lean();

    for (const item of outgoing) {
        statusMap.set(
            item.receiverId.toString(),
            item.status === "accepted" ? "connected" : "pending"
        );
    }

    const incoming = await ConnectionRequest.find({
        receiverId: viewerId,
        senderId: { $in: userIds },
        status: { $in: ["pending", "accepted"] },
    })
        .select("senderId status")
        .lean();

    for (const item of incoming) {
        statusMap.set(
            item.senderId.toString(),
            item.status === "accepted" ? "connected" : "pending"
        );
    }

    return statusMap;
};

export const searchSkills = async ({ skill, level, viewerId }: SearchPayload) => {
    const hasFilters = Boolean(skill || level);

    if (!hasFilters) {
        const users = await User.find({})
            .select("name email bio location profileImage socialLinks")
            .sort({ createdAt: -1 })
            .lean();

        const usersWithoutViewer = viewerId
            ? users.filter((user) => user._id.toString() !== viewerId)
            : users;

        if (usersWithoutViewer.length === 0) {
            return [];
        }

        const userIds = usersWithoutViewer.map((user) => user._id.toString());
        const allSkills = await Skill.find({ userId: { $in: userIds } })
            .select("userId skillName level description attachments createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        const skillsMap = new Map<string, typeof allSkills>();
        for (const user of usersWithoutViewer) {
            skillsMap.set(user._id.toString(), []);
        }
        for (const item of allSkills) {
            const key = item.userId.toString();
            if (!skillsMap.has(key)) {
                skillsMap.set(key, []);
            }
            skillsMap.get(key)!.push(item);
        }

        const statusMap = await buildConnectionStatusMap(viewerId, userIds);

        return usersWithoutViewer.map((owner) => ({
            user: {
                id: owner._id,
                name: owner.name || "",
                email: owner.email,
                bio: owner.bio || "",
                location: owner.location || "",
                profileImage: owner.profileImage || "",
                socialLinks: owner.socialLinks || {},
            },
            skills: skillsMap.get(owner._id.toString()) || [],
            connectionStatus: statusMap.get(owner._id.toString()) || "none",
        }));
    }

    const filter: Record<string, unknown> = {};

    if (skill) {
        filter.skillName = { $regex: skill, $options: "i" };
    }

    if (level) {
        filter.level = level;
    }

    const skills = await Skill.find(filter)
        .select("userId skillName level description attachments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

    if (skills.length === 0) {
        return [];
    }

    const userIds = [...new Set(skills.map((item) => item.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } })
        .select("name email bio location profileImage socialLinks")
        .lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const statusMap = await buildConnectionStatusMap(viewerId, userIds);

    const grouped = new Map<
        string,
        {
            user: Record<string, unknown>;
            skills: typeof skills;
            connectionStatus: "none" | "pending" | "connected";
        }
    >();

    for (const item of skills) {
        const owner = userMap.get(item.userId.toString());
        if (!owner) {
            continue;
        }

        const key = item.userId.toString();
        if (!grouped.has(key)) {
            grouped.set(key, {
                user: {
                    id: owner._id,
                    name: owner.name || "",
                    email: owner.email,
                    bio: owner.bio || "",
                    location: owner.location || "",
                    profileImage: owner.profileImage || "",
                    socialLinks: owner.socialLinks || {},
                },
                skills: [],
                connectionStatus: statusMap.get(item.userId.toString()) || "none",
            });
        }

        grouped.get(key)!.skills.push(item);
    }

    return Array.from(grouped.values());
};

export const sendConnectionRequest = async (senderId: string, receiverId: string) => {
    if (senderId === receiverId) {
        throw new Error("You cannot connect with yourself");
    }

    const receiver = await User.findById(receiverId).select("_id");
    if (!receiver) {
        throw new Error("User not found");
    }

    const sender = await User.findById(senderId).select("name email");
    if (!sender) {
        throw new Error("User not found");
    }

    const existing = await ConnectionRequest.findOne({ senderId, receiverId }).select("status");
    if (existing?.status === "accepted") {
        throw new Error("Already connected");
    }
    if (existing?.status === "pending") {
        throw new Error("Connection request already sent");
    }

    const request = await ConnectionRequest.findOneAndUpdate(
        { senderId, receiverId },
        { status: "pending" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    await Notification.create({
        userId: receiverId,
        actorId: senderId,
        type: "connections",
        name: sender.name || sender.email,
        message: "sent you a connection request.",
        actionLabel: "Accept",
        secondaryAction: "Decline",
        unread: true,
    });

    return {
        id: request?._id,
        status: "pending",
    };
};

export const respondToConnectionRequest = async (
    receiverId: string,
    senderId: string,
    action: "accepted" | "rejected"
) => {
    const request = await ConnectionRequest.findOne({
        senderId,
        receiverId,
        status: "pending",
    });

    if (!request) {
        throw new Error("Connection request not found");
    }

    request.status = action;
    await request.save();

    await Notification.deleteMany({
        userId: receiverId,
        actorId: senderId,
        type: "connections",
    });

    if (action === "accepted") {
        const receiver = await User.findById(receiverId).select("name email").lean();
        if (receiver) {
            await Notification.create({
                userId: senderId,
                actorId: receiverId,
                type: "connections",
                name: receiver.name || receiver.email,
                message: "accepted your connection request.",
                actionLabel: "View Profile",
                unread: true,
            });
        }
    }

    return {
        senderId,
        receiverId,
        status: action,
    };
};
