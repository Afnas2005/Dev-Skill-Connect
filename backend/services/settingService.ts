import bcrypt from "bcrypt";
import Skill from "../models/Skill";
import Notification from "../models/Notification";
import User from "../models/User";
import Setting from "../models/Setting";

const ensureSetting = async (userId: string) => {
    let setting = await Setting.findOne({ userId });
    if (!setting) {
        setting = await Setting.create({ userId });
    }
    return setting;
};

export const getMySettings = async (userId: string) => {
    const user = await User.findById(userId).select("email").lean();
    if (!user) {
        throw new Error("User not found");
    }

    const setting = await ensureSetting(userId);

    return {
        email: user.email,
        username: setting.account?.username || "",
        privacy: {
            publicProfile: setting.privacy?.publicProfile ?? true,
            showOnlineStatus: setting.privacy?.showOnlineStatus ?? false,
            searchVisibility: setting.privacy?.searchVisibility ?? true,
        },
        notifications: {
            emailRequests: setting.notifications?.emailRequests ?? true,
            emailMessages: setting.notifications?.emailMessages ?? true,
            emailUpdates: setting.notifications?.emailUpdates ?? false,
            pushDesktop: setting.notifications?.pushDesktop ?? true,
            pushSound: setting.notifications?.pushSound ?? true,
        },
    };
};

type UpdatePayload = {
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    privacy?: {
        publicProfile?: boolean;
        showOnlineStatus?: boolean;
        searchVisibility?: boolean;
    };
    notifications?: {
        emailRequests?: boolean;
        emailMessages?: boolean;
        emailUpdates?: boolean;
        pushDesktop?: boolean;
        pushSound?: boolean;
    };
};

export const updateMySettings = async (userId: string, payload: UpdatePayload) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const setting = await ensureSetting(userId);

    if (payload.email && payload.email !== user.email) {
        const existing = await User.findOne({ email: payload.email, _id: { $ne: userId } });
        if (existing) {
            throw new Error("Email already in use");
        }
        user.email = payload.email;
    }

    if (payload.username !== undefined) {
        setting.account = {
            ...(setting.account || {}),
            username: payload.username,
        };
    }

    if (payload.privacy) {
        setting.privacy = {
            ...(setting.privacy || {}),
            ...payload.privacy,
        };
    }

    if (payload.notifications) {
        setting.notifications = {
            ...(setting.notifications || {}),
            ...payload.notifications,
        };
    }

    if (payload.newPassword) {
        if (payload.newPassword !== payload.confirmNewPassword) {
            throw new Error("Password confirmation does not match");
        }

        if (user.password) {
            if (!payload.currentPassword) {
                throw new Error("Current password is required");
            }
            const ok = await bcrypt.compare(payload.currentPassword, user.password);
            if (!ok) {
                throw new Error("Current password is incorrect");
            }
        }

        user.password = await bcrypt.hash(payload.newPassword, 10);
    }

    await Promise.all([user.save(), setting.save()]);
    return getMySettings(userId);
};

export const deleteMyAccount = async (userId: string) => {
    await Promise.all([
        Skill.deleteMany({ userId }),
        Notification.deleteMany({ userId }),
        Setting.deleteOne({ userId }),
        User.findByIdAndDelete(userId),
    ]);
    return { deleted: true };
};
