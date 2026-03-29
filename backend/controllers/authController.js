import User from "../models/userModel.js";
import Otp from "../models/otpModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { sendEmail } from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto"; //for forget password

export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const userexist = await User.findOne({ email });
    if (userexist) {
      return res.status(400).json({ message: "user already exist" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });
    //send mail with OTP , store otp in another unverified collection , and after verification move the user to main collection
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      userId: user._id,
      email,
      otp: otpCode,
      expiresIn: new Date(Date.now() + 5 * 60 * 1000), //5 minutes
    });
    await sendEmail(user.email, otpCode);
    console.log(otpCode);
    console.log(user._id);

    res.status(200).json({
      message: "user created successfully , Verify your mail with OTP.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user does not exist" });
    }
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(400).json({ message: "password not match" });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        message: "user is not verified, check your email and verify.",
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    //test
    console.log("Accesstoken in terminal", accessToken);
    console.log("Refreshtoken in terminal", refreshToken);

    //save refresh token in db
    user.refreshToken = refreshToken;
    await user.save();
    //send access and refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({
      message: "user logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    let email, name, googleId;

    // If client sends an idToken (recommended), verify it with Google
    if (req.body.idToken) {
      const idToken = req.body.idToken;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name || payload.email.split("@")[0];
      googleId = payload.sub;
    } else {
      // fallback to older behavior
      ({ email, name, googleId } = req.body);
      if (!email || !name || !googleId) {
        return res.status(400).json({ message: "all fields are required" });
      }
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        provider: "google",
        providerId: googleId,
        role: "user",
        isVerified: true,
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    //save refresh token in db
    user.refreshToken = refreshToken;
    await user.save();
    //send access and refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({
      message: "user logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Google Login failed" });
  }
};
export const verifyUser = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    if (!userId || !otpCode) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "user already verified" });
    }

    //match with otp code
    const otp = await Otp.findOne({
      userId,
      otp: otpCode,
      expiresIn: { $gt: Date.now() },
    }); //check if otp is valid and not expired
    if (!otp) {
      return res.status(400).json({ message: "invalid or expired otp" });
    }
    user.isVerified = true;
    await user.save();
    res
      .status(200)
      .json({ message: "user verified successfully.You can now Login" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message:
        "Invalid or expired token. Please register/request a new verification email.",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "user already verified" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.deleteMany({ userId: user._id });

    await Otp.create({
      userId: user._id,
      email,
      otp: otpCode,
      expiresIn: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendEmail(user.email, otpCode);

    res.status(200).json({
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token Missing." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ message: "user not found or invalid refresh token." });
    }

    //generate new access token
    const accessToken = generateAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ message: "Token refreshed successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Invalid or expired refresh token. Please Login" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(200).json({
        message: "user logged out successfully,but token already missing",
      });
    }

    const user = await User.findOne({ refreshToken });
    user.refreshToken = null;
    await user.save();
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.status(200).json({ message: "user logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Logout failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `http://localhost:3000/resetPassword/${resetToken}`;
    await sendEmail(user.email, resetUrl);

    res
      .status(200)
      .json({ message: `Password reset link sent to ${user.email}` });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Password reset failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetPasswordToken, password } = req.body;
    if (!resetPasswordToken || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or token expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Password reset failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get user details" });
  }
};
