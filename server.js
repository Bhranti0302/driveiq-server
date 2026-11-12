require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const cloudinary = require("./config/cloudinary");

const startServer = async () => {
  await connectDB();

  console.log("Cloudinary configured:", {
    cloudName: Boolean(cloudinary.config().cloud_name),
    apiKey: Boolean(cloudinary.config().api_key),
    apiSecret: Boolean(cloudinary.config().api_secret),
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`DriveIQ server is running on port ${PORT}`);
  });
};

startServer();
