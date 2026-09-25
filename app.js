const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan"); 
const logger = require("./middlewares/logger");
const errorLogger = require("./middlewares/errorLogger"); 
const errorHandler = require("./middlewares/errorHandler"); 

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// 🔹 Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(logger);

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use(errorLogger); // logs error
app.use(errorHandler); // sends response

module.exports = app;
