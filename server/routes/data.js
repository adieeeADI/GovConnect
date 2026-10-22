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

const STATE_CITY_MAP = {
  'maharashtra': ['nashik', 'mumbai', 'pune', 'nagpur', 'aurangabad', 'thane', 'navi mumbai'],
  'karnataka': ['bangalore', 'bengaluru', 'mysore', 'hubli', 'mangalore'],
  'telangana': ['hyderabad', 'secunderabad', 'warangal'],
  'andhra pradesh': ['guntur', 'visakapatanam', 'visakhapatnam', 'vijayawada', 'tirupati'],
  'delhi': ['delhi', 'new delhi', 'ncr'],
  'uttar pradesh': ['lucknow', 'kanpur', 'noida', 'varanasi', 'agra', 'ghaziabad', 'prayagraj'],
  'tamil nadu': ['chennai', 'coimbatore', 'madurai', 'trichy', 'salem'],
  'gujarat': ['ahmedabad', 'surat', 'vadodara', 'gandhinagar', 'rajkot'],
  'west bengal': ['kolkata', 'howrah', 'durgapur', 'siliguri'],
  'rajasthan': ['jaipur', 'jodhpur', 'udaipur', 'kota'],
  'kerala': ['kochi', 'thiruvananthapuram', 'kozhikode'],
  'madhya pradesh': ['bhopal', 'indore', 'gwalior', 'jabalpur'],
  'punjab': ['chandigarh', 'ludhiana', 'amritsar', 'jalandhar'],
  'haryana': ['gurugram', 'gurgaon', 'faridabad', 'panipat'],
  'bihar': ['patna', 'gaya', 'muzaffarpur'],
  'odisha': ['bhubaneswar', 'cuttack'],
  'assam': ['guwahati', 'silchar'],
  'manipur': ['imphal'],
  'nagaland': ['kohima', 'dimapur'],
};

function filterDataItems(items, query) {
  if (!items || !items.length) return items;
  let result = items;

  if (query.mode) {
    const targetMode = query.mode.toLowerCase();
    if (targetMode === 'online') {
      result = result.filter(item => {
        const modeStr = (item.internshipDetails?.mode || item.programDetails?.mode || item.schemeDetails?.mode || item.trainingDetails?.mode || item.applicationDetails?.applicationMode || item.applicationProcess?.applicationMode || '').toLowerCase();
        const locStr = (item.internshipDetails?.location || item.trainingDetails?.location || []).join(' ').toLowerCase();
        return modeStr.includes('online') || modeStr.includes('virtual') || modeStr.includes('remote') || modeStr.includes('form-only') || locStr.includes('pan india') || locStr.includes('remote');
      });
    } else if (targetMode === 'offline') {
      result = result.filter(item => {
        const modeStr = (item.internshipDetails?.mode || item.programDetails?.mode || item.schemeDetails?.mode || item.trainingDetails?.mode || item.applicationDetails?.applicationMode || item.applicationProcess?.applicationMode || '').toLowerCase();
        const locStr = (item.internshipDetails?.location || item.trainingDetails?.location || []).join(' ').toLowerCase();
        if (modeStr.includes('offline') || modeStr.includes('in-office') || modeStr.includes('classroom') || modeStr.includes('full time')) return true;
        if (locStr && !locStr.includes('remote') && !locStr.includes('pan india') && locStr.trim().length > 0) return true;
        return false;
      });
    }
  }

  if (query.education && query.education.toLowerCase() !== 'all') {
    const edu = query.education.toLowerCase();
    result = result.filter(item => {
      const levels = (item.eligibility?.educationLevels || []).map(l => String(l).toLowerCase());
      const minEdu = String(item.eligibility?.minimumEducation || '').toLowerCase();
      const streams = (item.eligibility?.streamsAllowed || []).map(s => String(s).toLowerCase());
      const allEduStr = [...levels, minEdu, ...streams].join(' ');
      if (!allEduStr.trim()) return true;

      if (edu === '10th') return /class\s*(9|10|1-12|9-12|9 to 12)|10th|matric|secondary|school/.test(allEduStr);
      if (edu === '12th') return /class\s*(11|12|11-12|1-12)|12th|intermediate|senior\s*secondary|higher\s*secondary/.test(allEduStr);
      if (edu === 'diploma') return /diploma|polytechnic|iti/.test(allEduStr);
      if (edu === 'ug') return /\bug\b|undergrad|bachelor|b\.tech|graduate|degree|medical|engineering/.test(allEduStr);
      if (edu === 'pg') return /\bpg\b|postgrad|post-grad|master|ph\.?d/.test(allEduStr);
      return true;
    });
  }

  if (query.state && query.state.toLowerCase() !== 'all') {
    const targetState = query.state.toLowerCase();
    result = result.filter(item => {
      const statesEligible = (item.eligibility?.statesEligible || []).map(s => String(s).toLowerCase());
      const locList = (item.internshipDetails?.location || item.trainingDetails?.location || []).map(l => String(l).toLowerCase());
      const provider = String(item.basicInfo?.providerName || '').toLowerCase();
      const department = String(item.basicInfo?.department || '').toLowerCase();
      const title = String(item.basicInfo?.title || '').toLowerCase();

      if (targetState === 'all india') {
        return statesEligible.includes('all india') || statesEligible.includes('all') || locList.includes('pan india') || statesEligible.length === 0;
      }
      if (statesEligible.some(s => s === targetState || s.includes(targetState))) return true;
      if (provider.includes(targetState) || department.includes(targetState) || title.includes(targetState)) return true;
      const cities = STATE_CITY_MAP[targetState] || [];
      if (locList.some(loc => cities.some(c => loc.includes(c)))) return true;
      if (locList.some(loc => loc.includes(targetState))) return true;
      if (statesEligible.includes('all india') || statesEligible.includes('all') || locList.includes('pan india')) return true;
      return false;
    });
  }

  return result;
}

// GET all internships
router.get("/internships", async (req, res) => {
  try {
    let data = await Internship.find().lean();
    data = filterDataItems(data, req.query);
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
    data = filterDataItems(data, req.query);
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
    data = filterDataItems(data, req.query);
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
    data = filterDataItems(data, req.query);
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

// GET counts and summary stats of opportunities
router.get("/stats", async (req, res) => {
  try {
    const [internships, scholarships, schemes, training] = await Promise.all([
      Internship.countDocuments(),
      Scholarship.countDocuments(),
      Scheme.countDocuments(),
      Training.countDocuments()
    ]);
    const total = internships + scholarships + schemes + training;
    res.json({
      total,
      internships,
      scholarships,
      schemes,
      training
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;