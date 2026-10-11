import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import cron from "node-cron";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust resolution for frontend dist directory across different execution cwd
const possibleDistPaths = [
  path.resolve(__dirname, "../../Frontend/dist"),
  path.resolve(__dirname, "../Frontend/dist"),
  path.resolve(process.cwd(), "Frontend/dist"),
  path.resolve(process.cwd(), "../Frontend/dist"),
];
const frontendDistPath = possibleDistPaths.find((p) => fs.existsSync(p)) || possibleDistPaths[0];

// Security headers with Cross-Origin Resource Policy allowed for external media/CDNs
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5001",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all Render domains (*.onrender.com)
      if (origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }
      // Reject unauthorized origins gracefully without crashing server
      return callback(null, false);
    },
    credentials: true,
  })
);

// Rate limiting for auth and API routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many authentication attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api", apiLimiter);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production" || fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    // Avoid returning index.html for non-existent assets or API calls
    if (req.path.startsWith("/assets/") || req.path.startsWith("/api/")) {
      return res.status(404).send("Resource not found");
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err?.message || err);
  res.status(err?.status || 500).json({
    message: err?.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();

  const keepAliveUrl = process.env.KEEP_ALIVE_URL;
  if (keepAliveUrl) {
    const keepAlivePing = async () => {
      try {
        const response = await fetch(keepAliveUrl, { method: "GET" });
        console.log(
          `Keep-alive ping to ${keepAliveUrl} responded with ${response.status}`
        );
      } catch (error) {
        console.error(`Keep-alive ping failed: ${error.message}`);
      }
    };

    keepAlivePing();
    cron.schedule("*/10 * * * *", keepAlivePing, {
      scheduled: true,
      timezone: "UTC",
    });
  }
});