import express from "express";
import {
  adminDashboard,
  getDoctors,
  deleteDoctor,
  getPatients,
  getAppointments,
  getBilling
} from "./admin.controller.js";

import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   ALL ADMIN ROUTES (Protected + Admin Only)
====================================================== */

router.get("/dashboard", protect, authorize("admin"), adminDashboard);

router.get("/doctors", protect, authorize("admin"), getDoctors);

router.delete("/doctor/:id", protect, authorize("admin"), deleteDoctor);

router.get("/patients", protect, authorize("admin"), getPatients);

router.get("/appointments", protect, authorize("admin"), getAppointments);

router.get("/billing", protect, authorize("admin"), getBilling);

export default router;
