"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.googleAuth = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const Skill_1 = __importDefault(require("../models/Skill"));
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
const registerUser = async (data) => {
    const { email, password, name } = data;
    const existing = await User_1.default.findOne({ email });
    if (existing) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await User_1.default.create({ email, password: hashedPassword, name });
    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
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
    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    };
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
    catch (error) {
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
    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        token,
    };
};
exports.googleAuth = googleAuth;
const getUserProfile = async (userId) => {
    const user = await User_1.default.findById(userId).select("-password -__v");
    if (!user) {
        throw new Error("User not found");
    }
    const skills = await Skill_1.default.find({ userId }).select("-__v -userId");
    return {
        user,
        skills,
    };
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const { name, skills } = data;
    let updatedUser = await User_1.default.findById(userId).select("-password -__v");
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
        user: updatedUser,
        skills: updatedSkills,
    };
};
exports.updateUserProfile = updateUserProfile;
