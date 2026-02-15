import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

app.use(helmet()); // 🔐 security
app.use(cors());
app.use(express.json());

// 🔥 Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT);
});
