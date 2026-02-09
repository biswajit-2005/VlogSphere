import express from "express";
const router = express.Router();
import protect from "../middlewares/authMiddlewares.js";
import {
  createVlog,
  getAllVlogs,
  getVlogById,
  updateLike,
  updateDislike,
} from "../controllers/vlogController.js";

router.get("/vlogs", getAllVlogs);

router.get("/vlogs/:id", getVlogById);

router.post("/create", protect, createVlog);

router.post("/vlogs/:id/like", protect, updateLike);

router.post("/vlogs/:id/dislike", protect, updateDislike);

export default router;
