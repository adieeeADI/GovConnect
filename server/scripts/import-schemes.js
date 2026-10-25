const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { cleanRecord } = require("../utils/plainText");

const Scheme = require("../models/Scheme");
const DATA_FILE = path.resolve(__dirname, "..", "scraper", "schemes", "data.json");

function loadSchemes() {
  const schemes = cleanRecord(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  if (!Array.isArray(schemes) || schemes.length === 0) {
    throw new Error("Scheme data must be a non-empty JSON array.");
  }

  const ids = new Set();
  for (const [index, scheme] of schemes.entries()) {
    if (!scheme || !Number.isSafeInteger(scheme._id) || scheme._id < 1) {
      throw new Error(`Scheme at index ${index} must have a positive integer _id.`);
    }
    if (scheme.additionalInfo) delete scheme.additionalInfo.rawSections;
    if (ids.has(scheme._id)) {
      throw new Error(`Duplicate scheme _id: ${scheme._id}.`);
    }
    if (!scheme.basicInfo?.title) {
      throw new Error(`Scheme with _id ${scheme._id} is missing basicInfo.title.`);
    }
    ids.add(scheme._id);
  }

  return schemes;
}

async function main() {
  const schemes = loadSchemes();
  if (process.argv.includes("--dry-run")) {
    console.log(`Validated ${schemes.length} schemes from ${DATA_FILE}. No database changes made.`);
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
      const deletion = await Scheme.deleteMany({}, { session });
      deletedCount = deletion.deletedCount;
      await Scheme.insertMany(schemes, { session });
    });
    console.log(
      `Replaced the schemes collection in "${mongoose.connection.name}": ` +
      `deleted ${deletedCount} old records and inserted ${schemes.length} new records.`
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
  console.error("Scheme import failed:", error.message);
  process.exitCode = 1;
});
