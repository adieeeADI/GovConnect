const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { cleanRecord } = require("../utils/plainText");

const Scholarship = require("../models/Scholarship");
const DATA_FILE = path.resolve(__dirname, "..", "scraper", "scholarships", "data.json");

function loadScholarships() {
  const scholarships = cleanRecord(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  if (!Array.isArray(scholarships) || scholarships.length === 0) {
    throw new Error("Scholarship data must be a non-empty JSON array.");
  }

  const ids = new Set();
  const urls = new Set();
  for (const [index, scholarship] of scholarships.entries()) {
    if (!scholarship || !Number.isSafeInteger(scholarship._id) || scholarship._id < 1) {
      throw new Error(`Scholarship at index ${index} must have a positive integer _id.`);
    }
    if (ids.has(scholarship._id)) {
      throw new Error(`Duplicate scholarship _id: ${scholarship._id}.`);
    }
    if (!scholarship.basicInfo?.title?.trim()) {
      throw new Error(`Scholarship with _id ${scholarship._id} is missing basicInfo.title.`);
    }
    if (!scholarship.basicInfo?.officialWebsite?.trim()) {
      throw new Error(`Scholarship with _id ${scholarship._id} is missing basicInfo.officialWebsite.`);
    }
    if (urls.has(scholarship.basicInfo.officialWebsite)) {
      throw new Error(`Duplicate scholarship URL: ${scholarship.basicInfo.officialWebsite}.`);
    }
    if (!Array.isArray(scholarship.applicationDetails?.steps)
      || scholarship.applicationDetails.steps.length === 0) {
      throw new Error(`Scholarship with _id ${scholarship._id} has no application steps.`);
    }

    ids.add(scholarship._id);
    urls.add(scholarship.basicInfo.officialWebsite);
  }

  return scholarships;
}

async function main() {
  const scholarships = loadScholarships();
  if (process.argv.includes("--dry-run")) {
    console.log(
      `Validated ${scholarships.length} unique scholarships from ${DATA_FILE}. ` +
      "No database changes made."
    );
    return;
  }

  const mongoURI = process.env.MONGO_URI
    || process.env.MONGODB_URI
    || "mongodb://127.0.0.1:27017/govconnect";
  await mongoose.connect(mongoURI);

  const session = await mongoose.startSession();
  try {
    let deletedCount = 0;
    await session.withTransaction(async () => {
      const deletion = await Scholarship.deleteMany({}, { session });
      deletedCount = deletion.deletedCount;
      await Scholarship.insertMany(scholarships, { session });
    });
    console.log(
      `Replaced the scholarships collection in "${mongoose.connection.name}": ` +
      `deleted ${deletedCount} old records and inserted ${scholarships.length} new records.`
    );
  } finally {
    try {
      await session.endSession();
    } finally {
      await mongoose.disconnect();
    }
  }
}

main().catch(error => {
  console.error("Scholarship import failed:", error.message);
  process.exitCode = 1;
});
