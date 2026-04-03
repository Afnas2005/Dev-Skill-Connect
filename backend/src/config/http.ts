import type { CorsOptions } from "cors";
import type { CookieOptions } from "express";

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

export const allowedOrigins = parseAllowedOrigins();

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
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

const getBaseCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};

export const getAccessCookieOptions = (): CookieOptions => ({
    ...getBaseCookieOptions(),
    maxAge: 60 * 60 * 1000,
});

export const getRefreshCookieOptions = (): CookieOptions => ({
    ...getBaseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const getClearCookieOptions = (): CookieOptions => {
    const { maxAge, ...rest } = getBaseCookieOptions();
    return rest;
};
