const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddlewares.js");
const {
  createVlog,
  getAllVlogs,
  getVlogById,
  updateLike,
  updateDislike,
} = require("../controllers/vlogController.js");

router.get("/vlogs", getAllVlogs);

router.get("/vlogs/:id", getVlogById);

router.post("/create", protect, createVlog);

router.post("/vlogs/:id/like", protect, updateLike);

router.post("/vlogs/:id/dislike", protect, updateDislike);

module.exports = router;
