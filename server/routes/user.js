const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ===================== GET USER ===================== */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      education: user.education,
      skills: user.skills,
      interests: user.interests,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      state: user.state,
      caste: user.caste,
      religion: user.religion,
      familyIncome: user.familyIncome,
      category: user.category,
      profileCompletePercentage: user.profileCompletePercentage,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===================== COMPLETE / UPDATE PROFILE ===================== */
router.post("/complete-profile", async (req, res) => {
  try {
    const {
      userId, phone, location, education, skills, interests,
      gender, state, caste, religion, familyIncome, category, dateOfBirth,
      fullName
    } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;

    user.gender = gender ?? user.gender;
    user.state = state ?? user.state;
    user.caste = caste ?? user.caste;
    user.religion = religion ?? user.religion;
    user.familyIncome = familyIncome ?? user.familyIncome;
    user.category = category ?? user.category;
    user.dateOfBirth = dateOfBirth ?? user.dateOfBirth;

    const checks = [
      !!user.fullName,
      !!user.email,
      !!user.phone,
      !!user.location,
      !!user.education,
      Array.isArray(user.skills) && user.skills.length > 0,
      Array.isArray(user.interests) && user.interests.length > 0,
      !!user.dateOfBirth,
      !!user.gender,
      !!user.state,
      !!user.caste,
      !!user.religion,
      user.familyIncome !== undefined && user.familyIncome !== null,
      !!user.category,
    ];
    user.profileCompletePercentage = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );

    await user.save();
    res.json({
      message: "Profile updated successfully",
      profileCompletePercentage: user.profileCompletePercentage
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;