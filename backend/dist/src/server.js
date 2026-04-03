"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const http_1 = require("http");
const db_1 = require("./config/db");
const cloudinary_1 = require("./config/cloudinary");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./realtime/socket");
const PORT = Number(process.env.PORT) || 5001;
const startServer = async () => {
    try {
        console.log("[API] Starting...");
        (0, cloudinary_1.assertCloudinaryConfigured)();
        await (0, db_1.connectDB)();
        console.log("[API] Database ready");
        const httpServer = (0, http_1.createServer)(app_1.default);
        (0, socket_1.createSocketServer)(httpServer);
        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`[API] Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("[API] Fatal error:", error?.message || error);
        process.exit(1);
    }
};
startServer();
