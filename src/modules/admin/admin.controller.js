import {
  getTotalDoctors,
  getTotalPatients,
  getTotalAppointments,
  getTotalRevenue,
  getAllDoctors,
  deleteDoctorModel,
  getAllPatients,
  getAllAppointments,
  getAllBilling,
  createDoctorModel,
  updateDoctorModel,
  deletePatientModel,
  updateAppointmentStatusModel,
  updateBillingStatusModel,
  getAdminReportsModel,
  createPatientModel,
  updatePatientModel,
  getAllPrescriptions
} from "./admin.model.js";

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

export const getDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteDoctorModel(id);

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBilling = async (req, res) => {
  try {
    const billing = await getAllBilling();
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    await createDoctorModel(req.body);
    res.status(201).json({ message: "Doctor added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    await updateDoctorModel(req.params.id, req.body);
    res.json({ message: "Doctor updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    await deletePatientModel(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await updateAppointmentStatusModel(req.params.id, status);

    res.json({ message: "Appointment status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBillingStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;

    await updateBillingStatusModel(req.params.id, payment_status);

    res.json({ message: "Billing status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const { range, from, to } = req.query;

    const report = await getAdminReportsModel({ range, from, to });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone, address } = req.body;

    const patient = await createPatientModel({
      name,
      email,
      password,
      age,
      gender,
      phone,
      address
    });

    res.status(201).json({ message: "Patient created successfully", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, gender, phone, address } = req.body;

    await updatePatientModel(id, {
      name,
      email,
      age,
      gender,
      phone,
      address
    });

    res.json({ message: "Patient updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO appointments 
      (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
      VALUES (?, ?, ?, ?, ?, 'approved')`,
      [patient_id, doctor_id, appointment_date, appointment_time, reason]
    );

    res.status(201).json({
      message: "Appointment created successfully",
      appointmentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBilling = async (req, res) => {
  try {
    const { appointment_id, consultation_fee, medicine_cost } = req.body;

    const [result] = await db.query(
      `INSERT INTO billing 
      (appointment_id, consultation_fee, medicine_cost, payment_status)
      VALUES (?, ?, ?, 'unpaid')`,
      [appointment_id, consultation_fee, medicine_cost]
    );

    res.status(201).json({
      message: "Billing created successfully",
      billingId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await getAllPrescriptions();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
