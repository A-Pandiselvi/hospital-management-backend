import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import doctorRoutes from "./modules/doctor/doctor.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";

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
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later."
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT);
});
