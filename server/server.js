require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/data", require("./routes/data"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/recommend", require("./routes/recommend"));
app.use("/api/user", require("./routes/user"));
app.use("/api/resume", require("./routes/resume"));

// Test route
app.get("/", (req, res) => {
  res.send("GovConnect API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access from network at: http://0.0.0.0:${PORT}`);
});