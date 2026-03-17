const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
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

  trainingDetails: {
    mode: String,
    location: [String],
    duration: String,
    certificate: String,
    numberOfSeats: Number
  },

  eligibility: {
    educationLevels: [String],
    streamsAllowed: [String],
    minimumPercentage: Number,
    statesEligible: [String],
    ageLimit: {
      min: Number,
      max: Number
    }
  },

  applicationDetails: {
    applicationMode: String,
    startDate: Date,
    endDate: Date,
    documentsRequired: [String],
    selectionProcess: String
  },

  programDetails: {
    about: String,
    curriculum: String,
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

module.exports = mongoose.model("Training", trainingSchema);
