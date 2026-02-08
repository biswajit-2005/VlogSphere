const mongoose = require("mongoose");
const Vlog = require("../models/vlogModel.js");
const getAllVlogs = async (req, res) => {
  try {
    const vlogs = await Vlog.find().sort({ uploadDate: -1 });
    res.status(200).send(vlogs);
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.error("Error fetching vlogs:", error);
  }
};

const getVlogById = async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }
    res.status(200).json(vlog);
  } catch (error) {
    console.error("Error fetching vlog:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateLike = async (req, res) => {
  try {
    const { active } = req.body; //active true if user added like, false if removed or dislike
    let incValue = 0;
    if (active === true) {
      incValue = 1;
    } else {
      incValue = -1;
    }

    const vlog = await Vlog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: incValue } },
      { new: true }
    );

    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    res.status(200).json(vlog);
  } catch (error) {
    console.error("Error updating vlog:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateDislike = async (req, res) => {
  try {
    const { active } = req.body;
    let incValue = 0;
    if (active === true) {
      incValue = 1;
    } else {
      incValue = -1;
    }

    const vlog = await Vlog.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: incValue } },
      { new: true }
    );

    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    res.status(200).json(vlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to update dislike" });
  }
};
const createVlog = async (req, res) => {
  try {
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
      uploadDate: uploadDate || Date.now(),
      likes: 0, // Initialize counts
      dislikes: 0,
    });
    const newVlog = await vlog.save();
    res.status(201).json(newVlog);
  } catch (error) {
    console.error("Error creating vlog:", error);
    res.status(500).json({ message: "cannot create vlog" });
  }
};

module.exports = {
  getAllVlogs,
  getVlogById,
  updateLike,
  updateDislike,
  createVlog,
};
