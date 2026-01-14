const express = require("express");
const dotenv = require("dotenv");
const vlogRoutes = require("./routes/vlogRoutes.js");
const connectToDb = require("./config/db.js");

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api", vlogRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToDb();
});
