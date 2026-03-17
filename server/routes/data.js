const express = require("express");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");

const router = express.Router();

// GET internships
router.get("/internships", async (req, res) => {
  try {
    const data = await Internship.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET scholarships
router.get("/scholarships", async (req, res) => {
  try {
    const data = await Scholarship.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;