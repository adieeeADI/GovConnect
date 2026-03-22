const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  _id: Number,
  type: String,

  basicInfo: {
    title: String,
    shortDescription: String,
    providerName: String,
    officialWebsite: String,
    applicationLink: String
  },

  schemeDetails: {
    benefitType: String,
    benefits: [String],
    financialDetails: {
      amount: String,
      currency: String
    },
    mode: String
  },

  eligibility: {
    minimumEducation: String,
    incomeCriteria: {
      minIncome: Number,
      maxIncome: Number
    },
    ageLimit: {
      min: Number,
      max: Number
    },
    gender: String,
    categoryEligible: [String],
    statesEligible: [String],
    occupation: [String],
    specialCriteria: [String]
  },

  applicationProcess: {
    applicationMode: String,
    steps: [String]
  },

  faq: {
    questionsAndAnswers: [
      {
        question: String,
        answer: String
      }
    ]
  },

  documentsRequired: [String],

  importantDates: {
    applicationStart: String,
    applicationEnd: String
  },

  status: String,
  isFeatured: Boolean,

  aiMetadata: {
    tags: [String],
    targetAudience: [String],
    priorityScore: Number
  },

  metadata: {
    viewCount: Number,
    saveCount: Number,
    createdAt: Date,
    updatedAt: Date
  },

  additionalInfo: {
    ministry: String,
    sourceUrl: String,
    exclusions: String,
    faq: String,
    sources: String,
    rawSections: mongoose.Schema.Types.Mixed
  }

}, { timestamps: true });

module.exports = mongoose.model("Scheme", schemeSchema, "schemes");
