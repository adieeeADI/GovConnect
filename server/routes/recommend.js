const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");
const Training = require("../models/Training");
const Scheme = require("../models/Scheme");

const { rankOpportunities } = require("../services/geminiService");

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("🔍 RECOMMEND REQUEST - userId:", userId);
    console.log("🔍 userId type:", typeof userId);
    
    const user = await User.findById(userId);
    
    console.log("🔍 Found user:", user ? "YES" : "NO");
    if (user) {
      console.log("🔍 User details:", {
        name: user.name,
        skills: user.skills,
        interests: user.interests,
        education: user.education
      });
    }

    if (!user) {
      console.log("❌ User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const internships = await Internship.find().limit(10);
    const scholarships = await Scholarship.find().limit(10);
    const trainings = await Training.find().limit(10);
    const schemes = await Scheme.find().limit(10);

    console.log("Internships:", internships.length);
    console.log("Scholarships:", scholarships.length);
    console.log("Trainings:", trainings.length);
    console.log("Schemes:", schemes.length);

    // ✅ Prefix IDs with category to avoid overlap across collections
    // All collections use numeric _id starting from 1, so "2" exists in every collection
    // Without prefix, opportunityMap["2"] gets overwritten 4 times — last one (schemes) wins
    const opportunities = [
      ...internships.map(i => ({
        id: `internships_${i._id.toString()}`,
        title: i.basicInfo?.title || "",
        organization: i.basicInfo?.providerName || "Gov",
        location: i.internshipDetails?.location?.[0] || "India",
        category: "internships"
      })),
      ...scholarships.map(s => ({
        id: `scholarships_${s._id.toString()}`,
        title: s.basicInfo?.title || "",
        organization: s.basicInfo?.providerName || "Gov",
        location: "India",
        category: "scholarships"
      })),
      ...trainings.map(t => ({
        id: `training_${t._id.toString()}`,
        title: t.basicInfo?.title || "",
        organization: t.basicInfo?.providerName || "Gov",
        location: t.trainingDetails?.location?.[0] || "Online",
        category: "training"
      })),
      ...schemes.map(sc => ({
        id: `schemes_${sc._id.toString()}`,
        title: sc.basicInfo?.title || "",
        organization: sc.basicInfo?.providerName || "Gov",
        location: "India",
        category: "schemes"
      }))
    ];

    // Map for fast lookup — now all keys are globally unique
    const opportunityMap = {};
    opportunities.forEach(op => {
      opportunityMap[op.id] = op;
    });

    // AI ranking
    const aiResult = await rankOpportunities(user, opportunities);
    console.log("AI raw recommendations:", JSON.stringify(aiResult.recommendations, null, 2));

    let recommendations = aiResult.recommendations
      .filter(rec => opportunityMap[rec.id])
      .map(rec => ({
        ...opportunityMap[rec.id],
        match: rec.matchScore,
        reason: rec.reason
      }));

    // Remove duplicates
    const uniqueMap = {};
    recommendations.forEach(item => {
      if (!uniqueMap[item.id]) uniqueMap[item.id] = item;
    });
    recommendations = Object.values(uniqueMap);

    // Sort by match score
    recommendations.sort((a, b) => b.match - a.match);

    res.json(recommendations);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;