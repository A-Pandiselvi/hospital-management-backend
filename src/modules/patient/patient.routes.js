import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { patientDashboard } from "./patient.controller.js";
import { bookAppointment } from "./patient.controller.js";
import { myAppointments } from "./patient.controller.js";
import { getPrescriptions } from "./patient.controller.js";
import { cancelAppointment } from "./patient.controller.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("patient"), patientDashboard);
router.post("/book-appointment", protect, authorize("patient"), bookAppointment);
router.get("/my-appointments", protect, authorize("patient"), myAppointments);
router.get("/prescriptions", protect, authorize("patient"), getPrescriptions);
router.post("/cancel-appointment/:id", protect, authorize("patient"), cancelAppointment);

export default router;
