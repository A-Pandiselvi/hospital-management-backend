import db from "../../config/db.js";
import bcrypt from "bcryptjs";
import { sendDoctorCredentials } from "../email/sendEmail.js";
/* ======================================================
   1️⃣ DASHBOARD COUNTS
====================================================== */

// total doctors
export const getTotalDoctors = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM doctors`);
  return rows[0];
};

// total patients
export const getTotalPatients = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM patients`);
  return rows[0];
};

// total appointments
export const getTotalAppointments = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM appointments`);
  return rows[0];
};

// total revenue (only paid)
export const getTotalRevenue = async () => {
  const [rows] = await db.query(`
    SELECT IFNULL(SUM(consultation_fee + medicine_cost),0) AS revenue
    FROM billing
    WHERE payment_status = 'paid'
  `);
  return rows[0];
};

/* ======================================================
   2️⃣ DOCTORS LIST
====================================================== */
export const getAllDoctors = async () => {
  const [rows] = await db.query(`
    SELECT 
      d.id,
      u.name,
      u.email,
      d.specialization,
      d.experience,
      d.consultation_fee,
      d.availability,
      d.created_at
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.id DESC
  `);

  return rows;
};

/* ======================================================
   3️⃣ DELETE DOCTOR
====================================================== */
export const deleteDoctorModel = async (doctorId) => {
  const [rows] = await db.query(
    `SELECT user_id FROM doctors WHERE id = ?`,
    [doctorId]
  );

  if (rows.length === 0) {
    throw new Error("Doctor not found");
  }

  const userId = rows[0].user_id;

  await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
};

/* ======================================================
   4️⃣ PATIENTS LIST
====================================================== */
export const getAllPatients = async () => {
  const [rows] = await db.query(`
    SELECT 
      p.id,
      u.name,
      u.email,
      p.age,
      p.gender,
      p.phone,
      p.address,
      p.created_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.id DESC
  `);

  return rows;
};

/* ======================================================
   5️⃣ APPOINTMENTS LIST
====================================================== */
export const getAllAppointments = async () => {
  const [rows] = await db.query(`
    SELECT 
      a.id,
      pu.name AS patient_name,
      du.name AS doctor_name,
      a.appointment_date,
      a.appointment_time,
      a.reason,
      a.status,
      a.created_at
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    ORDER BY a.appointment_date DESC
  `);

  return rows;
};

/* ======================================================
   6️⃣ BILLING LIST
====================================================== */
export const getAllBilling = async () => {
  const [rows] = await db.query(`
    SELECT 
      b.id,
      pu.name AS patient_name,
      du.name AS doctor_name,
      b.consultation_fee,
      b.medicine_cost,
      (b.consultation_fee + b.medicine_cost) AS total_amount,
      b.payment_status,
      b.created_at
    FROM billing b
    JOIN appointments a ON b.appointment_id = a.id
    JOIN patients p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    ORDER BY b.id DESC
  `);

  return rows;
};

export const createDoctorModel = async (doctorData) => {
  const {
    name,
    email,
    specialization,
    experience,
    consultation_fee,
    availability
  } = doctorData;

  // Insert into users (NO PASSWORD)
  const [userResult] = await db.query(
    `INSERT INTO users 
     (name, email, role, is_verified, is_invited)
     VALUES (?, ?, 'doctor', 0, 1)`,
    [name, email]
  );

  const userId = userResult.insertId;

  // Insert into doctors table
  await db.query(
    `INSERT INTO doctors 
     (user_id, specialization, experience, consultation_fee, availability)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, specialization, experience, consultation_fee, availability]
  );

  // Send mail
  await sendDoctorCredentials(email, name);

  return { message: "Doctor invited successfully" };
};

export const updateDoctorModel = async (doctorId, data) => {
  const { specialization, experience, consultation_fee, availability } = data;

  await db.query(
    `UPDATE doctors 
     SET specialization = ?, 
         experience = ?, 
         consultation_fee = ?, 
         availability = ?
     WHERE id = ?`,
    [specialization, experience, consultation_fee, availability, doctorId]
  );
};

export const deletePatientModel = async (patientId) => {
  const [patient] = await db.query(
    `SELECT user_id FROM patients WHERE id = ?`,
    [patientId]
  );

  if (!patient.length) {
    throw new Error("Patient not found");
  }

  const userId = patient[0].user_id;

  await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
};


export const updateAppointmentStatusModel = async (
  appointmentId,
  status
) => {
  await db.query(
    `UPDATE appointments 
     SET status = ?
     WHERE id = ?`,
    [status, appointmentId]
  );
};

export const updateBillingStatusModel = async (billingId, payment_status) => {
  const [result] = await db.query(
    `UPDATE billing SET payment_status = ? WHERE id = ?`,
    [payment_status, billingId]
  );

  return result;
};

export const getAdminReportsModel = async ({ range, from, to }) => {

  let dateFilter = "";

  // 🎯 Predefined Filters
  if (range === "today") {
    dateFilter = "DATE(created_at) = CURDATE()";
  } 
  else if (range === "week") {
    dateFilter = "YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
  } 
  else if (range === "month") {
    dateFilter = "MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
  } 
  else if (from && to) {
    dateFilter = `DATE(created_at) BETWEEN '${from}' AND '${to}'`;
  } 
  else {
    dateFilter = "1=1"; // no filter
  }

  // Revenue Summary
  const [revenueSummary] = await db.query(`
    SELECT 
      COUNT(*) AS totalBills,
      SUM(CASE WHEN payment_status='paid' THEN consultation_fee + medicine_cost ELSE 0 END) AS totalRevenue,
      SUM(CASE WHEN payment_status='unpaid' THEN consultation_fee + medicine_cost ELSE 0 END) AS pendingRevenue
    FROM billing
    WHERE ${dateFilter}
  `);

  // Appointment Summary
  const [appointmentSummary] = await db.query(`
    SELECT 
      COUNT(*) AS totalAppointments,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) AS rejected
    FROM appointments
    WHERE ${dateFilter}
  `);

  // Doctor Performance
  const [doctorPerformance] = await db.query(`
    SELECT 
      u.name,
      COUNT(a.id) AS totalAppointments
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN appointments a 
      ON d.id = a.doctor_id 
      AND ${dateFilter}
    GROUP BY d.id
    ORDER BY totalAppointments DESC
  `);

  return {
    revenueSummary: revenueSummary[0],
    appointmentSummary: appointmentSummary[0],
    doctorPerformance
  };
};

export const createPatientModel = async (data) => {
  const { name, email, password, age, gender, phone, address } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1️⃣ create user
  const [userResult] = await db.query(
    `INSERT INTO users (name, email, password, role, is_verified)
     VALUES (?, ?, ?, 'patient', 1)`,
    [name, email, hashedPassword]
  );

  const userId = userResult.insertId;

  // 2️⃣ create patient profile
  const [patientResult] = await db.query(
    `INSERT INTO patients (user_id, age, gender, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, age, gender, phone, address]
  );

  return { id: patientResult.insertId };
};

export const updatePatientModel = async (patientId, data) => {
  const { name, email, age, gender, phone, address } = data;

  // update users table
  await db.query(
    `UPDATE users u
     JOIN patients p ON p.user_id = u.id
     SET u.name = ?, u.email = ?
     WHERE p.id = ?`,
    [name, email, patientId]
  );

  // update patient table
  await db.query(
    `UPDATE patients
     SET age = ?, gender = ?, phone = ?, address = ?
     WHERE id = ?`,
    [age, gender, phone, address, patientId]
  );
};

export const getAllPrescriptions = async () => {
  const [rows] = await db.query(`
    SELECT 
      pr.id,
      pu.name AS patient_name,
      du.name AS doctor_name,
      pr.medicines,
      pr.notes,
      pr.created_at
    FROM prescriptions pr
    JOIN patients p ON pr.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON pr.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    ORDER BY pr.id DESC
  `);

  return rows;
};