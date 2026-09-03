const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
].filter((m, i, self) => m && self.indexOf(m) === i);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function rankOpportunities(user, opportunities) {
  const grouped = {
    internships: opportunities.filter(o => o.category === "internships"),
    scholarships: opportunities.filter(o => o.category === "scholarships"),
    training: opportunities.filter(o => o.category === "training"),
    schemes: opportunities.filter(o => o.category === "schemes")
  };

  const validIds = opportunities.map(o => o.id);

  const langNameMap = {
    hi: "Hindi (हिंदी)",
    mr: "Marathi (मराठी)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    bn: "Bengali (বাংলা)",
    en: "English"
  };
  const targetLang = langNameMap[user.language] || "English";

  // IDs are now prefixed (e.g. "internships_2", "schemes_5") so Gemini can't confuse categories
  const prompt = `
You are an AI career assistant for Indian government opportunities.

User Profile:
- Education: ${user.education}
- Skills: ${user.skills}
- Interests: ${user.interests?.join(", ")}
- Location: ${user.location}

You MUST pick EXACTLY 2 from EACH category below. Do NOT skip any category.

INTERNSHIPS (pick 2):
${JSON.stringify(grouped.internships.map(o => ({ id: o.id, title: o.title })))}

SCHOLARSHIPS (pick 2):
${JSON.stringify(grouped.scholarships.map(o => ({ id: o.id, title: o.title })))}

TRAINING (pick 2):
${JSON.stringify(grouped.training.map(o => ({ id: o.id, title: o.title })))}

SCHEMES (pick 2):
${JSON.stringify(grouped.schemes.map(o => ({ id: o.id, title: o.title })))}

STRICT RULES:
- Use ONLY the exact id values shown above, including the prefix (e.g. "internships_2", "schemes_5")
- Return exactly 2 internships + 2 scholarships + 2 training + 2 schemes = 8 total
- matchScore: 0-100
- reason: one sentence max, written in ${targetLang} language for the user

Return ONLY valid JSON, no markdown:
{
  "recommendations": [
    { "id": "internships_X", "category": "internships", "matchScore": 85, "reason": "..." },
    { "id": "internships_X", "category": "internships", "matchScore": 80, "reason": "..." },
    { "id": "scholarships_X", "category": "scholarships", "matchScore": 85, "reason": "..." },
    { "id": "scholarships_X", "category": "scholarships", "matchScore": 80, "reason": "..." },
    { "id": "training_X", "category": "training", "matchScore": 85, "reason": "..." },
    { "id": "training_X", "category": "training", "matchScore": 80, "reason": "..." },
    { "id": "schemes_X", "category": "schemes", "matchScore": 85, "reason": "..." },
    { "id": "schemes_X", "category": "schemes", "matchScore": 80, "reason": "..." }
  ]
}
`;

  const tryGemini = async () => {
    let lastError = null;
    for (const modelName of MODELS) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🤖 Requesting recommendations from model: ${modelName} (attempt ${attempt}/3)...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const cleanText = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanText);

          if (!parsed || !Array.isArray(parsed.recommendations)) {
            throw new Error("Invalid response format from Gemini");
          }

          const validRecs = parsed.recommendations
            .filter(rec => {
              const isValid = validIds.includes(String(rec.id));
              if (!isValid) console.log(`❌ Invalid id from Gemini: "${rec.id}"`);
              return isValid;
            })
            .map(rec => ({ ...rec, id: String(rec.id) }));

          console.log(`✅ Gemini (${modelName}) returned ${validRecs.length} valid recommendations`);
          return validRecs;
        } catch (err) {
          console.log(`⚠️ Model ${modelName} attempt ${attempt} failed: ${err.message}`);
          lastError = err;
          if (attempt < 3 && err.message?.includes("503")) {
            await sleep(1500 * attempt);
          } else {
            break;
          }
        }
      }
    }
    throw lastError || new Error("All Gemini models failed");
  };

  try {
    let validRecs;

    try {
      validRecs = await tryGemini();
    } catch (err) {
      throw err;
    }

    // Fill any missing categories with fallback
    const categories = ["internships", "scholarships", "training", "schemes"];
    const finalRecs = [...validRecs];

    categories.forEach(cat => {
      const count = finalRecs.filter(r => r.category === cat).length;
      if (count < 2) {
        console.log(`⚠️ Only ${count} from Gemini for ${cat}, filling with fallback`);
        grouped[cat]
          .filter(op => !finalRecs.find(r => r.id === op.id))
          .slice(0, 2 - count)
          .forEach((op, i) => {
            finalRecs.push({
              id: op.id,
              category: cat,
              matchScore: 60 - i * 5,
              reason: "Recommended based on your profile"
            });
          });
      }
    });

    console.log("✅ Recommendation source: GEMINI");
    return { recommendations: finalRecs, source: "gemini" };

  } catch (err) {
    console.log("⚠️ Recommendation source: FALLBACK");
    console.log("⚠️ Gemini fully failed, using fallback:", err.message);

    const profileTerms = [
      ...(Array.isArray(user.skills) ? user.skills : []),
      ...(Array.isArray(user.interests) ? user.interests : []),
      user.education,
      user.category,
      user.location
    ]
      .filter(Boolean)
      .map(term => String(term).toLowerCase());

    const fallback = [];
    ["internships", "scholarships", "training", "schemes"].forEach(cat => {
      const ranked = grouped[cat]
        .map((op, index) => {
          const searchableText = `${op.title} ${op.organization} ${op.location}`.toLowerCase();
          const profileMatches = profileTerms.filter(term => searchableText.includes(term)).length;
          return { op, index, score: profileMatches * 10 - index / 100 };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      ranked.forEach(({ op, score }, i) => {
        fallback.push({
          id: op.id,
          category: cat,
          matchScore: Math.max(55, Math.min(95, 65 + Math.round(score) - i * 5)),
          reason: profileTerms.length > 0
            ? "Recommended using your saved profile preferences"
            : "Recommended based on available opportunities"
        });
      });
    });

    return { recommendations: fallback, source: "fallback" };
  }
}

module.exports = { rankOpportunities };