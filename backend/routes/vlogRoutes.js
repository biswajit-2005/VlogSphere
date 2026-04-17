import express from "express";
const router = express.Router();
import protect from "../middlewares/authMiddlewares.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";
import {
  createVlog,
  getAllVlogs,
  getVlogById,
  updateLike,
  updateDislike,
} from "../controllers/vlogController.js";

router.get("/vlogs", getAllVlogs);

router.get("/vlogs/:id", getVlogById);

router.post("/create", verifyAccessToken, createVlog);

router.post("/vlogs/:id/like", verifyAccessToken, updateLike);

router.post("/vlogs/:id/dislike", verifyAccessToken, updateDislike);

export default router;
