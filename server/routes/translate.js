const express = require("express");
const router = express.Router();
const { translateTexts } = require("../services/translateService");

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: string } or { text: string, targetLang: string }
 */
router.post("/", async (req, res) => {
  try {
    const { texts, text, targetLang } = req.body;
    const requestedTexts = texts || (text ? [text] : []);
    const lang = targetLang || "en";

    if (!requestedTexts || requestedTexts.length === 0) {
      return res.json({ translations: {} });
    }

    const translations = await translateTexts(requestedTexts, lang);
    res.json({ translations });
  } catch (err) {
    console.error("Translate route error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
