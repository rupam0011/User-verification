const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  await User.create({ name, email, password });

  res.status(201).json({ message: "Registration successful" });
};


// login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const accessToken = jwt.sign(
    { _id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 30 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
};

// dashboard
exports.dashboard = async (req, res) => {
  try {
    res.status(200).json({
      message: "Dashboard access granted",
      user: {
        id: req.user._id,
        email: req.user.email,
        isAdmin: req.user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error" });
  }
};


// logout

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};