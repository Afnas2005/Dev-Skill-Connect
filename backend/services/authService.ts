import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import Skill from "../models/Skill";

const getGoogleAudiences = () => {
    const raw =
        process.env.GOOGLE_CLIENT_IDS ||
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "";

    return raw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && value.endsWith(".apps.googleusercontent.com"));
};

const googleClient = new OAuth2Client();

export const registerUser = async (data: any) => {
    const { email, password, name } = data;

    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
    };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    };
};

export const googleAuth = async (credential: string) => {
    const audiences = getGoogleAudiences();
    if (audiences.length === 0) {
        throw new Error(
            "Google OAuth is not configured. Set GOOGLE_CLIENT_ID (or GOOGLE_CLIENT_IDS) in backend/.env"
        );
    }

    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: audiences,
        });
    } catch (error) {
        throw new Error("Invalid Google token");
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email || payload.email_verified !== true) {
        throw new Error("Invalid Google token");
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({ email, name, googleId });
    } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    };
};

export const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
        throw new Error("User not found");
    }

    const skills = await Skill.find({ userId }).select("-__v -userId");

    return {
        user,
        skills,
    };
};

export const updateUserProfile = async (userId: string, data: any) => {
    const { name, skills } = data;

    let updatedUser = await User.findById(userId).select("-password -__v");
    if (!updatedUser) {
        throw new Error("User not found");
    }

    if (name) {
        updatedUser.name = name;
        await updatedUser.save();
    }

    if (skills && Array.isArray(skills)) {
        await Skill.deleteMany({ userId });
        const skillDocs = skills.map((s: any) => ({
            userId,
            skillName: s.skillName,
            level: s.level,
        }));
        await Skill.insertMany(skillDocs);
    }

    const updatedSkills = await Skill.find({ userId }).select("-__v -userId");

    return {
        user: updatedUser,
        skills: updatedSkills,
    };
};
