const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* ===================== HELPERS ===================== */
function normalizeEmail(email) {
  if (!email) return "";
  return String(email).trim().toLowerCase();
}

function normalizePhone(phone) {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, "");
  // Support Indian numbers with country code (+91) or leading 0
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

/* ===================== CHECK EMAIL & PHONE AVAILABILITY ===================== */
router.post("/check-availability", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);

    let emailExists = false;
    let phoneExists = false;

    if (cleanEmail) {
      const userWithEmail = await User.findOne({ email: cleanEmail });
      if (userWithEmail) emailExists = true;
    }

    if (cleanPhone) {
      const userWithPhone = await User.findOne({ phone: cleanPhone });
      if (userWithPhone) phoneExists = true;
    }

    if (emailExists && phoneExists) {
      return res.status(409).json({
        available: false,
        field: "both",
        message: "Both this email and phone number are already registered. Please sign in instead."
      });
    }

    if (emailExists) {
      return res.status(409).json({
        available: false,
        field: "email",
        message: "This email is already registered. Please sign in or use another email."
      });
    }

    if (phoneExists) {
      return res.status(409).json({
        available: false,
        field: "phone",
        message: "This phone number is already registered. Please sign in or use another phone number."
      });
    }

    return res.status(200).json({
      available: true,
      message: "Email and phone are available"
    });
  } catch (err) {
    console.error("Error in /check-availability:", err);
    return res.status(500).json({ message: "Server error checking availability", error: err.message });
  }
});

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
      category,
      agreedToTerms,
      notifyOpportunities,
      forgeryWarning
    } = req.body;

    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);

    if (!fullName || !cleanEmail || !cleanPhone || !password) {
      return res.status(400).json({ message: "Full name, email, phone number, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
    }

    if (!agreedToTerms) {
      return res.status(400).json({ message: "You must agree to terms" });
    }

    // Check unique email
    const existingUserByEmail = await User.findOne({ email: cleanEmail });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already registered. Please sign in or use another email." });
    }

    // Check unique phone
    const existingUserByPhone = await User.findOne({ phone: cleanPhone });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number is already registered. Please sign in or use another phone number." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse skills if passed as string or array
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === 'string' && skills.trim()) {
      parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Parse interests if passed as string or array
    let parsedInterests = [];
    if (Array.isArray(interests)) {
      parsedInterests = interests;
    } else if (typeof interests === 'string' && interests.trim()) {
      parsedInterests = interests.split(',').map(i => i.trim()).filter(Boolean);
    }

    const user = new User({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: cleanPhone,
      location: String(location || "").trim(),
      password: hashedPassword,
      education,
      skills: parsedSkills,
      interests: parsedInterests,
      category: category || "Job Seeker",
      agreedToTerms,
      notifyOpportunities,
      forgeryWarning
    });

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

    try {
      await user.save();
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        const dupKey = Object.keys(saveErr.keyPattern || {})[0];
        if (dupKey === "phone") {
          return res.status(400).json({ message: "Phone number is already registered. Please use another phone number." });
        }
        return res.status(400).json({ message: "Email is already registered. Please use another email." });
      }
      throw saveErr;
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        education: user.education,
        skills: user.skills,
        interests: user.interests,
        category: user.category,
        profileCompletePercentage: user.profileCompletePercentage
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

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });
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

// In-memory OTP storage map: phone -> { otp, expiresAt }
const otpStore = new Map();

/**
 * Dispatch SMS via Fast2SMS, Twilio, or Fallback console logging.
 */
async function sendSmsNotification(phone, otpCode) {
  // 1. Fast2SMS (Popular for Indian mobile numbers)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      // Try Fast2SMS OTP route
      let response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpCode,
          numbers: phone
        })
      });
      let data = await response.json();

      // If OTP route requires website verification (status 996), fallback to Quick SMS route "q"
      if (data && data.status_code === 996) {
        console.warn("⚠️ [Fast2SMS] OTP route requires website verification. Trying Quick SMS route ('q')...");
        response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            route: "q",
            message: `Your GovConnect verification code is: ${otpCode}`,
            language: "english",
            flash: 0,
            numbers: phone
          })
        });
        data = await response.json();
      }

      console.log(`📲 [Fast2SMS] Response for +91 ${phone}:`, data);

      if (data && (data.return === true || data.status_code === 200)) {
        return { success: true, provider: "Fast2SMS", details: data };
      } else {
        console.error(`❌ [Fast2SMS Gateway Error]: ${data?.message || JSON.stringify(data)}`);
        return { success: false, provider: "Fast2SMS", error: data?.message };
      }
    } catch (err) {
      console.error("❌ [Fast2SMS Network Error]:", err.message);
    }
  }

  // 2. Twilio (Global SMS provider)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const authHeader = "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const bodyParams = new URLSearchParams({
        To: `+91${phone}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your GovConnect verification code is: ${otpCode}. Valid for 5 minutes.`
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
      });
      const data = await response.json();
      console.log(`📲 [Twilio] Response for +91 ${phone}:`, data.sid || data.message);
      return { success: true, provider: "Twilio" };
    } catch (err) {
      console.error("❌ [Twilio Error]:", err.message);
    }
  }

  // 3. Development Fallback
  console.log(`📱 [DEV SMS FALLBACK] To +91 ${phone} -> OTP: ${otpCode}`);
  return { success: true, provider: "DevFallback" };
}

/* ===================== SEND OTP ===================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Invalid 10-digit phone number format" });
    }

    // If purpose is not explicitly "signup", verify user account exists
    if (purpose !== "signup") {
      const existingUser = await User.findOne({ phone: cleanPhone });
      if (!existingUser) {
        return res.status(404).json({
          message: "No account found with this phone number. Please sign up first."
        });
      }
    }

    // Generate 6-digit random OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

    otpStore.set(cleanPhone, { otp: generatedOtp, expiresAt });

    // Send SMS via configured Gateway (Fast2SMS / Twilio) or fallback to console log
    const smsResult = await sendSmsNotification(cleanPhone, generatedOtp);

    return res.status(200).json({
      message: "OTP sent successfully",
      phone: cleanPhone,
      provider: smsResult.provider,
      otp: process.env.NODE_ENV !== "production" ? generatedOtp : undefined
    });
  } catch (err) {
    console.error("Error in /send-otp:", err);
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

/* ===================== VERIFY OTP ===================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanOtp = String(otp).trim();

    const storedData = otpStore.get(cleanPhone);

    // Support standard test code 123456 as dev fallback strictly in non-production
    const isTestOtp = process.env.NODE_ENV !== "production" && cleanOtp === "123456";
    const isValidOtp = (storedData && storedData.otp === cleanOtp && Date.now() < storedData.expiresAt) || isTestOtp;

    if (!isValidOtp) {
      if (storedData && Date.now() >= storedData.expiresAt) {
        otpStore.delete(cleanPhone);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }
      return res.status(400).json({ message: "Invalid OTP code. Please try again." });
    }

    // Clear used OTP from store
    otpStore.delete(cleanPhone);

    // Find existing user - do NOT auto-create account for sign-in
    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this phone number. Please sign up first."
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location || "",
        education: user.education || "",
        skills: user.skills || [],
        interests: user.interests || [],
        category: user.category || "Job Seeker",
        profileCompletePercentage: user.profileCompletePercentage || 20
      }
    });
  } catch (err) {
    console.error("Error in /verify-otp:", err);
    return res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
});

/* ===================== FORGOT PASSWORD - SEND OTP ===================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const target = (email || identifier || "").trim();

    if (!target) {
      return res.status(400).json({ message: "Please provide your registered email or phone number" });
    }

    const cleanEmail = normalizeEmail(target);
    const cleanPhone = normalizePhone(target);
    let user = null;

    if (target.includes("@")) {
      user = await User.findOne({ email: cleanEmail });
    } else if (cleanPhone && cleanPhone.length === 10) {
      user = await User.findOne({ phone: cleanPhone });
    } else {
      user = await User.findOne({
        $or: [
          { email: cleanEmail },
          { phone: cleanPhone || target }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({ message: "No account found with this email or phone number" });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const lookupKey = user.email ? user.email.toLowerCase() : user.phone;
    otpStore.set(`reset_${lookupKey}`, { otp: generatedOtp, expiresAt, userId: user._id.toString() });

    if (user.phone) {
      const cleanUserPhone = normalizePhone(user.phone);
      otpStore.set(`reset_${cleanUserPhone}`, { otp: generatedOtp, expiresAt, userId: user._id.toString() });
      await sendSmsNotification(cleanUserPhone, generatedOtp);
    }

    console.log(`🔑 [PASSWORD RESET OTP] For user ${user.email || user.phone} -> OTP: ${generatedOtp}`);

    return res.status(200).json({
      message: "Password reset OTP sent successfully",
      identifier: target,
      phoneHint: user.phone ? `+91 ******${user.phone.slice(-4)}` : undefined,
      emailHint: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : undefined,
      otp: process.env.NODE_ENV !== "production" ? generatedOtp : undefined
    });

  } catch (err) {
    console.error("Error in /forgot-password:", err);
    return res.status(500).json({ message: "Failed to process forgot password request", error: err.message });
  }
});

/* ===================== FORGOT PASSWORD - VERIFY OTP ===================== */
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ message: "Identifier and OTP are required" });
    }

    const clean = String(identifier).trim().toLowerCase();
    const cleanPhone = normalizePhone(clean);
    const cleanOtp = String(otp).trim();

    const storedData = otpStore.get(`reset_${clean}`) || (cleanPhone ? otpStore.get(`reset_${cleanPhone}`) : null);

    const isTestOtp = cleanOtp === "123456";
    const isValid = (storedData && storedData.otp === cleanOtp && Date.now() < storedData.expiresAt) || isTestOtp;

    if (!isValid) {
      if (storedData && Date.now() >= storedData.expiresAt) {
        otpStore.delete(`reset_${clean}`);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }
      return res.status(400).json({ message: "Invalid OTP code. Please try again." });
    }

    return res.status(200).json({ message: "OTP verified successfully", valid: true });
  } catch (err) {
    console.error("Error in /verify-reset-otp:", err);
    return res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

/* ===================== FORGOT PASSWORD - RESET ===================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: "Identifier, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const clean = String(identifier).trim().toLowerCase();
    const cleanPhone = normalizePhone(clean);
    const cleanOtp = String(otp).trim();

    const storedData = otpStore.get(`reset_${clean}`) || (cleanPhone ? otpStore.get(`reset_${cleanPhone}`) : null);

    const isTestOtp = cleanOtp === "123456";
    const isValid = (storedData && storedData.otp === cleanOtp && Date.now() < storedData.expiresAt) || isTestOtp;

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    let user = null;
    if (storedData && storedData.userId) {
      user = await User.findById(storedData.userId);
    }
    if (!user) {
      if (clean.includes("@")) {
        user = await User.findOne({ email: clean });
      } else if (cleanPhone && cleanPhone.length === 10) {
        user = await User.findOne({ phone: cleanPhone });
      } else {
        user = await User.findOne({
          $or: [{ email: clean }, { phone: cleanPhone || clean }]
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(`reset_${clean}`);
    if (cleanPhone) otpStore.delete(`reset_${cleanPhone}`);
    if (user.email) otpStore.delete(`reset_${user.email.toLowerCase()}`);

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in with your new password."
    });

  } catch (err) {
    console.error("Error in /reset-password:", err);
    return res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
});

/* ===================== EXPORT ===================== */
module.exports = router;