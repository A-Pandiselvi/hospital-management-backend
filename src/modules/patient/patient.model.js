import db from "../../config/db.js";

export const getPatientDashboardModel = async (userId) => {

  // get patient id
  const [[patient]] = await db.query(
    `SELECT id FROM patients WHERE user_id=?`,
    [userId]
  );

  if (!patient) return null;

  // upcoming
  const [[upcoming]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments
     WHERE patient_id=? AND status IN ('pending','approved')`,
    [patient.id]
  );

  // completed
  const [[completed]] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM appointments
     WHERE patient_id=? AND status='completed'`,
    [patient.id]
  );

  return {
    upcoming: upcoming.total,
    completed: completed.total
  };
};


export const bookAppointmentModel = async (userId, doctorId, date, time, reason) => {

  // get patient id
  const [[patient]] = await db.query(
    `SELECT id FROM patients WHERE user_id=?`,
    [userId]
  );
  if (!patient) return "PATIENT_NOT_FOUND";

  // check doctor exists
  const [[doctor]] = await db.query(
    `SELECT id FROM doctors WHERE id=?`,
    [doctorId]
  );
  if (!doctor) return "DOCTOR_NOT_FOUND";

  // prevent duplicate booking same time
  const [[exists]] = await db.query(
    `SELECT id FROM appointments 
     WHERE doctor_id=? AND appointment_date=? AND appointment_time=?`,
    [doctorId, date, time]
  );

  if (exists) return "SLOT_BOOKED";

  await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [patient.id, doctorId, date, time, reason]
  );

  return "BOOKED";
};


export const getMyAppointmentsModel = async (userId) => {

  const [[patient]] = await db.query(
    `SELECT id FROM patients WHERE user_id=?`,
    [userId]
  );
  if (!patient) return null;

  const [rows] = await db.query(`
    SELECT
      a.id,
      d.specialization,
      u.name AS doctor_name,
      a.appointment_date,
      a.appointment_time,
      a.reason,
      a.status
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    WHERE a.patient_id=?
    ORDER BY a.appointment_date DESC
  `, [patient.id]);

  return rows;
};

export const getPatientPrescriptionsModel = async (userId) => {

  // get patient id from user id
  const [[patient]] = await db.query(
    `SELECT id FROM patients WHERE user_id=?`,
    [userId]
  );
  if (!patient) return null;

  const [rows] = await db.query(`
    SELECT
      pr.id,
      u.name AS doctor_name,
      a.appointment_date,
      pr.medicines,
      pr.notes,
      pr.created_at
    FROM prescriptions pr
    JOIN doctors d ON pr.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    JOIN appointments a ON pr.appointment_id = a.id
    WHERE pr.patient_id=?
    ORDER BY pr.created_at DESC
  `, [patient.id]);

  return rows;
};


export const cancelAppointmentModel = async (appointmentId, userId) => {

  // get patient id
  const [[patient]] = await db.query(
    `SELECT id FROM patients WHERE user_id=?`,
    [userId]
  );
  if (!patient) return "PATIENT_NOT_FOUND";

  // check appointment belongs to patient
  const [[appointment]] = await db.query(
    `SELECT status FROM appointments WHERE id=? AND patient_id=?`,
    [appointmentId, patient.id]
  );

  if (!appointment) return "NOT_YOURS";

  if (appointment.status !== "pending")
    return "CANNOT_CANCEL";

  // delete appointment
  await db.query(`DELETE FROM appointments WHERE id=?`, [appointmentId]);

  return "SUCCESS";
};

