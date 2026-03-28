import express from "express";
const router = express.Router();
import protect from "../middlewares/authMiddlewares.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createVlog,
  getAllVlogs,
  getVlogById,
  updateLike,
  updateDislike,
} from "../controllers/vlogController.js";

router.get("/vlogs", getAllVlogs);

router.get("/vlogs/:id", getVlogById);

router.post("/create", verifyToken, createVlog);

router.post("/vlogs/:id/like", verifyToken, updateLike);

router.post("/vlogs/:id/dislike", verifyToken, updateDislike);

export default router;
