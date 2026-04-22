router.post("/complete-profile", async (req, res) => {
  try {
    const {
      userId, phone, location, education, skills, interests,
      gender, state, caste, religion, familyIncome, category, dateOfBirth,
      fullName  // EditProfile also sends this
    } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Basic fields — only overwrite if a value was sent
    if (fullName)     user.fullName     = fullName;
    if (phone)        user.phone        = phone;
    if (location)     user.location     = location;
    if (education)    user.education    = education;
    if (skills)       user.skills       = skills;
    if (interests)    user.interests    = interests;

    // Eligibility fields — always overwrite (allows clearing)
    user.gender       = gender       ?? user.gender;
    user.state        = state        ?? user.state;
    user.caste        = caste        ?? user.caste;
    user.religion     = religion     ?? user.religion;
    user.familyIncome = familyIncome ?? user.familyIncome;
    user.category     = category     ?? user.category;
    user.dateOfBirth  = dateOfBirth  ?? user.dateOfBirth;

    // Recalculate using the same 14-field logic as the frontend
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
      !!user.familyIncome,
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