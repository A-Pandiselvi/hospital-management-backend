import nodemailer from "nodemailer";

/* ===============================
   Reusable Email Transporter
================================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ===============================
   Common Email Layout Wrapper
================================= */
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" 
       style="max-width:600px; background:#ffffff; border-radius:10px; 
       overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(90deg,#0066ff,#00c6ff); 
           padding:25px; text-align:center;">
  <h2 style="color:#ffffff; margin:0;">
    🏥 Hospital Management System
  </h2>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:30px;">
${content}
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" 
    style="padding:20px; background:#fafafa; font-size:12px; color:#999;">
  © 2026 Hospital Management System <br/>
  This is an automated email. Please do not reply.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

/* ===============================
   1️⃣ Send OTP Email
================================= */
export const sendOtpEmail = async (email, otp) => {
  const content = `
    <h3 style="color:#333;">Email Verification</h3>
    <p style="color:#666;">
      Please use the OTP below to verify your account.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <span style="font-size:32px; font-weight:bold; 
                   letter-spacing:6px; 
                   background:#f0f4ff; 
                   padding:15px 30px; 
                   border-radius:8px; 
                   color:#0066ff;">
        ${otp}
      </span>
    </div>

    <p style="color:#888; font-size:14px;">
      This OTP will expire in <strong>10 minutes</strong>.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Verification Code",
    html: emailTemplate(content),
  });
};

/* ===============================
   2️⃣ Doctor Credentials Email
================================= */
export const sendDoctorCredentials = async (email, name) => {
  const content = `
    <h3>👨‍⚕️ Welcome Dr. ${name}</h3>

    <p>Your doctor account has been created by Admin.</p>

<table width="100%" cellpadding="8" cellspacing="0" 
       style="background:#f8f9fa; border-radius:8px; margin:20px 0;">
  <tr>
    <td><strong>Email:</strong></td>
    <td>${email}</td>
  </tr>
</table>

<p>Please reset your password after login.</p>


    <p>Please login and change your password immediately.</p>

    <div style="text-align:center; margin-top:20px;">
      <a href="http://localhost:5173/login"
         style="background:#28a745; 
                color:#ffffff; 
                padding:12px 25px; 
                text-decoration:none; 
                border-radius:5px;">
        Login Now
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Doctor Account Created",
    html: emailTemplate(content),
  });
};

/* ===============================
   3️⃣ Registration Success Email
================================= */
export const sendRegistrationSuccessEmail = async (email, name) => {
  const content = `
    <h3 style="color:#28a745;">🎉 Welcome ${name}</h3>

    <p>Your account has been successfully verified.</p>

    <div style="text-align:center; margin:25px 0;">
      <a href="http://localhost:5173/login"
         style="background:#007bff; 
                color:#ffffff; 
                padding:12px 25px; 
                text-decoration:none; 
                border-radius:5px;">
        Login to Your Account
      </a>
    </div>

    <p style="color:#666;">
      Thank you for choosing our Hospital Management System.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration Successful",
    html: emailTemplate(content),
  });
};
