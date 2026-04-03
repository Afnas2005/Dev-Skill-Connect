import "./config/env";
import { createServer } from "http";
import { connectDB } from "./config/db";
import { assertCloudinaryConfigured } from "./config/cloudinary";
import app from "./app";
import { createSocketServer } from "./realtime/socket";

const PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {
    try {
        console.log("[API] Starting...");
        assertCloudinaryConfigured();
        await connectDB();
        console.log("[API] Database ready");

        const httpServer = createServer(app);
        createSocketServer(httpServer);

        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`[API] Server running on port ${PORT}`);
        });
    } catch (error: any) {
        console.error("[API] Fatal error:", error?.message || error);
        process.exit(1);
    }
};

startServer();
