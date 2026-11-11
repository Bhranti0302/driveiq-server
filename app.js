const express = require("express");
const corsMiddleware = require("./config/cors")
// const testRoutes = require("./routes/testRoutes");

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());


// app.use("/api/test", testRoutes);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DriveIQ backend is started",
  });
});

module.exports = app;
