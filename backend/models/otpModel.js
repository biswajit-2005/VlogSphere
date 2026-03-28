import mongoose from "mongoose";

const otp = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
});

const Otp = mongoose.model("Otp", otp);
export default Otp;
