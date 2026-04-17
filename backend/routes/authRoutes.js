import express from "express";
import {
  signUp,
  googleLogin,
  verifyUser,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
  resendOtp,
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/me", verifyAccessToken, getMe);

router.post("/signUp", signUp);

router.post("/googleLogin", googleLogin);

router.post("/verifyUser", verifyUser);

router.post("/resendOtp", resendOtp);

router.post("/login", login);

router.get("/refreshToken", refreshToken);

router.post("/logout", logout);

router.post("/forgotPassword", forgotPassword);

router.post("/verifyOtp", verifyOtp);

router.post("/resetPassword", resetPassword);

export default router;
