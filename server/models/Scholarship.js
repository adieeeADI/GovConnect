const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  _id: Number,
  type: String,

  basicInfo: {
    title: String,
    shortDescription: String,
    providerName: String,
    providerType: String,
    officialWebsite: String,
    applicationLink: String
  },

  benefits: {
    scholarshipAmount: String,
    covers: [String]
  },

  eligibility: {
    educationLevels: [String],
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

  faq: [
    {
      question: String,
      answer: String
    }
  ],

  status: String,
  isFeatured: Boolean,

  metadata: {
    viewCount: Number,
    saveCount: Number
  },

  additionalInfo: {
    selectionProcess: String,
    renewalPolicy: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Scholarship", scholarshipSchema);