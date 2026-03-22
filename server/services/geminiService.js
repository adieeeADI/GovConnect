const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview"
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function rankOpportunities(user, opportunities) {
  const grouped = {
    internships: opportunities.filter(o => o.category === "internships"),
    scholarships: opportunities.filter(o => o.category === "scholarships"),
    training: opportunities.filter(o => o.category === "training"),
    schemes: opportunities.filter(o => o.category === "schemes")
  };

  const validIds = opportunities.map(o => o.id);

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
- reason: one sentence max

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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    const validRecs = parsed.recommendations
      .filter(rec => {
        const isValid = validIds.includes(String(rec.id));
        if (!isValid) console.log(`❌ Invalid id from Gemini: "${rec.id}"`);
        return isValid;
      })
      .map(rec => ({ ...rec, id: String(rec.id) }));

    console.log(`✅ Gemini returned ${validRecs.length} valid recommendations`);
    return validRecs;
  };

  try {
    let validRecs;

    try {
      validRecs = await tryGemini();
    } catch (err) {
      if (err.message?.includes("429") || err.message?.includes("Too Many Requests")) {
        console.log("⏳ Rate limited. Waiting 15s then retrying once...");
        await sleep(15000);
        validRecs = await tryGemini();
      } else {
        throw err;
      }
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

    return { recommendations: finalRecs };

  } catch (err) {
    console.log("⚠️ Gemini fully failed, using fallback:", err.message);

    const fallback = [];
    ["internships", "scholarships", "training", "schemes"].forEach(cat => {
      grouped[cat].slice(0, 2).forEach((op, i) => {
        fallback.push({
          id: op.id,
          category: cat,
          matchScore: 75 - i * 5,
          reason: "Recommended based on your profile"
        });
      });
    });

    return { recommendations: fallback };
  }
}

module.exports = { rankOpportunities };