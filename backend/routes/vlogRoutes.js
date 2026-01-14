const express = require("express");
const router = express.Router();
const {
  createVlog,
  getAllVlogs,
  updateLike,
  updateDislike,
} = require("../controllers/vlogController.js");

router.get("/vlogs", getAllVlogs);

router.post("/:id/like", updateLike);

router.post("/:id/dislike", updateDislike);

router.post("/create", createVlog);

module.exports = router;
