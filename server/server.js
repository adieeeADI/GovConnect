require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/data", require("./routes/data"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/recommend", require("./routes/recommend"));

// Test route
app.get("/", (req, res) => {
  res.send("GovConnect API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});