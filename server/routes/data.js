const express = require("express");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");

const router = express.Router();

// GET all internships
router.get("/internships", async (req, res) => {
  try {
    const data = await Internship.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single internship by ID
router.get("/internships/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let data;
    
    // Check if ID is numeric
    if (!isNaN(id)) {
      // Numeric ID - query directly
      data = await Internship.findOne({ _id: Number(id) }).lean();
    } else {
      // Try as ObjectId
      data = await Internship.findById(id).lean();
    }
    
    if (!data) {
      return res.status(404).json({ error: "Internship not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all scholarships
router.get("/scholarships", async (req, res) => {
  try {
    const data = await Scholarship.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single scholarship by ID
router.get("/scholarships/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let data;
    
    // Check if ID is numeric
    if (!isNaN(id)) {
      // Numeric ID - query directly
      data = await Scholarship.findOne({ _id: Number(id) }).lean();
    } else {
      // Try as ObjectId
      data = await Scholarship.findById(id).lean();
    }
    
    if (!data) {
      return res.status(404).json({ error: "Scholarship not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Placeholder routes for schemes and training
router.get("/schemes", async (req, res) => {
  res.json([]);
});

router.get("/schemes/:id", async (req, res) => {
  res.status(404).json({ error: "Not found" });
});

router.get("/training", async (req, res) => {
  res.json([]);
});

router.get("/training/:id", async (req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;