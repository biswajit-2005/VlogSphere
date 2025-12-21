const mongoose = require("mongoose");

const vlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true }, // Ensure this is the embed link
  category: { type: String, required: true },
  creatorName: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vlog", vlogSchema);
