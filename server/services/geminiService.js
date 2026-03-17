const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview"
});

async function rankOpportunities(user, opportunities) {

const prompt = `
You are an AI career assistant.

Analyze the user profile and recommend best opportunities.

User Profile:
${JSON.stringify(user)}

Opportunities:
${JSON.stringify(opportunities)}

Instructions:
- Rank best matches first
- Give matchScore (0–100)
- Explain clearly WHY it matches
- Consider:
  skills
  education
  interests
  eligibility

Return ONLY JSON:
{
 "recommendations":[
  {
   "id":"",
   "matchScore":0,
   "reason":""
  }
 ]
}
`;

const result = await model.generateContent(prompt);

const text = result.response.text();

// ✅ Clean response
const cleanText = text.replace(/```json|```/g, "").trim();

try {
  return JSON.parse(cleanText);
} catch (err) {
  return { raw: text };
}

}

module.exports = { rankOpportunities };