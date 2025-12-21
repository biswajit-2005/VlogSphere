const express = require("express");
const router = express.Router();
const Vlog = require("../models/vlog");

// GET all vlogs
router.get("/", async (req, res) => {
  try {
    const vlogs = await Vlog.find().sort({ createdAt: -1 });
    res.json(vlogs);
  } catch (err) {
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

module.exports = router;
