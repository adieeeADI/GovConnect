const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { cleanRecord } = require("../utils/plainText");

const Training = require("../models/Training");
const DATA_FILE = path.resolve(__dirname, "..", "scraper", "training_certification", "data.json");
const EXPECTED_COUNT = 100;
const OFFICIAL_HOSTS = [
  "swayam.gov.in",
  "swayam2.ac.in",
  "nptel.ac.in"
];

function isOfficialCourseUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && OFFICIAL_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function loadTrainingCourses() {
  const courses = cleanRecord(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  if (!Array.isArray(courses) || courses.length !== EXPECTED_COUNT) {
    throw new Error(`Training data must contain exactly ${EXPECTED_COUNT} records.`);
  }

  const ids = new Set();
  const urls = new Set();
  const identities = new Set();
  for (const [index, course] of courses.entries()) {
    if (!course || !Number.isSafeInteger(course._id) || course._id < 1 || ids.has(course._id)) {
      throw new Error(`Training course at index ${index} must have a unique positive integer _id.`);
    }

    const { title, providerName, officialWebsite, applicationLink } = course.basicInfo || {};
    if (!title?.trim() || !providerName?.trim()) {
      throw new Error(`Training course with _id ${course._id} is missing its title or provider.`);
    }
    if (!course.basicInfo.shortDescription?.trim()) {
      throw new Error(`Training course with _id ${course._id} is missing its course description.`);
    }
    for (const [label, value] of [["officialWebsite", officialWebsite], ["applicationLink", applicationLink]]) {
      if (!isOfficialCourseUrl(value)) {
        throw new Error(`Training course with _id ${course._id} has a non-official ${label}.`);
      }
    }
    if (urls.has(officialWebsite)) {
      throw new Error(`Duplicate training course URL: ${officialWebsite}.`);
    }

    const identity = `${title.trim().toLowerCase()}|${providerName.trim().toLowerCase()}`;
    if (identities.has(identity)) {
      throw new Error(`Duplicate training course title and provider: ${title} (${providerName}).`);
    }
    ids.add(course._id);
    urls.add(officialWebsite);
    identities.add(identity);
  }

  return courses;
}

async function main() {
  const courses = loadTrainingCourses();
  if (process.argv.includes("--dry-run")) {
    console.log(
      `Validated ${courses.length} unique SWAYAM/NPTEL courses from ${DATA_FILE}. ` +
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
      const deletion = await Training.deleteMany({}, { session });
      deletedCount = deletion.deletedCount;
      await Training.insertMany(courses, { session });
    });
    console.log(
      `Replaced the training collection in "${mongoose.connection.name}": ` +
      `deleted ${deletedCount} old records and inserted ${courses.length} new records.`
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
  console.error("Training import failed:", error.message);
  process.exitCode = 1;
});
