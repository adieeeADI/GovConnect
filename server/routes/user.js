const express = require("express");
const User = require("../models/User");
const Internship = require("../models/Internship");
const Scholarship = require("../models/Scholarship");
const Scheme = require("../models/Scheme");
const Training = require("../models/Training");

const router = express.Router();

function isDeadlineExceeded(endDate) {
  if (!endDate) return false;
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return false;
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
}

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
      bookmarksCount: user.bookmarks ? user.bookmarks.length : 0,
      appliedCount: user.applied ? user.applied.length : 0,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===================== USER STATS ===================== */
router.get("/:id/stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Auto-clean any expired bookmarks
    if (user.bookmarks && user.bookmarks.length > 0) {
      const internshipIds = user.bookmarks.map(b => b.internshipId).filter(Boolean);
      const internships = await Internship.find({ _id: { $in: internshipIds } }).lean();
      const internshipMap = new Map();
      internships.forEach(item => internshipMap.set(item._id, item));

      const expiredIds = [];
      user.bookmarks.forEach(bm => {
        const live = internshipMap.get(bm.internshipId);
        const endDate = live?.applicationDetails?.endDate || bm.endDate;
        if (isDeadlineExceeded(endDate)) {
          expiredIds.push(bm.internshipId);
        }
      });

      if (expiredIds.length > 0) {
        user.bookmarks = user.bookmarks.filter(bm => !expiredIds.includes(bm.internshipId));
        await user.save();
      }
    }

    const [iCount, sCount, scCount, tCount] = await Promise.all([
      Internship.countDocuments(),
      Scholarship.countDocuments(),
      Scheme.countDocuments(),
      Training.countDocuments()
    ]);
    const totalOpportunities = iCount + sCount + scCount + tCount;

    res.json({
      recommended: 5,
      opportunities: totalOpportunities,
      applied: user.applied ? user.applied.length : 0,
      bookmarks: user.bookmarks ? user.bookmarks.length : 0
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===================== BOOKMARKED OPPORTUNITIES ===================== */
const modelMap = {
  internships: Internship,
  scholarships: Scholarship,
  schemes: Scheme,
  training: Training,
};

// GET all active bookmarks across 4 categories (auto-deletes any expired bookmarks)
router.get("/:id/bookmarks", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.bookmarks || user.bookmarks.length === 0) {
      return res.json([]);
    }

    // Group bookmarks by category
    const byCategory = {
      internships: [],
      scholarships: [],
      schemes: [],
      training: []
    };

    user.bookmarks.forEach(bm => {
      const cat = (bm.category && modelMap[bm.category]) ? bm.category : 'internships';
      const cleanId = Number(String(bm.opportunityId || bm.internshipId).replace(/^(internships|scholarships|schemes|training)_/, ""));
      if (!isNaN(cleanId) && cleanId > 0) {
        byCategory[cat].push({ bm, cleanId });
      }
    });

    // Fetch documents for each category
    const liveDocMap = new Map(); // key: `${cat}_${cleanId}`
    await Promise.all(
      Object.keys(byCategory).map(async (cat) => {
        const items = byCategory[cat];
        if (items.length === 0) return;
        const ids = items.map(i => i.cleanId);
        const docs = await modelMap[cat].find({ _id: { $in: ids } }).lean();
        docs.forEach(doc => liveDocMap.set(`${cat}_${doc._id}`, doc));
      })
    );

    const expiredBookmarks = [];
    const activeBookmarks = [];

    user.bookmarks.forEach(bm => {
      const cat = (bm.category && modelMap[bm.category]) ? bm.category : 'internships';
      const cleanId = Number(String(bm.opportunityId || bm.internshipId).replace(/^(internships|scholarships|schemes|training)_/, ""));
      const live = liveDocMap.get(`${cat}_${cleanId}`);

      const endDate = live?.applicationDetails?.endDate || bm.endDate;

      if (isDeadlineExceeded(endDate)) {
        expiredBookmarks.push(bm);
      } else {
        const stipend =
          live?.internshipDetails?.stipend ||
          live?.benefits?.scholarshipAmount ||
          live?.schemeDetails?.financialDetails?.amount ||
          live?.trainingDetails?.fee ||
          bm.stipend ||
          '';

        const location =
          live?.internshipDetails?.location ||
          live?.trainingDetails?.location ||
          bm.location ||
          ['India'];

        const duration =
          live?.internshipDetails?.duration ||
          live?.trainingDetails?.duration ||
          bm.duration ||
          '';

        activeBookmarks.push({
          internshipId: cleanId,
          opportunityId: String(cleanId),
          _id: cleanId,
          category: cat,
          title: live?.basicInfo?.title || bm.title,
          providerName: live?.basicInfo?.providerName || bm.providerName,
          location: Array.isArray(location) ? location : [location],
          stipend: stipend,
          duration: duration,
          mode: live?.internshipDetails?.mode || live?.trainingDetails?.mode,
          applicationLink: live?.basicInfo?.applicationLink,
          officialWebsite: live?.basicInfo?.officialWebsite,
          applicationDetails: live?.applicationDetails || { endDate: bm.endDate },
          endDate: endDate,
          bookmarkedAt: bm.bookmarkedAt
        });
      }
    });

    // Auto-delete expired bookmarks from DB!
    if (expiredBookmarks.length > 0) {
      const expiredKeys = new Set(
        expiredBookmarks.map(b => `${b.category || 'internships'}_${b.opportunityId || b.internshipId}`)
      );
      user.bookmarks = user.bookmarks.filter(bm => {
        const key = `${bm.category || 'internships'}_${bm.opportunityId || bm.internshipId}`;
        return !expiredKeys.has(key);
      });
      await user.save();
    }

    res.json(activeBookmarks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST bookmark an opportunity (all 4 categories) - ATOMIC
router.post("/:id/bookmarks", async (req, res) => {
  try {
    const { opportunityId, internshipId, category } = req.body;
    const rawId = opportunityId || internshipId;
    if (!rawId) {
      return res.status(400).json({ message: "Opportunity ID required" });
    }

    const cleanStr = String(rawId).replace(/^(internships|scholarships|schemes|training)_/, "");
    const numId = Number(cleanStr);
    const cat = (category && modelMap[category]) ? category : 'internships';

    const userExists = await User.exists({ _id: req.params.id });
    if (!userExists) return res.status(404).json({ message: "User not found" });

    // Look up in target model first, then fallbacks if not found
    let item = await modelMap[cat].findById(numId).lean();
    let actualCategory = cat;
    if (!item) {
      for (const [c, model] of Object.entries(modelMap)) {
        if (c !== cat) {
          const found = await model.findById(numId).lean();
          if (found) {
            item = found;
            actualCategory = c;
            break;
          }
        }
      }
    }

    if (!item) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const endDate = item.applicationDetails?.endDate;
    if (isDeadlineExceeded(endDate)) {
      return res.status(400).json({
        message: "Cannot bookmark: Application deadline has already passed.",
        expired: true
      });
    }

    const stipend =
      item.internshipDetails?.stipend ||
      item.benefits?.scholarshipAmount ||
      item.schemeDetails?.financialDetails?.amount ||
      item.trainingDetails?.fee ||
      '';

    const location =
      item.internshipDetails?.location ||
      item.trainingDetails?.location ||
      [];

    const bookmarkObj = {
      internshipId: numId,
      opportunityId: String(numId),
      category: actualCategory,
      title: item.basicInfo?.title || "Opportunity",
      providerName: item.basicInfo?.providerName || "",
      location: Array.isArray(location) ? location : [location],
      stipend: stipend,
      duration: item.internshipDetails?.duration || item.trainingDetails?.duration || "",
      endDate: endDate,
      bookmarkedAt: new Date()
    };

    // Atomic push: only add if this item (by ID and category) is not already present
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        $nor: [
          { bookmarks: { $elemMatch: { opportunityId: String(numId), category: actualCategory } } },
          { bookmarks: { $elemMatch: { internshipId: numId, category: actualCategory } } }
        ]
      },
      {
        $push: { bookmarks: bookmarkObj }
      },
      { new: true }
    );

    if (!updatedUser) {
      // Was already bookmarked
      const user = await User.findById(req.params.id);
      return res.json({ message: "Already bookmarked", bookmarks: user?.bookmarks || [] });
    }

    res.json({ message: "Opportunity bookmarked successfully", bookmarks: updatedUser.bookmarks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE a bookmark - ATOMIC
router.delete("/:id/bookmarks/:opportunityId", async (req, res) => {
  try {
    const rawId = String(req.params.opportunityId).replace(/^(internships|scholarships|schemes|training)_/, "");
    const numId = Number(rawId);
    const { category } = req.query;

    const pullCondition = category
      ? {
          $or: [
            { opportunityId: String(numId), category },
            { internshipId: numId, category }
          ]
        }
      : {
          $or: [
            { opportunityId: String(numId) },
            { internshipId: numId }
          ]
        };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { bookmarks: pullCondition }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Bookmark removed successfully", bookmarks: updatedUser.bookmarks || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===================== APPLIED OPPORTUNITIES ===================== */
// GET applied opportunities
router.get("/:id/applied", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.applied || []);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST track applied opportunity
router.post("/:id/applied", async (req, res) => {
  try {
    const { opportunityId, category, title, providerName, location } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ message: "Opportunity ID required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.applied) user.applied = [];

    const existingIndex = user.applied.findIndex(a => String(a.opportunityId) === String(opportunityId));
    if (existingIndex >= 0) {
      return res.json({ message: "Already applied", applied: user.applied });
    }

    user.applied.push({
      opportunityId: String(opportunityId),
      category: category || "internships",
      title: title || "Opportunity",
      providerName: providerName || "",
      location: location || "",
      appliedAt: new Date()
    });

    await user.save();
    res.json({ message: "Application tracked successfully", applied: user.applied });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE applied opportunity
router.delete("/:id/applied/:opportunityId", async (req, res) => {
  try {
    const oppId = String(req.params.opportunityId);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.applied = (user.applied || []).filter(a => String(a.opportunityId) !== oppId);
    await user.save();

    res.json({ message: "Application removed successfully", applied: user.applied });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;