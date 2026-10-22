const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: String,

  // Basic
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  profileCompletePercentage: { type: Number, default: 20 },

  // Bookmarked Opportunities
  bookmarks: [{
    internshipId: Number,
    opportunityId: String,
    category: { type: String, default: 'internships' },
    title: String,
    providerName: String,
    location: [String],
    stipend: String,
    duration: String,
    endDate: Date,
    bookmarkedAt: { type: Date, default: Date.now }
  }],

  // Applied Opportunities
  applied: [{
    opportunityId: String,
    category: String,
    title: String,
    providerName: String,
    location: String,
    appliedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);