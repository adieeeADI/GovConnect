const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  location: String,
  password: String,
  education: String,
  skills: String,
  interests: [String],
  agreedToTerms: Boolean,
  notifyOpportunities: Boolean,
  forgeryWarning: Boolean
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
