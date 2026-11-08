const express = require("express");
const corsMiddleware = require("./config/cors")

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DriveIQ backend is started",
  });
});

module.exports = app;
