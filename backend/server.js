const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const vlogRoutes = require("./routes/vlogs");

// Load environment variables (connection strings, ports)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Allows your frontend to talk to this server
app.use(express.json()); // Parses incoming JSON requests (req.body)

// --- Database Connection ---
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- Routes ---
// This mounts all routes from vlogs.js under the /api/vlogs prefix
app.use("/api/vlogs", vlogRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("VlogSphere API is running...");
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
