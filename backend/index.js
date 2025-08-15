import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.route.js";
import communityRoute from "./routes/community.route.js";
import mongoose from "mongoose";
import { app, server } from "./socket/socket.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ES modules in monorepo structure
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Go up one level from backend/ to reach root directory
const rootDir = path.resolve(__dirname, "..");

const PORT = process.env.PORT || 3000;

// Define allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8001",
  "http://localhost:5173",
].filter(Boolean);

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(urlencoded({ extended: true, limit: "10mb" }));

// API routes (BEFORE static files)
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/communities", communityRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Server is running",
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve static files from frontend/dist (correct path for monorepo)
app.use(
  express.static(path.join(rootDir, "frontend", "dist"), {
    maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
    etag: true,
  })
);

// Handle SPA routing
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api") || req.path === "/health") {
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.resolve(rootDir, "frontend", "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Better error handling
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
});

// Database cleanup function
const cleanupDatabase = async () => {
  try {
    const { User } = await import("./models/user.model.js");
    const users = await User.find({});
    let cleanedCount = 0;

    for (const user of users) {
      const validFollowing = user.following.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      const validFollowers = user.followers.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      if (
        validFollowing.length !== user.following.length ||
        validFollowers.length !== user.followers.length
      ) {
        await User.findByIdAndUpdate(user._id, {
          following: validFollowing,
          followers: validFollowers,
        });
        cleanedCount++;
      }
    }
  } catch (error) {
    console.error("Database cleanup error:", error);
  }
};

// Server startup
const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    await connectDB();
    console.log("✅ Database connected");

    await cleanupDatabase();

    server.listen(PORT, () => {
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(
        `📁 Serving static files from: ${path.join(
          rootDir,
          "frontend",
          "dist"
        )}`
      );
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async (err) => {
    if (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }

    try {
      await mongoose.connection.close();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("Error closing database:", error);
    }

    console.log("✅ Server shutdown complete");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
