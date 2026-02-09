import mongoose from "mongoose";
import vlog from "./vlogModel.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  providerId: {
    type: String,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  vlogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vlog",
    },
  ],
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
