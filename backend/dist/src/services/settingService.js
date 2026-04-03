"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.updateMySettings = exports.getMySettings = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const Skill_1 = __importDefault(require("../models/Skill"));
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const Setting_1 = __importDefault(require("../models/Setting"));
const ensureSetting = async (userId) => {
    let setting = await Setting_1.default.findOne({ userId });
    if (!setting) {
        setting = await Setting_1.default.create({ userId });
    }
    return setting;
};
const getMySettings = async (userId) => {
    const user = await User_1.default.findById(userId).select("email").lean();
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
exports.getMySettings = getMySettings;
const updateMySettings = async (userId, payload) => {
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const setting = await ensureSetting(userId);
    if (payload.email && payload.email !== user.email) {
        const existing = await User_1.default.findOne({ email: payload.email, _id: { $ne: userId } });
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
            const ok = await bcrypt_1.default.compare(payload.currentPassword, user.password);
            if (!ok) {
                throw new Error("Current password is incorrect");
            }
        }
        user.password = await bcrypt_1.default.hash(payload.newPassword, 10);
    }
    await Promise.all([user.save(), setting.save()]);
    return (0, exports.getMySettings)(userId);
};
exports.updateMySettings = updateMySettings;
const deleteMyAccount = async (userId) => {
    await Promise.all([
        Skill_1.default.deleteMany({ userId }),
        Notification_1.default.deleteMany({ userId }),
        Setting_1.default.deleteOne({ userId }),
        User_1.default.findByIdAndDelete(userId),
    ]);
    return { deleted: true };
};
exports.deleteMyAccount = deleteMyAccount;
