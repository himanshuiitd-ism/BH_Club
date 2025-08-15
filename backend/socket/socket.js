import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: true,
  allowEIO3: true, // For Socket.IO v2/v3 compatibility
});

const userSocketMap = {}; // stores userId -> socketId mapping
const communityRooms = {}; // stores communityId -> Set of userIds

export const receiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user joining a community room
  socket.on("joinCommunityRoom", async (communityId) => {
    if (!communityId || !userId) {
      console.log("Invalid communityId or userId for room join");
      return;
    }

    // Leave previous community rooms for this user
    Array.from(socket.rooms).forEach((room) => {
      if (room !== socket.id && room !== communityId) {
        socket.leave(room);
      }
    });

    // Join the new community room
    socket.join(communityId);

    // Initialize community room tracking if not exists
    if (!communityRooms[communityId]) {
      communityRooms[communityId] = new Set();
    }

    // Add user to community room tracking
    communityRooms[communityId].add(userId);

    // Get actual room size from socket.io
    const roomSize = io.sockets.adapter.rooms.get(communityId)?.size || 0;

    // Emit updated count to everyone in the room
    io.to(communityId).emit("communityOnlineCount", {
      communityId,
      count: roomSize,
    });

    // Confirm room join to the user
    socket.emit("roomJoined", { communityId, success: true });
  });

  // Handle user leaving a community room
  socket.on("leaveCommunityRoom", (communityId) => {
    if (!communityId || !userId) return;

    socket.leave(communityId);

    if (communityRooms[communityId]) {
      communityRooms[communityId].delete(userId);

      // Clean up empty room tracking
      if (communityRooms[communityId].size === 0) {
        delete communityRooms[communityId];
      }
    }

    // Update count for remaining users in the room
    const roomSize = io.sockets.adapter.rooms.get(communityId)?.size || 0;
    io.to(communityId).emit("communityOnlineCount", {
      communityId,
      count: roomSize,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];

      // Remove from all community room tracking
      Object.keys(communityRooms).forEach((communityId) => {
        if (
          communityRooms[communityId] &&
          communityRooms[communityId].has(userId)
        ) {
          communityRooms[communityId].delete(userId);

          // Clean up empty room tracking
          if (communityRooms[communityId].size === 0) {
            delete communityRooms[communityId];
          } else {
            // Update count for remaining users
            const roomSize =
              io.sockets.adapter.rooms.get(communityId)?.size || 0;
            io.to(communityId).emit("communityOnlineCount", {
              communityId,
              count: roomSize,
            });
          }
        }
      });
    }

    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle typing indicators for communities
  socket.on("communityTyping", ({ communityId, isTyping, displayName }) => {
    if (!communityId || !userId) return;

    socket.to(communityId).emit("communityUserTyping", {
      userId,
      displayName,
      isTyping,
      communityId,
    });
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Export function to emit to community rooms from controllers
export const emitToCommunityRoom = (communityId, event, data) => {
  io.to(communityId).emit(event, data);
};

export { app, server, io };
