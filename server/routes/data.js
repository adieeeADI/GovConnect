const express = require("express");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");
const Scheme = require("../models/Scheme");
const Training = require("../models/Training");
const { translateOpportunityDetails } = require("../services/translateService");

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
    const rawId = req.params.id.replace(/^(internships|scholarships|schemes|training)_/, "");
    const id = isNaN(rawId) ? rawId : Number(rawId);
    
    let data = await Internship.findById(id).lean();
    
    if (!data) {
      return res.status(404).json({ error: "Internship not found" });
    }

    if (req.query.lang && req.query.lang !== "en") {
      data = await translateOpportunityDetails(data, req.query.lang);
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
    const rawId = req.params.id.replace(/^(internships|scholarships|schemes|training)_/, "");
    const id = isNaN(rawId) ? rawId : Number(rawId);
    
    let data = await Scholarship.findById(id).lean();
    
    if (!data) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    if (req.query.lang && req.query.lang !== "en") {
      data = await translateOpportunityDetails(data, req.query.lang);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all schemes
router.get("/schemes", async (req, res) => {
  try {
    const data = await Scheme.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single scheme by ID
router.get("/schemes/:id", async (req, res) => {
  try {
    const rawId = req.params.id.replace(/^(internships|scholarships|schemes|training)_/, "");
    const id = isNaN(rawId) ? rawId : Number(rawId);
    
    let data = await Scheme.findById(id).lean();
    
    if (!data) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    if (req.query.lang && req.query.lang !== "en") {
      data = await translateOpportunityDetails(data, req.query.lang);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all training
router.get("/training", async (req, res) => {
  try {
    const data = await Training.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single training by ID
router.get("/training/:id", async (req, res) => {
  try {
    const rawId = req.params.id.replace(/^(internships|scholarships|schemes|training)_/, "");
    const id = isNaN(rawId) ? rawId : Number(rawId);
    
    let data = await Training.findById(id).lean();
    
    if (!data) {
      return res.status(404).json({ error: "Training not found" });
    }

    if (req.query.lang && req.query.lang !== "en") {
      data = await translateOpportunityDetails(data, req.query.lang);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;