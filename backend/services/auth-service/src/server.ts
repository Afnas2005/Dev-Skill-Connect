import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

import { connectDB } from "./config/db";
import { User } from "./modules/auth/user.model";
import { authMiddleware, AuthRequest } from "./middleware/auth";

const app = express();

// ============================================================================
// CORS - MUST include exposedHeaders for Set-Cookie
// ============================================================================
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Set-Cookie", "X-Total-Count"], // ✅ CRITICAL
};

app.use(cors(corsOptions));

// Body parsers and cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Auth Service is running 🔐" });
});

// ============================================================================
// POST /register
// ============================================================================
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ email, password: hashed });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error: any) {
    console.error("[REGISTER] Error:", error?.message || error);
    res.status(500).json({
      error: "Registration failed",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
});

// ============================================================================
// POST /login - sets httpOnly cookie
// ============================================================================
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // ✅ NOT accessible by JavaScript
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        token, // Optional: return token if frontend also needs it in Authorization header
      },
    });
  } catch (error: any) {
    console.error("[LOGIN] Error:", error?.message || error);
    res.status(500).json({
      error: "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
});

// ============================================================================
// GET /me - protected route (reads token from cookie or header)
// ============================================================================
app.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("[ME] Error:", error?.message || error);
    res.status(500).json({
      error: "Failed to get user",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
});

// ============================================================================
// POST /logout - clears httpOnly cookie
// ============================================================================
app.post("/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("[LOGOUT] Error:", error?.message || error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR]", err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================================
// Start server
// ============================================================================
const PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {
  try {
    console.log("[AUTH-SERVICE] Starting...");
    await connectDB();
    console.log("[AUTH-SERVICE] Database ready");

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`[AUTH-SERVICE] ✅ Running on http://127.0.0.1:${PORT}`);
    });
  } catch (error: any) {
    console.error("[AUTH-SERVICE] Fatal error:", error?.message || error);
    process.exit(1);
  }
};

startServer();