const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  phone: { type: String, default: "" },
  nickname: { type: String, default: "" },
  gender: { type: String, default: "" },
  address: { type: String, default: "" },
  dob: { type: String, default: "" },
  avatar: { type: String, default: "" },
  savedCodes: [
    {
      code: { type: String },
      language: { type: String },
      title: { type: String },
      savedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
