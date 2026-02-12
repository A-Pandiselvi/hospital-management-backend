import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createDoctorModel, createPatientModel, findUserByEmailModel, verifyUserModel,saveResetOtpModel,
findUserByResetOtpModel, updatePasswordAfterResetModel} from "./model.js";
import { sendDoctorCredentials, sendOtpEmail, sendRegistrationSuccessEmail } from "../email/sendEmail.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, password } = req.body;
const email = req.body.email.toLowerCase();

if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}

    const existing = await findUserByEmailModel(email);

    if (existing.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await createPatientModel(
      name,
      email,
      hashedPassword,
      otp,
      otpExpiry
    );
try {
  await sendOtpEmail(email, otp);
} catch (err) {
  console.error("OTP email failed:", err);
}


    res.status(201).json({
      message: "Patient registered. OTP sent to email.",
    });

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

if (user.is_verified) {
  return res.status(400).json({ message: "User already verified" });
}

if (
  String(user.otp) !== String(otp) ||
  new Date(user.otp_expiry) < new Date()
) {
  return res.status(400).json({ message: "Invalid or expired OTP" });
}


    await verifyUserModel(email);
try {
  await sendRegistrationSuccessEmail(email, user.name);
} catch (err) {
  console.error("Success email failed:", err);
}


    res.json({ message: "Email verified successfully" });

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
export const createDoctor = async (req, res) => {
  try {
    const { name, password } = req.body;
const email = req.body.email.toLowerCase();


    const existing = await findUserByEmailModel(email);
    if (existing.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await createDoctorModel(name, email, hashedPassword);

  await sendDoctorCredentials(email, name);


    res.status(201).json({
      message: "Doctor created and email sent successfully",
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

    await saveResetOtpModel(email, otp, expiry);

    await sendOtpEmail(email, otp); // reuse your existing email function

    res.json({ message: "Reset OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
const email = req.body.email.toLowerCase();


    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    const users = await findUserByResetOtpModel(email, otp);

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = users[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePasswordAfterResetModel(user.id, hashedPassword);

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





