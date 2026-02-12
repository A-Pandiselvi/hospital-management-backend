import db from "../../config/db.js";

// Find user by email
export const findUserByEmailModel = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows;
};

// Create Patient
export const createPatientModel = async (
  name,
  email,
  password,
  otp,
  otpExpiry
) => {
  await db.query(
    `INSERT INTO users (name, email, password, role, otp, otp_expiry)
     VALUES (?, ?, ?, 'patient', ?, ?)`,
    [name, email, password, otp, otpExpiry]
  );
};

// Verify User
export const verifyUserModel = async (email) => {
  await db.query(
    `UPDATE users
     SET is_verified = true, otp = NULL, otp_expiry = NULL
     WHERE email = ?`,
    [email]
  );
};

export const createDoctorModel = async (
  name,
  email,
  password
) => {
  await db.query(
    `INSERT INTO users (name, email, password, role, is_verified)
     VALUES (?, ?, ?, 'doctor', true)`,
    [name, email, password]
  );
};

// Save reset OTP
export const saveResetOtpModel = async (email, otp, expiry) => {
  await db.query(
    `UPDATE users 
     SET reset_otp = ?, reset_otp_expiry = ?
     WHERE email = ?`,
    [otp, expiry, email]
  );
};

// Find user by reset OTP
export const findUserByResetOtpModel = async (email, otp) => {
  const [rows] = await db.query(
    `SELECT * FROM users 
     WHERE email = ? 
     AND reset_otp = ?
     AND reset_otp_expiry > NOW()`,
    [email, otp]
  );
  return rows;
};

// Update password
export const updatePasswordAfterResetModel = async (id, hashedPassword) => {
  await db.query(
    `UPDATE users 
     SET password = ?, 
         reset_otp = NULL, 
         reset_otp_expiry = NULL
     WHERE id = ?`,
    [hashedPassword, id]
  );
};

