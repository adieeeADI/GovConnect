const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/govconnect";
    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected");
    console.log("Connected to DB Name:", mongoose.connection.name);

  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    console.log("Note: Set MONGO_URI in server/.env to your MongoDB connection string (e.g. MongoDB Atlas or local MongoDB)");
  }
};

module.exports = connectDB;
