const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
].filter((m, i, self) => m && self.indexOf(m) === i);

// In-memory cache for translated opportunity objects
// Key: `${item_id}_${targetLang}` -> Value: translatedData
const translationCache = new Map();

const langNameMap = {
  hi: "Hindi (हिंदी)",
  mr: "Marathi (मराठी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  bn: "Bengali (বাংলা)",
  en: "English"
};

/**
 * Translates dynamic text fields of an opportunity item into target language
 */
async function translateOpportunityDetails(data, targetLang) {
  if (!data || !targetLang || targetLang === "en") {
    return data;
  }

  const langName = langNameMap[targetLang];
  if (!langName) {
    return data;
  }

  const itemId = data._id || data.id || JSON.stringify(data.basicInfo?.title);
  const cacheKey = `${itemId}_${targetLang}`;

  if (translationCache.has(cacheKey)) {
    console.log(`⚡ Serving translated details from cache [${cacheKey}]`);
    return translationCache.get(cacheKey);
  }

  // Extract translatable text blocks
  const fieldsToTranslate = {
    title: data.basicInfo?.title || "",
    providerName: data.basicInfo?.providerName || "",
    department: data.basicInfo?.department || "",
    shortDescription: data.basicInfo?.shortDescription || "",
    about: data.programDetails?.about || "",
    perks: data.programDetails?.perks || "",
    whoCanApply: data.programDetails?.whoCanApply || "",
    terms: data.programDetails?.terms || "",
    schemeBenefits: data.schemeDetails?.benefits || [],
    benefitType: data.schemeDetails?.benefitType || "",
    covers: data.benefits?.covers || [],
    specialCriteria: data.eligibility?.specialCriteria || [],
    applicationProcessSteps: data.applicationProcess?.steps || [],
    documentsRequired: data.documentsRequired || data.applicationDetails?.documentsRequired || [],
    exclusions: data.additionalInfo?.exclusions || "",
    ministry: data.additionalInfo?.ministry || "",
    selectionProcess: data.applicationDetails?.selectionProcess || data.additionalInfo?.selectionProcess || "",
    renewalPolicy: data.additionalInfo?.renewalPolicy || "",
    faq: data.faq?.questionsAndAnswers || []
  };

  const prompt = `
You are a professional translator for Indian Government opportunity details.
Translate the following JSON text fields accurately into ${langName}.
Keep proper nouns, numbers, dates, website links, scheme brand names, and currency symbols (₹) recognizable while translating all descriptive text, sentences, instructions, requirements, perks, steps, and FAQs cleanly into ${langName}.

Input JSON:
${JSON.stringify(fieldsToTranslate, null, 2)}

Return ONLY valid JSON matching this exact structure without markdown backticks:
{
  "title": "...",
  "providerName": "...",
  "department": "...",
  "shortDescription": "...",
  "about": "...",
  "perks": "...",
  "whoCanApply": "...",
  "terms": "...",
  "schemeBenefits": [...],
  "benefitType": "...",
  "covers": [...],
  "specialCriteria": [...],
  "applicationProcessSteps": [...],
  "documentsRequired": [...],
  "exclusions": "...",
  "ministry": "...",
  "selectionProcess": "...",
  "renewalPolicy": "...",
  "faq": [
    { "question": "...", "answer": "..." }
  ]
}
`;

  try {
    for (const modelName of MODELS) {
      try {
        console.log(`🌐 Translating opportunity details to ${langName} using ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanText = responseText.replace(/```json|```/g, "").trim();
        const translatedFields = JSON.parse(cleanText);

        // Merge translated fields into deep clone of data
        const translatedData = JSON.parse(JSON.stringify(data));

        if (translatedFields.title && translatedData.basicInfo) translatedData.basicInfo.title = translatedFields.title;
        if (translatedFields.providerName && translatedData.basicInfo) translatedData.basicInfo.providerName = translatedFields.providerName;
        if (translatedFields.department && translatedData.basicInfo) translatedData.basicInfo.department = translatedFields.department;
        if (translatedFields.shortDescription && translatedData.basicInfo) translatedData.basicInfo.shortDescription = translatedFields.shortDescription;
        
        if (translatedData.programDetails) {
          if (translatedFields.about) translatedData.programDetails.about = translatedFields.about;
          if (translatedFields.perks) translatedData.programDetails.perks = translatedFields.perks;
          if (translatedFields.whoCanApply) translatedData.programDetails.whoCanApply = translatedFields.whoCanApply;
          if (translatedFields.terms) translatedData.programDetails.terms = translatedFields.terms;
        }

        if (translatedData.schemeDetails) {
          if (Array.isArray(translatedFields.schemeBenefits) && translatedFields.schemeBenefits.length > 0) {
            translatedData.schemeDetails.benefits = translatedFields.schemeBenefits;
          }
          if (translatedFields.benefitType) translatedData.schemeDetails.benefitType = translatedFields.benefitType;
        }

        if (translatedData.benefits) {
          if (Array.isArray(translatedFields.covers) && translatedFields.covers.length > 0) {
            translatedData.benefits.covers = translatedFields.covers;
          }
        }

        if (translatedData.eligibility) {
          if (Array.isArray(translatedFields.specialCriteria) && translatedFields.specialCriteria.length > 0) {
            translatedData.eligibility.specialCriteria = translatedFields.specialCriteria;
          }
        }

        if (translatedData.applicationProcess) {
          if (Array.isArray(translatedFields.applicationProcessSteps) && translatedFields.applicationProcessSteps.length > 0) {
            translatedData.applicationProcess.steps = translatedFields.applicationProcessSteps;
          }
        }

        if (Array.isArray(translatedFields.documentsRequired) && translatedFields.documentsRequired.length > 0) {
          translatedData.documentsRequired = translatedFields.documentsRequired;
          if (translatedData.applicationDetails) {
            translatedData.applicationDetails.documentsRequired = translatedFields.documentsRequired;
          }
        }

        if (translatedData.additionalInfo) {
          if (translatedFields.exclusions) translatedData.additionalInfo.exclusions = translatedFields.exclusions;
          if (translatedFields.ministry) translatedData.additionalInfo.ministry = translatedFields.ministry;
          if (translatedFields.selectionProcess) translatedData.additionalInfo.selectionProcess = translatedFields.selectionProcess;
          if (translatedFields.renewalPolicy) translatedData.additionalInfo.renewalPolicy = translatedFields.renewalPolicy;
        }

        if (translatedData.applicationDetails && translatedFields.selectionProcess) {
          translatedData.applicationDetails.selectionProcess = translatedFields.selectionProcess;
        }

        if (translatedData.faq && Array.isArray(translatedFields.faq) && translatedFields.faq.length > 0) {
          translatedData.faq.questionsAndAnswers = translatedFields.faq;
        }

        translationCache.set(cacheKey, translatedData);
        console.log(`✅ Successfully translated and cached details for [${cacheKey}]`);
        return translatedData;
      } catch (err) {
        console.log(`⚠️ Model ${modelName} translation attempt failed: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`❌ Translation error, falling back to original data: ${err.message}`);
  }

  return data;
}

module.exports = { translateOpportunityDetails };
