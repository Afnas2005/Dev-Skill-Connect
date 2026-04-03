"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.removeUserSocket = exports.addUserSocket = void 0;
const socketsByUserId = new Map();
const addUserSocket = (userId, socketId) => {
    const sockets = socketsByUserId.get(userId) || new Set();
    sockets.add(socketId);
    socketsByUserId.set(userId, sockets);
};
exports.addUserSocket = addUserSocket;
const removeUserSocket = (userId, socketId) => {
    const sockets = socketsByUserId.get(userId);
    if (!sockets) {
        return;
    }
    sockets.delete(socketId);
    if (sockets.size === 0) {
        socketsByUserId.delete(userId);
    }
};
exports.removeUserSocket = removeUserSocket;
const isUserOnline = (userId) => {
    return (socketsByUserId.get(userId)?.size || 0) > 0;
};
exports.isUserOnline = isUserOnline;
