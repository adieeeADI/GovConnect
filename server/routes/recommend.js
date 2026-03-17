const express = require("express");
const router = express.Router();

const user = require("../mock/user");
const rawOpportunities = require("../mock/opportunities");

const { rankOpportunities } = require("../services/geminiService");

router.get("/test", async (req, res) => {
  const opportunities = rawOpportunities.map((item) => ({
    id: item.id || item._id,
    title: item.title,
    type: item.type || "General",
    description: item.description || "",
    eligibility: item.eligibility || "",
    skills: item.skills || [],
  }));

  const ranked = await rankOpportunities(user, opportunities);

  res.json(ranked);
});

module.exports = router;