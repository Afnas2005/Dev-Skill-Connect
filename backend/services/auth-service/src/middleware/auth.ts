import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("[AUTH MIDDLEWARE] Cookies:", req.cookies);
  console.log("[AUTH MIDDLEWARE] Headers:", req.headers);

  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("[AUTH MIDDLEWARE] No token found");
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("[AUTH MIDDLEWARE] Invalid token:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};