import Vlog from "../models/vlogModel.js";
import User from "../models/userModel.js";

export const getAllVlogs = async (req, res) => {
  try {
    const vlogs = await Vlog.find()
      .populate("creatorId", "name")
      .sort({ uploadDate: -1 });
    res.status(200).send(vlogs);
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.error("Error fetching vlogs:", error);
  }
};

export const getVlogById = async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id).populate(
      "creatorId",
      "name",
    );
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }
    res.status(200).json(vlog);
  } catch (error) {
    console.error("Error fetching vlog:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateLike = async (req, res) => {
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
      { new: true },
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

export const updateDislike = async (req, res) => {
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
      { new: true },
    );

    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    res.status(200).json(vlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to update dislike" });
  }
};
export const createVlog = async (req, res) => {
  try {
    const { title, description, videoUrl, category } = req.body;

    // Server-side validation (Simple check)
    if (!title || !description || !videoUrl || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const vlog = new Vlog({
      creatorId: req.user._id,
      title,
      description,
      videoUrl,
      category,
      uploadDate: req.body.uploadDate || Date.now(),
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
