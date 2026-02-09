import mongoose from "mongoose";

const vlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true }, // Ensure this is the embed link
  category: { type: String, required: true },
  // creatorName: { type: String, required: true },
  creatorName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  uploadDate: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

const vlog = mongoose.model("Vlog", vlogSchema);
export default vlog;
