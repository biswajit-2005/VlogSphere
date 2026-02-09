import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vlogRoutes from "./routes/vlogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import connectToDb from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", vlogRoutes);

app.get("/health", (req, res) => {
  res.send("Backend OK");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToDb();
});
