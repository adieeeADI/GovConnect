const express = require("express");
const User = require("../models/User");

const router = express.Router();

function normalizePhone(phone) {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

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

    if (fullName !== undefined) user.fullName = String(fullName).trim();
    if (phone !== undefined) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone && cleanPhone !== user.phone) {
        if (cleanPhone.length !== 10) {
          return res.status(400).json({ message: "Please provide a valid 10-digit mobile number" });
        }
        const existing = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ message: "This phone number is already registered to another account" });
        }
        user.phone = cleanPhone;
      }
    }
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;

    // Handle skills array / string parsing
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Handle interests array / string parsing
    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        user.interests = interests;
      } else if (typeof interests === 'string') {
        user.interests = interests.split(',').map(i => i.trim()).filter(Boolean);
      }
    }

    if (gender !== undefined) user.gender = gender;
    if (state !== undefined) user.state = state;
    if (caste !== undefined) user.caste = caste;
    if (religion !== undefined) user.religion = religion;
    if (category !== undefined) user.category = category;

    if (familyIncome !== undefined && familyIncome !== null) {
      user.familyIncome = Number(familyIncome) || 0;
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth) {
        const parsedDate = new Date(dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          user.dateOfBirth = parsedDate;
        }
      } else {
        user.dateOfBirth = undefined;
      }
    }

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
      profileCompletePercentage: user.profileCompletePercentage,
      user: {
        id: user._id.toString(),
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
      }
    });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

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

module.exports = router;