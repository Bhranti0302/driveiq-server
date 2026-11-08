const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DriveIQ backend is started",
  });
});

module.exports = app;
