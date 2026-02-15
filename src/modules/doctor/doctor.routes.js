import express from "express";
import { addPrescription, doctorAppointments, doctorDashboard, updateAppointmentStatus } from "./doctor.controller.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("doctor"), doctorDashboard);
router.get("/appointments", protect, authorize("doctor"), doctorAppointments);
router.put(
  "/appointment-status/:id",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);
router.post("/prescription", protect, authorize("doctor"), addPrescription);

export default router;
