"use client";

import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/services/api";

export const createChatSocket = (): Socket =>
    io(API_BASE_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });
