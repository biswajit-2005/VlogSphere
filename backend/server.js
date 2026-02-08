const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const vlogRoutes = require("./routes/vlogRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const connectToDb = require("./config/db.js");

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
