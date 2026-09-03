const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-2.5-flash"
].filter((m, i, self) => m && self.indexOf(m) === i);


const COMMON_SKILLS_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "React", "React Native",
  "Node.js", "Express", "HTML", "CSS", "SQL", "MongoDB", "PostgreSQL", "Git", "GitHub",
  "Machine Learning", "Data Analysis", "Artificial Intelligence", "Deep Learning",
  "Cloud Computing", "AWS", "Docker", "Kubernetes", "DevOps", "Linux",
  "Communication", "Leadership", "Problem Solving", "Management", "Project Management",
  "Marketing", "Digital Marketing", "Sales", "Customer Support", "Excel", "Photoshop",
  "Figma", "UI/UX", "Tally", "Accounting", "Public Administration", "Agriculture"
];

function fallbackExtractFromText(text) {
  if (!text) return { fullName: "", phone: "", location: "", education: "", skills: [], interests: [], category: "Job Seeker" };

  const extractedSkills = new Set();

  // 1. Section Header Skill Extraction (handles multi-line, comma, bullet, pipe formats under various headings)
  const skillSectionRegex = /(?:technical\s*skills|soft\s*skills|key\s*skills|skills|tools\s*&\s*technologies|core\s*competencies|expertise|programming\s*languages)[\s:]*([\s\S]{1,400}?)(?=\n\s*\n|\n[A-Z][a-z\s]+:|$)/gi;
  let sectionMatch;
  while ((sectionMatch = skillSectionRegex.exec(text)) !== null) {
    const rawSectionContent = sectionMatch[1];
    // Split into lines first to process sub-labels (e.g. "Languages: Python, Java")
    const lines = rawSectionContent.split(/[\r\n]+/);
    lines.forEach(line => {
      let contentToSplit = line;
      if (line.includes(':')) {
        const parts = line.split(':');
        // Take content after the colon if present
        contentToSplit = parts.slice(1).join(':');
      }
      const tokens = contentToSplit.split(/[,;•|\-*\/]+/).map(t => t.trim()).filter(Boolean);
      tokens.forEach(token => {
        const clean = token.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9+#.\s]/g, '').trim();
        if (clean && clean.length >= 2 && clean.length <= 40 && !/^(and|the|with|using|in|for|of|on|skills|experience|projects|education)$/i.test(clean)) {
          extractedSkills.add(clean);
        }
      });
    });
  }

  // 2. Dictionary keyword match backup
  COMMON_SKILLS_KEYWORDS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/\+/g, '\\+')}\\b`, 'i');
    if (regex.test(text)) {
      extractedSkills.add(skill);
    }
  });

  const skillsList = Array.from(extractedSkills);

  // 3. Extract or infer interests
  const extractedInterests = new Set();
  const interestSectionRegex = /(?:interests|hobbies|career\s*goals|objective|focus\s*areas|areas\s*of\s*interest)[\s:]*([\s\S]{1,250}?)(?=\n\s*\n|\n[A-Z][a-z\s]+:|$)/gi;
  let interestMatch = interestSectionRegex.exec(text);
  if (interestMatch && interestMatch[1]) {
    const tokens = interestMatch[1].split(/[\n,;•|\-*\/]+/).map(t => t.trim()).filter(Boolean);
    tokens.forEach(token => {
      const clean = token.replace(/^[^a-zA-Z0-9]+/, '').trim();
      if (clean && clean.length >= 3 && clean.length <= 40) {
        extractedInterests.add(clean);
      }
    });
  }

  // Domain inference if explicit interests are missing or sparse
  if (extractedInterests.size === 0) {
    const lowerText = text.toLowerCase();
    if (/web|react|javascript|html|node|css/i.test(lowerText)) extractedInterests.add("Web Development");
    if (/python|machine learning|data|ai|sql/i.test(lowerText)) extractedInterests.add("AI & Data Science");
    if (/java|c\+\+|android|app|mobile/i.test(lowerText)) extractedInterests.add("Software Development");
    if (/finance|accounting|tally|bank|tax/i.test(lowerText)) extractedInterests.add("Finance & Banking");
    if (/agriculture|farm|crop|rural/i.test(lowerText)) extractedInterests.add("Agriculture & Rural Development");
    if (/public|government|administration|policy/i.test(lowerText)) extractedInterests.add("Public Administration");
    if (extractedInterests.size === 0 && skillsList.length > 0) {
      extractedInterests.add("Technology & Innovation");
      extractedInterests.add("Skill Development");
    }
  }

  // Extract phone
  const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // Extract education
  let education = "";
  const eduMatch = text.match(/\b(B\.Tech|M\.Tech|B\.Sc|M\.Sc|B\.E|B\.Com|MBA|Diploma|Bachelor|Master|Ph\.D)\b[^\n,.]*/i);
  if (eduMatch) {
    education = eduMatch[0].trim();
  }

  // Extract category
  let category = "Job Seeker";
  if (/student|university|undergraduate|pursuing/i.test(text)) {
    category = "Student";
  } else if (/farmer|agriculture|crop|farm/i.test(text)) {
    category = "Farmer";
  }

  return {
    fullName: "",
    phone,
    location: "",
    education,
    skills: skillsList,
    interests: Array.from(extractedInterests),
    category
  };
}

/**
 * Parse resume text into structured user profile information using Gemini AI
 */
async function parseResumeWithGemini(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text content is empty");
  }

  const prompt = `
You are an expert HR AI system parsing a resume for an Indian government opportunity platform (GovConnect).

Resume Content:
"""
${resumeText.slice(0, 4000)}
"""

Extract the following details from the resume into valid JSON format ONLY:
- fullName: String or empty string if not found
- phone: String or empty string if not found
- location: String or empty string (city/state in India)
- education: Highest degree/branch string (e.g. "B.Tech Computer Science", "B.Com", "Diploma in Agriculture")
- skills: Array of strings. NOTE: Skills in resumes appear in various formats (under section headers like "Technical Skills", "Soft Skills", "Languages", "Tools & Technologies", "Core Competencies", "Key Skills", "Expertise", or separated by commas, newlines, bullet points, pipes, or colons). Extract all distinct individual skills into a clean array of strings.
- interests: Array of strings. NOTE: Extract explicit interests/hobbies/career goals OR infer domain interests from candidate's background, projects, and skills (e.g. ["Web Development", "AI & Machine Learning", "Public Administration", "Banking & Finance", "Healthcare", "Agriculture"]).
- category: One of "Student", "Job Seeker", or "Farmer" (infer based on experience/graduation status, default to "Student" or "Job Seeker")

STRICT REQUIREMENT: Return ONLY valid JSON. No markdown code blocks, no explanation text.
JSON Structure:
{
  "fullName": "...",
  "phone": "...",
  "location": "...",
  "education": "...",
  "skills": ["..."],
  "interests": ["..."],
  "category": "..."
}
`;

  let lastError = null;
  for (const modelName of MODELS) {
    try {
      console.log(`📄 AI Resume Parser attempting extraction with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      console.log(`✅ Resume successfully parsed using ${modelName}`);
      return {
        fullName: parsed.fullName || "",
        phone: parsed.phone || "",
        location: parsed.location || "",
        education: parsed.education || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        interests: Array.isArray(parsed.interests) ? parsed.interests : [],
        category: ["Student", "Job Seeker", "Farmer"].includes(parsed.category) ? parsed.category : "Job Seeker"
      };
    } catch (err) {
      console.log(`⚠️ Resume parser model ${modelName} error: ${err.message}`);
      lastError = err;
    }
  }

  console.log("⚠️ Gemini model extraction failed or unavailable. Falling back to local text parser.");
  const fallbackResult = fallbackExtractFromText(resumeText);
  if (fallbackResult.skills.length > 0 || fallbackResult.education) {
    return fallbackResult;
  }

  throw lastError || new Error("Failed to parse resume with Gemini AI");
}

module.exports = { parseResumeWithGemini, fallbackExtractFromText };

