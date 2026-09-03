const express = require("express");
const pdfParse = require("pdf-parse");
const { parseResumeWithGemini } = require("../services/resumeService");

const router = express.Router();

async function parsePdfBuffer(buffer) {
  if (typeof pdfParse === "function") {
    const data = await pdfParse(buffer);
    return data.text || "";
  } else if (pdfParse && pdfParse.PDFParse) {
    const parser = new pdfParse.PDFParse({ data: buffer });
    const data = await parser.getText();
    return data.text || "";
  }
  throw new Error("PDF parser structure unhandled");
}

/* ===================== PARSE RESUME ENDPOINT ===================== */
router.post("/parse", async (req, res) => {
  try {
    const { base64, text, fileName } = req.body;
    let extractedText = "";

    if (text && text.trim()) {
      extractedText = text;
    } else if (base64) {
      // Decode Base64 buffer
      const buffer = Buffer.from(base64, "base64");
      
      const isPdf = (fileName && fileName.toLowerCase().endsWith(".pdf")) || buffer.slice(0, 4).toString() === "%PDF";
      if (isPdf) {
        try {
          extractedText = await parsePdfBuffer(buffer);
        } catch (pdfErr) {
          console.log("PDF parse error, falling back to raw buffer string:", pdfErr.message);
          extractedText = buffer.toString("utf-8");
        }
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else {
      return res.status(400).json({ message: "No resume text or base64 file data provided" });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ message: "Could not extract readable text from resume document" });
    }

    console.log(`📄 Parsing resume (${fileName || 'document'}). Extracted text length: ${extractedText.length} chars`);

    const parsedData = await parseResumeWithGemini(extractedText);

    res.json({
      success: true,
      message: "Resume parsed successfully",
      parsed: parsedData
    });

  } catch (err) {
    console.error("Resume parsing endpoint error:", err);
    res.status(500).json({ message: "Failed to parse resume", error: err.message });
  }
});

module.exports = router;
