"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const dotenvPaths = [
    path_1.default.resolve(process.cwd(), ".env"),
    path_1.default.resolve(__dirname, ".env"),
    path_1.default.resolve(__dirname, "../.env"),
];
for (const dotenvPath of dotenvPaths) {
    const result = dotenv_1.default.config({ path: dotenvPath });
    if (!result.error) {
        break;
    }
}
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const error_1 = require("./middleware/error");
const cloudinary_1 = require("./config/cloudinary");
const app = (0, express_1.default)();
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "X-Total-Count"],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
app.get("/", (req, res) => {
    res.json({ message: "DevSkill Connect API is running" });
});
app.use("/auth", authRoutes_1.default);
app.use("/profile", profileRoutes_1.default);
app.use("/skills", skillRoutes_1.default);
app.use("/search", searchRoutes_1.default);
app.use("/uploads", uploadRoutes_1.default);
app.use("/notifications", notificationRoutes_1.default);
app.use("/settings", settingRoutes_1.default);
app.use("/posts", postRoutes_1.default);
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.use(error_1.errorHandler);
const PORT = Number(process.env.PORT) || 5001;
const startServer = async () => {
    try {
        console.log("[API] Starting...");
        (0, cloudinary_1.assertCloudinaryConfigured)();
        await (0, db_1.connectDB)();
        console.log("[API] Database ready");
        app.listen(PORT, "127.0.0.1", () => {
            console.log(`[API] Running on http://127.0.0.1:${PORT}`);
        });
    }
    catch (error) {
        console.error("[API] Fatal error:", error?.message || error);
        process.exit(1);
    }
};
startServer();
