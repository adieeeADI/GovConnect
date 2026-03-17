const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  _id: Number,
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

  schemeDetails: {
    mode: String,
    location: [String],
    coverage: String,
    benefits: String,
    numberOfSeats: Number
  },

  eligibility: {
    educationLevels: [String],
    streamsAllowed: [String],
    minimumPercentage: Number,
    categoryEligible: [String],
    genderEligible: [String],
    incomeLimit: Number,
    statesEligible: [String],
    ageLimit: {
      min: Number,
      max: Number
    },
    isPwDEligible: Boolean,
    isMinorityEligible: Boolean
  },

  applicationDetails: {
    applicationMode: String,
    startDate: Date,
    endDate: Date,
    documentsRequired: [String]
  },

  programDetails: {
    about: String,
    benefits: String,
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

module.exports = mongoose.model("Scheme", schemeSchema);
