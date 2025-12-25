const express = require("express");
const router = express.Router();
// const Vlog = require("../models/vlog");
const Vlog = require("../models/MOCK_DATA (1).json");

// GET all vlogs
router.get("/", async (req, res) => {
  try {
    // const vlogs = await Vlog.find().sort({ createdAt: -1 });
    // res.json(vlogs);
    res.json(Vlog);
  } catch (err) {
    console.error("error in connecting mongodb or fethching data.");
    res.status(500).json({ message: err.message });
  }
});

// POST update like
router.post("/:id/like", async (req, res) => {
  const { active } = req.body; // active is true if user added like, false if removed
  try {
    const update = active ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } };
    const vlog = await Vlog.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    console.log("liked");
    res.json(vlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST update dislike
router.post("/:id/dislike", async (req, res) => {
  const { active } = req.body;
  try {
    const update = active
      ? { $inc: { dislikes: 1 } }
      : { $inc: { dislikes: -1 } };
    const vlog = await Vlog.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(vlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST: Create a new vlog
router.post("/", async (req, res) => {
  const { creatorName, title, description, videoUrl, category, uploadDate } =
    req.body;

  // Server-side validation (Simple check)
  if (!creatorName || !title || !description || !videoUrl || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const vlog = new Vlog({
    creatorName,
    title,
    description,
    videoUrl,
    category,
    uploadDate: uploadDate || new Date(),
    likes: 0, // Initialize counts
    dislikes: 0,
  });

  try {
    const newVlog = await vlog.save();
    res.status(201).json(newVlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
