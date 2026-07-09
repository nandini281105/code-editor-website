const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword, points: 0 });
    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      user: { id: newUser._id, username: newUser.username, email: newUser.email, points: newUser.points }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }
    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email, points: user.points }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        nickname: user.nickname || "",
        gender: user.gender || "",
        address: user.address || "",
        dob: user.dob || "",
        points: user.points || 0,
        avatar: user.avatar || ""
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile/:userId", async (req, res) => {
  try {
    const { username, email, phone, nickname, gender, address, dob, avatar } = req.body;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already in use by another user" });
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username, email,
          phone: phone !== undefined ? phone : "",
          nickname: nickname !== undefined ? nickname : "",
          gender: gender !== undefined ? gender : "",
          address: address !== undefined ? address : "",
          dob: dob !== undefined ? dob : "",
          avatar: avatar !== undefined ? avatar : ""
        }
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        nickname: updatedUser.nickname,
        gender: updatedUser.gender,
        address: updatedUser.address,
        dob: updatedUser.dob,
        points: updatedUser.points,
        avatar: updatedUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile/password/:userId", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please fill all password fields" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid current password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
