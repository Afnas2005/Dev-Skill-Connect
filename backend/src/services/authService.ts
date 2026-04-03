import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import Skill from "../models/Skill";
import type { IUser } from "../models/User";
import type { SignOptions } from "jsonwebtoken";

type AuthTokenPayload = {
    userId: string;
    email: string;
    type: "access" | "refresh";
};

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
const ACCESS_TOKEN_EXPIRES_IN =
    (process.env.JWT_ACCESS_EXPIRES_IN || "1h") as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN =
    (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

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

const serializeUser = (user: IUser) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    bio: user.bio,
    professionalTitle: user.professionalTitle,
    location: user.location,
    profileImage: user.profileImage,
    backgroundImage: user.backgroundImage,
    resumeUrl: user.resumeUrl,
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
});

const signAccessToken = (user: IUser) =>
    jwt.sign({ userId: user._id, email: user.email, type: "access" }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

const signRefreshToken = (user: IUser) =>
    jwt.sign({ userId: user._id, email: user.email, type: "refresh" }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

const storeRefreshToken = async (userId: string, refreshToken: string) => {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(userId, { refreshTokenHash });
};

const createAuthPayload = async (user: IUser) => {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await storeRefreshToken(user._id.toString(), refreshToken);

    return {
        user: serializeUser(user),
        accessToken,
        refreshToken,
    };
};

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;

export const registerUser = async (data: any) => {
    const { email, password, name } = data;

    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    return {
        user: serializeUser(user),
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

    return createAuthPayload(user);
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
    } catch {
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

    return createAuthPayload(user);
};

export const refreshAuthSession = async (refreshToken: string) => {
    let decoded: AuthTokenPayload;

    try {
        decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
    } catch (error: any) {
        if (error?.name === "TokenExpiredError") {
            throw new Error("Refresh token expired");
        }
        throw new Error("Invalid refresh token");
    }

    if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
        throw new Error("Invalid refresh token");
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
        throw new Error("Invalid refresh token");
    }

    return createAuthPayload(user);
};

export const revokeRefreshToken = async (userId?: string) => {
    if (!userId) {
        return;
    }

    await User.findByIdAndUpdate(userId, { refreshTokenHash: "" });
};

export const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password -refreshTokenHash -__v");
    if (!user) {
        throw new Error("User not found");
    }

    const skills = await Skill.find({ userId }).select("-__v -userId");

    return {
        user: serializeUser(user),
        skills,
    };
};

export const updateUserProfile = async (userId: string, data: any) => {
    const { name, skills } = data;

    const updatedUser = await User.findById(userId).select("-password -refreshTokenHash -__v");
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
        user: serializeUser(updatedUser),
        skills: updatedSkills,
    };
};
