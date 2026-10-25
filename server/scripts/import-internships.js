const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { cleanRecord } = require("../utils/plainText");
const { getContentQualityIssue } = require("../scraper/Internship-scraper-puppeteer");

const Internship = require("../models/Internship");
const DATA_FILE = path.resolve(__dirname, "..", "scraper", "internships", "data.json");
const PORTAL_HOST = "internship.aicte-india.org";
const EXPECTED_COUNT = 100;

function loadInternships() {
  const internships = cleanRecord(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  if (!Array.isArray(internships) || internships.length !== EXPECTED_COUNT) {
    throw new Error(`Internship data must contain exactly ${EXPECTED_COUNT} records.`);
  }

  const ids = new Set();
  const urls = new Set();
  const identities = new Set();
  for (const [index, internship] of internships.entries()) {
    if (!internship || !Number.isSafeInteger(internship._id) || internship._id < 1) {
      throw new Error(`Internship at index ${index} must have a positive integer _id.`);
    }
    if (ids.has(internship._id)) {
      throw new Error(`Duplicate internship _id: ${internship._id}.`);
    }

    const { title, providerName, officialWebsite, applicationLink } = internship.basicInfo || {};
    if (!title?.trim() || !providerName?.trim()) {
      throw new Error(`Internship with _id ${internship._id} is missing its title or provider.`);
    }
    for (const [label, value] of [["officialWebsite", officialWebsite], ["applicationLink", applicationLink]]) {
      let url;
      try {
        url = new URL(value);
      } catch {
        throw new Error(`Internship with _id ${internship._id} has an invalid ${label}.`);
      }
      if (url.protocol !== "https:" || url.hostname !== PORTAL_HOST) {
        throw new Error(`Internship with _id ${internship._id} does not link to the AICTE portal.`);
      }
    }
    if (urls.has(officialWebsite)) {
      throw new Error(`Duplicate internship detail URL: ${officialWebsite}.`);
    }

    const identity = `${title.trim().toLowerCase()}|${providerName.trim().toLowerCase()}`;
    if (identities.has(identity)) {
      throw new Error(`Duplicate internship title and provider: ${title} (${providerName}).`);
    }
    if (!internship.basicInfo.shortDescription?.trim()) {
      throw new Error(`Internship with _id ${internship._id} is missing a description.`);
    }
    const qualityIssue = getContentQualityIssue(internship);
    if (qualityIssue) {
      throw new Error(`Internship with _id ${internship._id} has a ${qualityIssue}.`);
    }
    ids.add(internship._id);
    urls.add(officialWebsite);
    identities.add(identity);
  }

  return internships;
}

async function main() {
  const internships = loadInternships();
  if (process.argv.includes("--dry-run")) {
    console.log(
      `Validated ${internships.length} unique AICTE portal internships from ${DATA_FILE}. ` +
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
      const deletion = await Internship.deleteMany({}, { session });
      deletedCount = deletion.deletedCount;
      await Internship.insertMany(internships, { session });
    });
    console.log(
      `Replaced the internships collection in "${mongoose.connection.name}": ` +
      `deleted ${deletedCount} old records and inserted ${internships.length} new records.`
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
  console.error("Internship import failed:", error.message);
  process.exitCode = 1;
});
