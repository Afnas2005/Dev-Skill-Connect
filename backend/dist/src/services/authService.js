"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.revokeRefreshToken = exports.refreshAuthSession = exports.googleAuth = exports.loginUser = exports.registerUser = exports.verifyAccessToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const Skill_1 = __importDefault(require("../models/Skill"));
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "1h");
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d");
const getGoogleAudiences = () => {
    const raw = process.env.GOOGLE_CLIENT_IDS ||
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "";
    return raw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && value.endsWith(".apps.googleusercontent.com"));
};
const googleClient = new google_auth_library_1.OAuth2Client();
const serializeUser = (user) => ({
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
const signAccessToken = (user) => jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, type: "access" }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
});
const signRefreshToken = (user) => jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, type: "refresh" }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
});
const storeRefreshToken = async (userId, refreshToken) => {
    const refreshTokenHash = await bcrypt_1.default.hash(refreshToken, 10);
    await User_1.default.findByIdAndUpdate(userId, { refreshTokenHash });
};
const createAuthPayload = async (user) => {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await storeRefreshToken(user._id.toString(), refreshToken);
    return {
        user: serializeUser(user),
        accessToken,
        refreshToken,
    };
};
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const registerUser = async (data) => {
    const { email, password, name } = data;
    const existing = await User_1.default.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await User_1.default.create({ email, password: hashedPassword, name });
    return {
        user: serializeUser(user),
    };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    const user = await User_1.default.findOne({ email });
    if (!user || !user.password) {
        throw new Error("Invalid email or password");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }
    return createAuthPayload(user);
};
exports.loginUser = loginUser;
const googleAuth = async (credential) => {
    const audiences = getGoogleAudiences();
    if (audiences.length === 0) {
        throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID (or GOOGLE_CLIENT_IDS) in backend/.env");
    }
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: audiences,
        });
    }
    catch {
        throw new Error("Invalid Google token");
    }
    const payload = ticket.getPayload();
    if (!payload || !payload.email || payload.email_verified !== true) {
        throw new Error("Invalid Google token");
    }
    const { email, name, sub: googleId } = payload;
    let user = await User_1.default.findOne({ email });
    if (!user) {
        user = await User_1.default.create({ email, name, googleId });
    }
    else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
    }
    return createAuthPayload(user);
};
exports.googleAuth = googleAuth;
const refreshAuthSession = async (refreshToken) => {
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        if (error?.name === "TokenExpiredError") {
            throw new Error("Refresh token expired");
        }
        throw new Error("Invalid refresh token");
    }
    if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
    }
    const user = await User_1.default.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
        throw new Error("Invalid refresh token");
    }
    const isMatch = await bcrypt_1.default.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
        throw new Error("Invalid refresh token");
    }
    return createAuthPayload(user);
};
exports.refreshAuthSession = refreshAuthSession;
const revokeRefreshToken = async (userId) => {
    if (!userId) {
        return;
    }
    await User_1.default.findByIdAndUpdate(userId, { refreshTokenHash: "" });
};
exports.revokeRefreshToken = revokeRefreshToken;
const getUserProfile = async (userId) => {
    const user = await User_1.default.findById(userId).select("-password -refreshTokenHash -__v");
    if (!user) {
        throw new Error("User not found");
    }
    const skills = await Skill_1.default.find({ userId }).select("-__v -userId");
    return {
        user: serializeUser(user),
        skills,
    };
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const { name, skills } = data;
    const updatedUser = await User_1.default.findById(userId).select("-password -refreshTokenHash -__v");
    if (!updatedUser) {
        throw new Error("User not found");
    }
    if (name) {
        updatedUser.name = name;
        await updatedUser.save();
    }
    if (skills && Array.isArray(skills)) {
        await Skill_1.default.deleteMany({ userId });
        const skillDocs = skills.map((s) => ({
            userId,
            skillName: s.skillName,
            level: s.level,
        }));
        await Skill_1.default.insertMany(skillDocs);
    }
    const updatedSkills = await Skill_1.default.find({ userId }).select("-__v -userId");
    return {
        user: serializeUser(updatedUser),
        skills: updatedSkills,
    };
};
exports.updateUserProfile = updateUserProfile;
