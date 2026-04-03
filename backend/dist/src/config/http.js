"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClearCookieOptions = exports.getRefreshCookieOptions = exports.getAccessCookieOptions = exports.corsOptions = exports.allowedOrigins = void 0;
const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];
const parseAllowedOrigins = () => {
    const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";
    const configuredOrigins = rawOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
};
exports.allowedOrigins = parseAllowedOrigins();
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin || exports.allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "X-Total-Count"],
};
const getBaseCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};
const getAccessCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: 60 * 60 * 1000,
});
exports.getAccessCookieOptions = getAccessCookieOptions;
const getRefreshCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
exports.getRefreshCookieOptions = getRefreshCookieOptions;
const getClearCookieOptions = () => {
    const { maxAge, ...rest } = getBaseCookieOptions();
    return rest;
};
exports.getClearCookieOptions = getClearCookieOptions;
