const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// Database connection
connectDB();

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
