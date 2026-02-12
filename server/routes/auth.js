const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
