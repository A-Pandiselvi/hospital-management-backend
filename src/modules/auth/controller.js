import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createDoctorModel, createPatientModel, findUserByEmailModel, verifyUserModel,saveResetOtpModel,
findUserByResetOtpModel, updatePasswordAfterResetModel} from "./model.js";
import { sendDoctorCredentials, sendOtpEmail, sendRegistrationSuccessEmail } from "../email/sendEmail.js";
import db from "../../config/db.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await findUserByEmailModel(email);

    // STEP 1 — EMAIL ONLY (OTP)
    if (!name && !password) {

      if (existing.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
console.log('otp sent',otp)
      await db.query(
        `INSERT INTO users (email, otp, otp_expiry, role)
         VALUES (?, ?, ?, ?)`,
        [email, otp, otpExpiry, "patient"]
      );

      await sendOtpEmail(email, otp);

      return res.json({ message: "OTP sent to email" });
    }

    // STEP 3 — COMPLETE REGISTRATION
    else if (name && password) {

      if (existing.length === 0) {
        return res.status(400).json({ message: "Verify email first" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users
         SET name=?, password=?
         WHERE email=?`,
        [name, hashedPassword, email]
      );

      return res.status(201).json({
        message: "Registration completed successfully"
      });
    }

    else {
      return res.status(400).json({ message: "Invalid request" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.body.email.toLowerCase();

    const users = await findUserByEmailModel(email);

    if (users.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = users[0];

    // already verified
    if (user.is_verified)
      return res.status(400).json({ message: "User already verified" });

    // OTP validation
    if (
      String(user.otp) !== String(otp) ||
      new Date(user.otp_expiry) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 1️⃣ mark user verified
    await verifyUserModel(email);

    // 2️⃣ create patient profile automatically
    await db.query(
      `INSERT INTO patients (user_id)
       VALUES (?)`,
      [user.id]
    );

    // 3️⃣ send success email
    try {
      await sendRegistrationSuccessEmail(email, user.name);
    } catch (err) {
      console.error("Success email failed:", err);
    }

    res.json({ message: "Email verified & patient profile created" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// LOGIN
export const login = async (req, res) => {
  try {
  const { password } = req.body;
const email = req.body.email.toLowerCase();

if (!email || !password) {
  return res.status(400).json({ message: "Email and password are required" });
}

    const users = await findUserByEmailModel(email);

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];

    if (!user.is_verified)
      return res.status(400).json({ message: "Please verify email first" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN CREATE DOCTOR
// ADMIN INVITE DOCTOR
export const createDoctor = async (req, res) => {
  try {
    const { name, email, specialization, experience, consultation_fee, availability } = req.body;

    const lowerEmail = email.toLowerCase();

    const existing = await findUserByEmailModel(lowerEmail);
    if (existing.length > 0)
      return res.status(400).json({ message: "Doctor already invited" });

    await createDoctorModel(
      name,
      lowerEmail,
      specialization,
      experience,
      consultation_fee,
      availability
    );

    res.status(201).json({
      message: "Doctor invited. Ask doctor to register using same email."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const forgotPassword = async (req, res) => {
  try {
const email = req.body.email.toLowerCase();

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const users = await findUserByEmailModel(email);

    if (users.length === 0)
      return res.status(400).json({ message: "Email not registered" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
console.log("📧 forget Register OTP:", email, otp);
    await saveResetOtpModel(email, otp, expiry);

    await sendOtpEmail(email, otp); // reuse your existing email function

    res.json({ message: "Reset OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "All fields required" });

    const users = await findUserByResetOtpModel(email.toLowerCase(), otp);

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const users = await findUserByResetOtpModel(
      email.toLowerCase(),
      otp
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePasswordAfterResetModel(users[0].id, hashedPassword);

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const users = await findUserByEmailModel(email);

    if (users.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = users[0];

    // already verified
    if (user.is_verified)
      return res.status(400).json({ message: "Email already verified" });

    // generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
console.log("📧resent OTP:", email, otp);
    // update DB
    await db.query(
      `UPDATE users SET otp=?, otp_expiry=? WHERE email=?`,
      [otp, otpExpiry, email]
    );

    // send email
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP resent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resendResetOtp = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const users = await findUserByEmailModel(email);

    if (users.length === 0)
      return res.status(400).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log("📧 Reset OTP Resent:", email, otp);

    await saveResetOtpModel(email, otp, expiry);

    await sendOtpEmail(email, otp);

    res.json({ message: "Reset OTP resent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







