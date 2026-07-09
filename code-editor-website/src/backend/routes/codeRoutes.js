const express = require("express");
const router = express.Router();
const User = require("../models/user");

function isLikelyCode(code, language) {
  const trimmed = (code || "").trim();
  if (!trimmed || trimmed === "Write your code Here.......") return false;
  if (trimmed.length < 5) return false;
  const langLower = (language || "").toLowerCase();
  if (langLower === "html") return /<[a-z/][^>]*>/i.test(trimmed);
  if (langLower === "css") return trimmed.includes("{") && trimmed.includes("}") && trimmed.includes(":");
  if (["javascript", "java", "c", "c++"].includes(langLower)) {
    const syntaxMarkers = [";", "{", "}", "(", ")", "function", "const", "let", "var", "import", "class", "public", "void", "return", "#include", "std", "int", "printf", "cout", "console.log"];
    return syntaxMarkers.some(marker => trimmed.includes(marker));
  }
  if (langLower === "python") {
    const pythonMarkers = ["print(", "def ", "import ", "if ", "for ", "while ", "class ", " = ", ":\n"];
    return pythonMarkers.some(marker => trimmed.includes(marker));
  }
  return true;
}

router.post("/save-code", async (req, res) => {
  try {
    const { userId, code, language, title } = req.body;
    if (!isLikelyCode(code, language)) {
      return res.status(400).json({ error: "Invalid code structure. Please write some real code before saving." });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { points: 10 },
        $push: { savedCodes: { code, language: language || "unknown", title: title || "Untitled Snippet", savedAt: new Date() } }
      },
      { new: true }
    );
    res.json({
      message: "Code saved + points updated",
      points: updatedUser.points,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/saved-codes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ savedCodes: user.savedCodes || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/saved-code/:userId/:codeId", async (req, res) => {
  try {
    const { userId, codeId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedCodes: { _id: codeId } } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({
      message: "Code deleted successfully",
      savedCodes: updatedUser.savedCodes || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
 