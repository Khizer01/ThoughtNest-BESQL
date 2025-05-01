import nodemailer from "nodemailer";
import { FRONTEND_URL, SMTP_EMAIL, SMTP_PASSWORD } from "../configs/env.js";
import { resetPasswordEmail } from "./Template/resetPassword.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

export const sendForgotPassEmail = async (email, token) => {
  const resetPasswordLink = `${FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: SMTP_EMAIL,
    to: email,
    subject: "Reset Password Request",
    html: resetPasswordEmail(resetPasswordLink),
  };

  await transporter.sendMail(mailOptions);
};
