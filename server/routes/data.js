const express = require("express");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");
const Scheme = require("../models/Scheme");
const Training = require("../models/Training");
const { translateOpportunityDetails, translateTexts } = require("../services/translateService");

const router = express.Router();

function getTranslatedText(transMap, text) {
  if (!text || typeof text !== 'string' || !transMap) return text;
  if (transMap[text]) return transMap[text];
  const trimmed = text.trim();
  if (transMap[trimmed]) return transMap[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(transMap)) {
    if (key.trim().toLowerCase() === lower && val) {
      return val;
    }
  }
  return text;
}

async function translateListItems(items, targetLang) {
  if (!items || !items.length || !targetLang || targetLang === "en") return items;
  const texts = [];
  items.forEach(item => {
    if (item.basicInfo?.title) texts.push(item.basicInfo.title);
    if (item.basicInfo?.providerName) texts.push(item.basicInfo.providerName);
    if (item.internshipDetails?.location?.[0]) texts.push(item.internshipDetails.location[0]);
    if (item.internshipDetails?.duration) texts.push(item.internshipDetails.duration);
    if (item.internshipDetails?.stipend) texts.push(item.internshipDetails.stipend);
    if (item.benefits?.scholarshipAmount) texts.push(item.benefits.scholarshipAmount);
    if (item.benefits?.covers?.[0]) texts.push(item.benefits.covers[0]);
    if (item.trainingDetails?.location?.[0]) texts.push(item.trainingDetails.location[0]);
    if (item.trainingDetails?.duration) texts.push(item.trainingDetails.duration);
    if (item.schemeDetails?.benefitType) texts.push(item.schemeDetails.benefitType);
  });
  const transMap = await translateTexts(texts, targetLang);
  return items.map(item => {
    const clone = JSON.parse(JSON.stringify(item));
    if (clone.basicInfo?.title) {
      clone.basicInfo.title = getTranslatedText(transMap, clone.basicInfo.title);
    }
    if (clone.basicInfo?.providerName) {
      clone.basicInfo.providerName = getTranslatedText(transMap, clone.basicInfo.providerName);
    }
    if (clone.internshipDetails?.location?.[0]) {
      clone.internshipDetails.location[0] = getTranslatedText(transMap, clone.internshipDetails.location[0]);
    }
    if (clone.internshipDetails?.duration) {
      clone.internshipDetails.duration = getTranslatedText(transMap, clone.internshipDetails.duration);
    }
    if (clone.internshipDetails?.stipend) {
      clone.internshipDetails.stipend = getTranslatedText(transMap, clone.internshipDetails.stipend);
    }
    if (clone.benefits?.scholarshipAmount) {
      clone.benefits.scholarshipAmount = getTranslatedText(transMap, clone.benefits.scholarshipAmount);
    }
    if (clone.benefits?.covers?.[0]) {
      clone.benefits.covers[0] = getTranslatedText(transMap, clone.benefits.covers[0]);
    }
    if (clone.trainingDetails?.location?.[0]) {
      clone.trainingDetails.location[0] = getTranslatedText(transMap, clone.trainingDetails.location[0]);
    }
    if (clone.trainingDetails?.duration) {
      clone.trainingDetails.duration = getTranslatedText(transMap, clone.trainingDetails.duration);
    }
    if (clone.schemeDetails?.benefitType) {
      clone.schemeDetails.benefitType = getTranslatedText(transMap, clone.schemeDetails.benefitType);
    }
    return clone;
  });
}

// GET all internships
router.get("/internships", async (req, res) => {
  try {
    let data = await Internship.find().lean();
    if (req.query.lang && req.query.lang !== "en") {
      data = await translateListItems(data, req.query.lang);
    }
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
    let data = await Scholarship.find().lean();
    if (req.query.lang && req.query.lang !== "en") {
      data = await translateListItems(data, req.query.lang);
    }
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
    let data = await Scheme.find().lean();
    if (req.query.lang && req.query.lang !== "en") {
      data = await translateListItems(data, req.query.lang);
    }
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
    let data = await Training.find().lean();
    if (req.query.lang && req.query.lang !== "en") {
      data = await translateListItems(data, req.query.lang);
    }
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