import { JWT_EXPIRES_IN, JWT_SECRET } from "../configs/env.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendForgotPassEmail } from "../utils/sendEmail.js";

export const SignUp = async (req, res, next) => {
  try {
    const { name, email, password, picture } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please Sign In" });
    }

    const user = await User.create({ name, email, password, avatar: picture });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res
      .status(201)
      .json({
        message: "User created successfully",
        data: {
          name: user.name,
          email: user.email,
          id: user._id,
          token: token,
        },
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const SignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUser = await User.findOne({ email: email });
    if (!isUser) {
      return res
        .status(400)
        .json({ message: "User does not exist. Please Sign Up" });
    }

    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ userId: isUser._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res
      .status(200)
      .json({
        message: "Sign In successful",
        data: {
          name: isUser.name,
          email: isUser.email,
          id: isUser._id,
          token: token,
        },
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getForgotPass = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const isUser = await User.findOne({ email: email });

    if (!isUser) {
      return res
        .status(400)
        .json({ message: "User does not exist. Please Sign Up" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    await sendForgotPassEmail(email, token);

    isUser.resetPassToken = token;
    isUser.resetPassExpire = Date.now() + 60 * 10000;

    await isUser.save();

    res
      .status(200)
      .json({
        message: "Reset Password Token sent to your email",
        userData: {
          name: isUser.name,
          email: isUser.email,
          resetPassExpire: isUser.resetPassExpire,
          resetPassToken: isUser.resetPassToken,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const ForgotPassword = async (req, res, next) => {
  try {
    const token = req.params.id;
    const { password } = req.body;

    const isUser = await User.findOne({
      resetPassToken: token,
      resetPassExpire: { $gt: Date.now() },
    });

    if (!isUser) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    isUser.password = password;
    isUser.resetPassToken = undefined;
    isUser.resetPassExpire = undefined;
    await isUser.save();

    res
      .status(200)
      .json({
        message: "Password reset successful",
        data: { name: isUser.name, email: isUser.email },
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
