"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose_1.default.connect(uri, {
            dbName: "devskill-connect",
        });
        console.log("[DB] ✅ Connected to MongoDB Atlas");
    }
    catch (error) {
        console.error("[DB] ❌ Connection error:", error.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
