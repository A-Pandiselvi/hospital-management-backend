import db from "../../config/db.js";

export const getDoctorDashboardModel = async (userId) => {

  // get doctor id
  const [[doctor]] = await db.query(
    `SELECT id FROM doctors WHERE user_id = ?`,
    [userId]
  );

  if (!doctor) return null;

  const doctorId = doctor.id;

  // today appointments
  const [[today]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments 
     WHERE doctor_id=? AND appointment_date = CURDATE()`,
    [doctorId]
  );

  // total appointments
  const [[total]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments 
     WHERE doctor_id=?`,
    [doctorId]
  );

  // completed
  const [[completed]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments 
     WHERE doctor_id=? AND status='completed'`,
    [doctorId]
  );

  // pending
  const [[pending]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments 
     WHERE doctor_id=? AND status='pending'`,
    [doctorId]
  );

  return {
    today: today.total,
    total: total.total,
    completed: completed.total,
    pending: pending.total
  };
};


export const getDoctorAppointmentsModel = async (userId) => {

  const [[doctor]] = await db.query(
    `SELECT id FROM doctors WHERE user_id=?`,
    [userId]
  );

  if (!doctor) return null;

  const [rows] = await db.query(`
    SELECT 
      a.id,
      u.name AS patient_name,
      a.appointment_date,
      a.appointment_time,
      a.reason,
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE a.doctor_id=?
    ORDER BY a.appointment_date DESC
  `, [doctor.id]);

  return rows;
};

export const updateAppointmentStatusModel = async (appointmentId, doctorUserId, status) => {

  // get doctor id
  const [[doctor]] = await db.query(
    `SELECT id FROM doctors WHERE user_id=?`,
    [doctorUserId]
  );

  if (!doctor) return "DOCTOR_NOT_FOUND";

  // check appointment belongs to doctor
  const [[appointment]] = await db.query(
    `SELECT * FROM appointments WHERE id=? AND doctor_id=?`,
    [appointmentId, doctor.id]
  );

  if (!appointment) return "NOT_ALLOWED";

  // update status
  await db.query(
    `UPDATE appointments SET status=? WHERE id=?`,
    [status, appointmentId]
  );

  return "UPDATED";
};


export const addPrescriptionModel = async (userId, appointmentId, medicines, notes) => {

  // get doctor id
  const [[doctor]] = await db.query(
    `SELECT id FROM doctors WHERE user_id=?`,
    [userId]
  );
  if (!doctor) return "DOCTOR_NOT_FOUND";

  // get appointment
  const [[appointment]] = await db.query(
    `SELECT * FROM appointments WHERE id=? AND doctor_id=?`,
    [appointmentId, doctor.id]
  );
  if (!appointment) return "NOT_YOURS";

  if (appointment.status !== "completed")
    return "NOT_COMPLETED";

  // insert prescription
  await db.query(
    `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, medicines, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [appointmentId, doctor.id, appointment.patient_id, medicines, notes]
  );

  return "ADDED";
};


