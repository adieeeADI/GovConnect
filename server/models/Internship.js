const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  type: String,

  basicInfo: {
    title: String,
    shortDescription: String,
    department: String,
    providerName: String,
    officialWebsite: String,
    applicationLink: String,
    logo: String
  },

  internshipDetails: {
    mode: String,
    location: [String],
    duration: String,
    stipend: String,
    numberOfSeats: Number
  },

  eligibility: {
    educationLevels: [String],
    streamsAllowed: [String],
    yearOfStudyAllowed: [String],
    minimumCGPA: Number,
    statesEligible: [String],
    ageLimit: {
      min: Number,
      max: Number
    }
  },

  applicationDetails: {
    startDate: Date,
    endDate: Date,
    selectionProcess: String
  },

  programDetails: {
    about: String,
    perks: String,
    whoCanApply: String,
    terms: String
  },

  status: String,
  isFeatured: Boolean,

  metadata: {
    viewCount: Number,
    saveCount: Number,
    source: String,
    lastScrapedAt: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Internship", internshipSchema);