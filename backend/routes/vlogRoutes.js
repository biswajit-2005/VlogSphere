const express = require("express");
const router = express.Router();
const {
  createVlog,
  getAllVlogs,
  updateLike,
  updateDislike,
} = require("../controllers/vlogController.js");

router.get("/vlogs", getAllVlogs);

router.post("/create", createVlog);

router.post("/vlogs/:id/like", updateLike);

router.post("/vlogs/:id/dislike", updateDislike);

module.exports = router;
