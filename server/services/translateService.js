const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
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
    faq: data.faq?.questionsAndAnswers || [],
    curriculum: data.programDetails?.curriculum || "",
    certificate: data.trainingDetails?.certificate || "",
    mode: data.internshipDetails?.mode || data.trainingDetails?.mode || "",
    duration: data.internshipDetails?.duration || data.trainingDetails?.duration || "",
    stipend: data.internshipDetails?.stipend || "",
    streamsAllowed: data.eligibility?.streamsAllowed || [],
    educationLevels: data.eligibility?.educationLevels || [],
    location: data.internshipDetails?.location || data.trainingDetails?.location || []
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
  ],
  "curriculum": "...",
  "certificate": "...",
  "mode": "...",
  "duration": "...",
  "stipend": "...",
  "streamsAllowed": [...],
  "educationLevels": [...],
  "location": [...]
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
          if (translatedFields.curriculum) translatedData.programDetails.curriculum = translatedFields.curriculum;
        }

        if (translatedData.trainingDetails) {
          if (translatedFields.certificate) translatedData.trainingDetails.certificate = translatedFields.certificate;
          if (translatedFields.duration) translatedData.trainingDetails.duration = translatedFields.duration;
          if (translatedFields.mode) translatedData.trainingDetails.mode = translatedFields.mode;
          if (Array.isArray(translatedFields.location) && translatedFields.location.length > 0) {
            translatedData.trainingDetails.location = translatedFields.location;
          }
        }

        if (translatedData.internshipDetails) {
          if (translatedFields.stipend) translatedData.internshipDetails.stipend = translatedFields.stipend;
          if (translatedFields.duration) translatedData.internshipDetails.duration = translatedFields.duration;
          if (translatedFields.mode) translatedData.internshipDetails.mode = translatedFields.mode;
          if (Array.isArray(translatedFields.location) && translatedFields.location.length > 0) {
            translatedData.internshipDetails.location = translatedFields.location;
          }
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
          if (Array.isArray(translatedFields.streamsAllowed) && translatedFields.streamsAllowed.length > 0) {
            translatedData.eligibility.streamsAllowed = translatedFields.streamsAllowed;
          }
          if (Array.isArray(translatedFields.educationLevels) && translatedFields.educationLevels.length > 0) {
            translatedData.eligibility.educationLevels = translatedFields.educationLevels;
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

/**
 * Translates an array of short texts, skills, categories, or sentences into target language.
 * Uses in-memory cache to guarantee zero redundant API calls.
 */
async function translateTexts(texts, targetLang) {
  if (!texts || (Array.isArray(texts) && texts.length === 0)) {
    return {};
  }
  const textArray = Array.isArray(texts) ? texts : [texts];
  const target = targetLang || "en";

  const result = {};
  if (target === "en") {
    textArray.forEach((t) => {
      if (t && typeof t === "string") result[t] = t;
    });
    return result;
  }

  const langName = langNameMap[target];
  if (!langName) {
    textArray.forEach((t) => {
      if (t && typeof t === "string") result[t] = t;
    });
    return result;
  }

  const missing = [];
  textArray.forEach((raw) => {
    if (!raw || typeof raw !== "string") return;
    const clean = raw.trim();
    if (!clean) return;

    const cacheKey = `str_${target}_${clean.toLowerCase()}`;
    if (translationCache.has(cacheKey)) {
      result[raw] = translationCache.get(cacheKey);
    } else {
      missing.push(clean);
    }
  });

  const uniqueMissing = [...new Set(missing)];
  if (uniqueMissing.length === 0) {
    return result;
  }

  const prompt = `
You are an expert multilingual translator for Indian government opportunities, employment, and education apps.
Translate the following list of skills, technologies, categories, qualifications, and UI phrases into ${langName}.

Rules:
1. For technical skills, programming languages, and tools (such as Python, Java, React, SQL, Machine Learning, Data Science, Cloud Computing, Web Development, etc.):
   Provide accurate, natural transliterations or standard translations in ${langName} script (e.g. for Hindi: "पायथन", "मशीन लर्निंग", "डेटा साइंस", "वेब डेवलपमेंट").
2. For education degrees, job categories, UI words, and sentences: provide clean, formal, natural translations in ${langName}.
3. Return ONLY a valid JSON object mapping each input text to its translated text without markdown codeblocks or backticks:
{
  "Input Text 1": "Translated Text 1",
  "Input Text 2": "Translated Text 2"
}

Input list:
${JSON.stringify(uniqueMissing, null, 2)}
`;

  try {
    for (const modelName of MODELS) {
      try {
        console.log(`🌐 Translating batch of ${uniqueMissing.length} texts to ${langName} using ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent(prompt);
        const resText = res.response.text();
        const clean = resText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (parsed && typeof parsed === "object") {
          const lowerMap = new Map();
          Object.entries(parsed).forEach(([orig, trans]) => {
            if (typeof trans === "string" && trans.trim()) {
              const cleanTrans = trans.trim();
              const lowerKey = orig.trim().toLowerCase();
              lowerMap.set(lowerKey, cleanTrans);
              const cacheKey = `str_${target}_${lowerKey}`;
              translationCache.set(cacheKey, cleanTrans);
              result[orig] = cleanTrans;
            }
          });

          // Ensure all requested items are populated in result matching by lowercase
          uniqueMissing.forEach((item) => {
            const lower = item.trim().toLowerCase();
            if (lowerMap.has(lower)) {
              result[item] = lowerMap.get(lower);
            }
          });

          console.log(`✅ Cached ${Object.keys(parsed).length} translated texts for [${target}]`);
          break;
        }
      } catch (err) {
        console.log(`⚠️ Model ${modelName} batch translate attempt failed: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`❌ Batch translation error: ${err.message}`);
  }

  // Fallback for any items that failed
  uniqueMissing.forEach((item) => {
    if (!result[item]) {
      const lower = item.trim().toLowerCase();
      const cacheKey = `str_${target}_${lower}`;
      if (translationCache.has(cacheKey)) {
        result[item] = translationCache.get(cacheKey);
      } else {
        result[item] = item;
      }
    }
  });

  return result;
}

module.exports = { translateOpportunityDetails, translateTexts };

