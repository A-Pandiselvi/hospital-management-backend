import db from "../../config/db.js";

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
  await db.query(`DELETE FROM doctors WHERE id = ?`, [doctorId]);
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
