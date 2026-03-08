import User from "../models/User";
import Skill from "../models/Skill";

const PROFILE_SELECTION = "name email bio professionalTitle location profileImage backgroundImage socialLinks createdAt updatedAt";
const PUBLIC_PROFILE_SELECTION = "name bio professionalTitle location profileImage backgroundImage socialLinks createdAt updatedAt";

const sanitizeProfile = (user: any) => ({
    id: user._id,
    name: user.name || "",
    email: user.email,
    bio: user.bio || "",
    professionalTitle: user.professionalTitle || "",
    location: user.location || "",
    profileImage: user.profileImage || "",
    backgroundImage: user.backgroundImage || "",
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const sanitizePublicProfile = (user: any) => ({
    id: user._id,
    name: user.name || "",
    bio: user.bio || "",
    professionalTitle: user.professionalTitle || "",
    location: user.location || "",
    profileImage: user.profileImage || "",
    backgroundImage: user.backgroundImage || "",
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const getMyProfile = async (userId: string) => {
    const user = await User.findById(userId).select(PROFILE_SELECTION).lean();
    if (!user) {
        throw new Error("User not found");
    }

    const skills = await Skill.find({ userId })
        .select("skillName level description attachments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

    return {
        profile: sanitizeProfile(user),
        skills,
    };
};

export const updateMyProfile = async (
    userId: string,
    payload: {
        name?: string;
        bio?: string;
        professionalTitle?: string;
        location?: string;
        profileImage?: string;
        backgroundImage?: string;
        socialLinks?: {
            github?: string;
            linkedin?: string;
            twitter?: string;
        };
    }
) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (payload.name !== undefined) user.name = payload.name;
    if (payload.bio !== undefined) user.bio = payload.bio;
    if (payload.professionalTitle !== undefined) user.professionalTitle = payload.professionalTitle;
    if (payload.location !== undefined) user.location = payload.location;
    if (payload.profileImage !== undefined) user.profileImage = payload.profileImage;
    if (payload.backgroundImage !== undefined) user.backgroundImage = payload.backgroundImage;

    if (payload.socialLinks) {
        user.socialLinks = {
            ...(user.socialLinks || {}),
            ...payload.socialLinks,
        };
    }

    await user.save();

    return getMyProfile(userId);
};

export const getPublicProfile = async (userId: string) => {
    const user = await User.findById(userId).select(PUBLIC_PROFILE_SELECTION).lean();
    if (!user) {
        throw new Error("User not found");
    }

    const skills = await Skill.find({ userId })
        .select("skillName level description attachments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

    return {
        profile: sanitizePublicProfile(user),
        skills,
    };
};
