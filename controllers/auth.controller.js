import { JWT_EXPIRES_IN, JWT_SECRET } from "../configs/env.js";
import { pool, sql } from "../database/SQL.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendForgotPassEmail } from "../utils/sendEmail.js";

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ---------------------- SIGN UP ----------------------
export const SignUp = async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const poolConn = await pool.connect();

    const existUser = await poolConn
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email")
      .execute("sp_fetchUserByEMAIL");

    if (existUser.recordset.length > 0) {
      return res.status(400).json({ message: "User already exists. Please sign in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await poolConn
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input("avatar", sql.VarChar, picture || null)
      .execute("sp_SignUpUser");

    const newUserId = result.recordset[0].id;
    const token = generateToken(newUserId);

    res.status(201).json({
      message: "User created successfully",
      data: { id: newUserId, name, email, token },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- SIGN IN ----------------------
export const SignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .execute("sp_SignInUser");

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: "User does not exist. Please sign up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(user.id);

    res.status(200).json({
      message: "Sign-in successful",
      data: { id: user.id, name: user.name, email: user.email, token },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- GET FORGOT PASSWORD ----------------------
export const getForgotPass = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .execute("sp_fetchUserByEMAIL");

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: "User does not exist. Please sign up." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool
      .request()
      .input("resetPassToken", sql.VarChar, token)
      .input("resetPassExpire", sql.DateTime, resetExpire)
      .input("email", sql.VarChar, email)
      .execute("sp_SetForgotPasswordToken");

    await sendForgotPassEmail(email, token);

    res.status(200).json({
      message: "Reset password email sent",
      userData: {
        name: user.name,
        email: user.email,
        resetPassExpire: resetExpire,
        resetPassToken: token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- RESET PASSWORD ----------------------
export const ForgotPassword = async (req, res) => {
  const token = req.params.id;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Valid password is required (min 6 chars)" });
  }

  try {
    const result = await pool
      .request()
      .input("resetPassToken", sql.VarChar, token)
      .execute("sp_fetchResetPassToken");

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("password", sql.VarChar, hashedPassword)
      .input("resetPassToken", sql.VarChar, token)
      .execute("sp_ResetPassword");

    res.status(200).json({ message: "Password reset successful", data: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
