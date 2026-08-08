import express from "express";
import {
  adminDashboard,
  getDoctors,
  deleteDoctor,
  getPatients,
  getAppointments,
  getBilling,
  createDoctor,
  updateDoctor,
  deletePatient,
  updateAppointmentStatus,
  updateBillingStatus,
  getAdminReports,
  createPatient,
  updatePatient,
  createAppointment,
  createBilling,
  getPrescriptions,exportReportsExcel
} from "./admin.controller.js";

import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();


router.get("/dashboard", protect, authorize("admin"), adminDashboard);

router.get("/doctors", protect, authorize("admin"), getDoctors);

router.delete("/doctor/:id", protect, authorize("admin"), deleteDoctor);

router.get("/patients", protect, authorize("admin"), getPatients);

router.get("/appointments", protect, authorize("admin"), getAppointments);

router.get("/billing", protect, authorize("admin"), getBilling);


router.post("/doctor", protect, authorize("admin"), createDoctor);

router.put("/doctor/:id", protect, authorize("admin"), updateDoctor);

router.post("/appointment", protect, authorize("admin"), createAppointment);

router.delete("/patient/:id", protect, authorize("admin"), deletePatient);

router.put("/appointment/:id", protect, authorize("admin"), updateAppointmentStatus);

router.post("/billing", protect, authorize("admin"), createBilling);

router.put("/billing/:id", protect, authorize("admin"), updateBillingStatus);


router.get("/prescriptions", protect, authorize("admin"), getPrescriptions);
//finish






router.put("/patient/:id", protect, authorize("admin"), updatePatient);


router.post("/patient", protect, authorize("admin"), createPatient);


router.get("/reports/excel", protect, authorize("admin"), exportReportsExcel);

export default router;


