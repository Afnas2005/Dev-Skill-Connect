import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

const dotenvPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "../.env"),
];

for (const dotenvPath of dotenvPaths) {
    const result = dotenv.config({ path: dotenvPath });
    if (!result.error) {
        break;
    }
}

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import skillRoutes from "./routes/skillRoutes";
import searchRoutes from "./routes/searchRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import settingRoutes from "./routes/settingRoutes";
import postRoutes from "./routes/postRoutes";
import { errorHandler } from "./middleware/error";
import { assertCloudinaryConfigured } from "./config/cloudinary";

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "X-Total-Count"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "DevSkill Connect API is running" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/skills", skillRoutes);
app.use("/search", searchRoutes);
app.use("/uploads", uploadRoutes);
app.use("/notifications", notificationRoutes);
app.use("/settings", settingRoutes);
app.use("/posts", postRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler as any);

const PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {
    try {
        console.log("[API] Starting...");
        assertCloudinaryConfigured();
        await connectDB();
        console.log("[API] Database ready");

        app.listen(PORT, "127.0.0.1", () => {
            console.log(`[API] Running on http://127.0.0.1:${PORT}`);
        });
    } catch (error: any) {
        console.error("[API] Fatal error:", error?.message || error);
        process.exit(1);
    }
};

startServer();
