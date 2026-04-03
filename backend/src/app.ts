import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import skillRoutes from "./routes/skillRoutes";
import searchRoutes from "./routes/searchRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import settingRoutes from "./routes/settingRoutes";
import postRoutes from "./routes/postRoutes";
import chatRoutes from "./routes/chatRoutes";
import { corsOptions } from "./config/http";
import { errorHandler } from "./middleware/error";
import "./config/env";

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
app.use("/chat", chatRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler as any);

export default app;
