const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,

  // Basic
  phone: String,
  location: String,
  state: String,
  age: Number,
  gender: String,
  dateOfBirth: Date,  // add this line to userSchema
  
  // Recommendation Fields
  education: String,
  skills: [String],
  interests: [String],
  occupation: String,
  category: String, // Student, Job Seeker, Farmer

  // Govt Eligibility
  caste: String,
  religion: String,
  familyIncome: Number,
  minority: Boolean,
  disability: Boolean,

  // Preferences
  notifyOpportunities: Boolean,

  // Profile completion
  profileCompletePercentage: { type: Number, default: 20 }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);