import express from "express";
import { createDoctor, login, register,verifyOtp ,forgotPassword, verifyResetOtp} from "./controller.js";
import { authorize, protect } from "../../middleware/authMiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/login", login);

authRoutes.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});
authRoutes.post(
  "/create-doctor",
  protect,
  authorize("admin"),
  createDoctor
);
authRoutes.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin!",
  });
});

authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/verify-reset-otp", verifyResetOtp);


export default authRoutes;