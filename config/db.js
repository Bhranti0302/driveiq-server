const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = connectDB;
