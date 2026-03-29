import express from "express";
import {
  signUp,
  googleLogin,
  verifyUser,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);

router.post("/signUp", signUp);

router.post("/googleLogin", googleLogin);

router.post("/verifyUser", verifyUser);

router.post("/login", login);

router.get("/refreshToken", refreshToken);

router.post("/logout", logout);

router.post("/forgotPassword", forgotPassword);

router.post("/resetPassword", resetPassword);

export default router;
