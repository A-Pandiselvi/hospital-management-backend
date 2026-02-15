import {
  getTotalDoctors,
  getTotalPatients,
  getTotalAppointments,
  getTotalRevenue,
  getAllDoctors,
  deleteDoctorModel,
  getAllPatients,
  getAllAppointments,
  getAllBilling
} from "./admin.model.js";

/* ======================================================
   1️⃣ ADMIN DASHBOARD
   GET /api/admin/dashboard
====================================================== */
export const adminDashboard = async (req, res) => {
  try {
    const doctors = await getTotalDoctors();
    const patients = await getTotalPatients();
    const appointments = await getTotalAppointments();
    const revenue = await getTotalRevenue();

    res.json({
      totalDoctors: doctors.total,
      totalPatients: patients.total,
      totalAppointments: appointments.total,
      totalRevenue: revenue.revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   2️⃣ GET ALL DOCTORS
   GET /api/admin/doctors
====================================================== */
export const getDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   3️⃣ DELETE DOCTOR
   DELETE /api/admin/doctor/:id
====================================================== */
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteDoctorModel(id);

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   4️⃣ GET ALL PATIENTS
   GET /api/admin/patients
====================================================== */
export const getPatients = async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   5️⃣ GET ALL APPOINTMENTS
   GET /api/admin/appointments
====================================================== */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   6️⃣ GET BILLING
   GET /api/admin/billing
====================================================== */
export const getBilling = async (req, res) => {
  try {
    const billing = await getAllBilling();
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
