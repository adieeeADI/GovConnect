const express = require("express");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");

const router = express.Router();

// DEBUG endpoint - show first internship with all fields
router.get("/debug/internship", async (req, res) => {
  try {
    const data = await Internship.findOne().lean();
    if (!data) {
      return res.json({ error: "No data found", count: 0 });
    }
    
    const count = await Internship.countDocuments();
    res.json({
      _idField: data._id,
      hasId: !!data._id,
      idType: data._id ? typeof data._id : null,
      sampleData: {
        title: data.basicInfo?.title,
        id: data._id
      },
      totalDocuments: count,
      allKeys: Object.keys(data)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    let data;
    // First try findById (for MongoDB ObjectIds)
    try {
      data = await Internship.findById(req.params.id).lean();
    } catch (idErr) {
      // If findById fails, try querying by _id directly (for numeric IDs)
      data = await Internship.findOne({ _id: req.params.id }).lean();
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
    let data;
    // First try findById (for MongoDB ObjectIds)
    try {
      data = await Scholarship.findById(req.params.id).lean();
    } catch (idErr) {
      // If findById fails, try querying by _id directly (for numeric IDs)
      data = await Scholarship.findOne({ _id: req.params.id }).lean();
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