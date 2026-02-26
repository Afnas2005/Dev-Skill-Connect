import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

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

// 1. APPLY CORS GLOBALLY *BEFORE* PROXY
// This correctly intercepts and responds to OPTIONS preflight requests!
app.use(cors(corsOptions));

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API Gateway is running 🚀" });
});

const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://127.0.0.1:5001";

// ============================================================================
// 2. PROXY MIDDLEWARE
// MUST COME **BEFORE** ANY BODY PARSERS TO PREVENT CONSUMING THE REQUEST STREAM!
// ============================================================================
app.use(
  "/auth",
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
    on: {
      proxyReq: (proxyReq, req: any, res) => {
        console.log(`[PROXY] ${req.method} /auth${req.url} -> ${AUTH_URL}${req.url}`);
      },
      proxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY-RES] ${proxyRes.statusCode}`);

        // PREVENT STRICT CORS ERRORS:
        // Auth Service sends its own CORS headers. We must strip them here
        // so the browser does not see duplicate 'Access-Control-Allow-Origin' headers.
        delete proxyRes.headers["access-control-allow-origin"];
        delete proxyRes.headers["access-control-allow-credentials"];
        delete proxyRes.headers["access-control-allow-methods"];
        delete proxyRes.headers["access-control-allow-headers"];
        delete proxyRes.headers["access-control-expose-headers"];
      },
      error: (err, req, res: any) => {
        console.error("[PROXY-ERROR]", err?.message || err);
        if (!res.headersSent) {
          res.status(502).json({
            error: "Bad Gateway",
            message: "Could not reach Auth Service",
            details: err?.message,
          });
        }
      },
    },
  })
);

// ============================================================================
// 3. BODY PARSERS
// Only parses bodies for routes declared AFTER the proxy (e.g., custom gateway routes)
// ============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error("[ERROR]", err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[GATEWAY] ✅ Running on http://127.0.0.1:${PORT}`);
  console.log(`[GATEWAY] Auth Service -> ${AUTH_URL}`);
});