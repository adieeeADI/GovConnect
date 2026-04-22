const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      password,
      education,
      skills,
      interests,
      agreedToTerms,
      notifyOpportunities,
      forgeryWarning
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!agreedToTerms) {
      return res.status(400).json({ message: "You must agree to terms" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      phone,
      location,
      password: hashedPassword,
      education,
      skills,
      interests,
      agreedToTerms,
      notifyOpportunities,
      forgeryWarning
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        education: user.education,
        skills: user.skills,
        interests: user.interests
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ===================== GET USER ===================== */
router.get("/user/:id", async (req, res) => {
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
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== COMPLETE PROFILE ===================== */
router.post("/complete-profile", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      location,
      education,
      skills,
      interests,
      gender,
      state,
      caste,
      religion,
      familyIncome,
      category,
      dateOfBirth
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Safe updates (allow empty values)
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

    // ✅ Completion calculation (fixed income bug)
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
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ===================== EXPORT ===================== */
module.exports = router;