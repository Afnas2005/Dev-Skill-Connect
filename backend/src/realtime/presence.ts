const socketsByUserId = new Map<string, Set<string>>();

export const addUserSocket = (userId: string, socketId: string) => {
    const sockets = socketsByUserId.get(userId) || new Set<string>();
    sockets.add(socketId);
    socketsByUserId.set(userId, sockets);
};

export const removeUserSocket = (userId: string, socketId: string) => {
    const sockets = socketsByUserId.get(userId);
    if (!sockets) {
        return;
    }

    sockets.delete(socketId);

    if (sockets.size === 0) {
        socketsByUserId.delete(userId);
    }
};

export const isUserOnline = (userId: string) => {
    return (socketsByUserId.get(userId)?.size || 0) > 0;
};
