import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_for_you: 'For You',
    nav_browse: 'Browse',
    nav_profile: 'Profile',
    welcome_back: 'Welcome back',
    guest: 'Guest',
    profile_completion: 'Complete Your Profile',
    profile_complete_subtitle: 'Fill details for personalized scheme & opportunity recommendations',
    categories: 'Categories',
    internships: 'Internships',
    scholarships: 'Scholarships',
    training: 'Skill Training',
    schemes: 'Govt Schemes',
    search_placeholder: 'Search schemes, scholarships, training...',
    language: 'App Language',
    select_language: 'Select Language',
    edit_profile: 'Edit Profile',
    logout: 'Log Out',
    save: 'Save',
    save_exit: 'Save & Exit',
    save_continue: 'Save & Continue →',
    save_finish: 'Save & Finish',
    apply_now: 'Apply Now',
    view_details: 'View Details',
    ai_resume_parser: 'AI Resume Parser',
    upload_resume: 'Upload Resume (PDF/DOC)',
    ai_extracting: '✨ AI Parsing Resume...',
    ai_extracted: '✓ AI Extracted Profile Details',
    recommended_for_you: 'Recommended For You',
    match_score: 'Match',
    reason: 'Why this matches',
    all: 'All',
    close: 'Close',
    confirm_logout: 'Are you sure you want to log out?',
    leave_page: 'Are you sure you want to go back?',
  },
  hi: {
    nav_home: 'गृह',
    nav_for_you: 'आपके लिए',
    nav_browse: 'ब्राउज़',
    nav_profile: 'प्रोफ़ाइल',
    welcome_back: 'नमस्ते',
    guest: 'अतिथि',
    profile_completion: 'अपनी प्रोफ़ाइल पूरी करें',
    profile_complete_subtitle: 'व्यक्तिगत योजना और अवसर सिफारिशों के लिए विवरण भरें',
    categories: 'श्रेणियां',
    internships: 'इंटर्नशिप',
    scholarships: 'छात्रवृत्ति',
    training: 'कौशल प्रशिक्षण',
    schemes: 'सरकारी योजनाएं',
    search_placeholder: 'योजनाएं, छात्रवृत्ति, प्रशिक्षण खोजें...',
    language: 'ऐप की भाषा',
    select_language: 'भाषा चुनें',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    logout: 'लॉग आउट',
    save: 'सहेजें',
    save_exit: 'सहेजें और बाहर निकलें',
    save_continue: 'सहेजें और जारी रखें →',
    save_finish: 'सहेजें और समाप्त करें',
    apply_now: 'अभी आवेदन करें',
    view_details: 'विवरण देखें',
    ai_resume_parser: 'एआई रिज्यूमे पार्सर',
    upload_resume: 'रिज्यूमे अपलोड करें (PDF/DOC)',
    ai_extracting: '✨ एआई रिज्यूमे विश्लेषण कर रहा है...',
    ai_extracted: '✓ एआई द्वारा निकाली गई प्रोफ़ाइल जानकारी',
    recommended_for_you: 'आपके लिए अनुशंसित',
    match_score: 'मैच',
    reason: 'यह आपके अनुकूल क्यों है',
    all: 'सभी',
    close: 'बंद करें',
    confirm_logout: 'क्या आप निश्चित रूप से लॉग आउट करना चाहते हैं?',
    leave_page: 'क्या आप वापस जाना चाहते हैं?',
  },
  mr: {
    nav_home: 'मुख्यपृष्ठ',
    nav_for_you: 'तुमच्यासाठी',
    nav_browse: 'शोध घ्या',
    nav_profile: 'प्रोफाइल',
    welcome_back: 'सुस्वागतम',
    guest: 'पाहुणे',
    profile_completion: 'तुमची प्रोफाइल पूर्ण करा',
    profile_complete_subtitle: 'वैयक्तिकृत योजना व संधींच्या शिफारशींसाठी तपशील भरा',
    categories: 'वर्ग',
    internships: 'इंटर्नशिप',
    scholarships: 'शिष्यवृत्ती',
    training: 'कौशल्य प्रशिक्षण',
    schemes: 'शासकीय योजना',
    search_placeholder: 'योजना, शिष्यवृत्ती, प्रशिक्षण शोधा...',
    language: 'अ‍ॅपची भाषा',
    select_language: 'भाषा निवडा',
    edit_profile: 'प्रोफाइल संपादित करा',
    logout: 'लॉग आउट',
    save: 'जतन करा',
    save_exit: 'जतन करा व बाहेर पडा',
    save_continue: 'जतन करा व पुढे जा →',
    save_finish: 'जतन करा व पूर्ण करा',
    apply_now: 'आता अर्ज करा',
    view_details: 'तपशील पहा',
    ai_resume_parser: 'AI रिज्युमे पार्सर',
    upload_resume: 'रिज्युमे अपलोड करा (PDF/DOC)',
    ai_extracting: '✨ AI रिज्युमे विश्लेषण करत आहे...',
    ai_extracted: '✓ AI द्वारे प्राप्त माहिती',
    recommended_for_you: 'तुमच्यासाठी शिफारस केलेले',
    match_score: 'मॅच',
    reason: 'हे तुमच्यासाठी योग्य का आहे',
    all: 'सर्व',
    close: 'बंद करा',
    confirm_logout: 'तुम्हाला नक्की लॉग आउट करायचे आहे का?',
    leave_page: 'तुम्हाला मागे जायचे आहे का?',
  },
  ta: {
    nav_home: 'முகப்பு',
    nav_for_you: 'உனக்காக',
    nav_browse: 'உலாவு',
    nav_profile: 'சுயவிவரம்',
    welcome_back: 'நல்வரவு',
    guest: 'விருந்தினர்',
    profile_completion: 'சுயவிவரத்தை முடிக்கவும்',
    profile_complete_subtitle: 'தனிப்பயனாக்கப்பட்ட திட்டப் பரிந்துரைகளுக்கு விவரங்களை நிரப்பவும்',
    categories: 'பிரிவுகள்',
    internships: 'இன்டர்ன்ஷிப்',
    scholarships: 'உதவித்தொகை',
    training: 'திறன் பயிற்சி',
    schemes: 'அரசுத் திட்டங்கள்',
    search_placeholder: 'திட்டங்கள், உதவித்தொகைகளைத் தேடுங்கள்...',
    language: 'பயன்பாட்டு மொழி',
    select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    edit_profile: 'சுயவிவரத்தைத் திருத்து',
    logout: 'வெளியேறு',
    save: 'சேமி',
    save_exit: 'சேமித்து வெளியேறு',
    save_continue: 'சேமித்து தொடரவும் →',
    save_finish: 'சேமித்து முடிக்கவும்',
    apply_now: 'இப்போது விண்ணப்பிக்கவும்',
    view_details: 'விவரங்களைப் பார்க்கவும்',
    ai_resume_parser: 'AI ரெஸ்யூம் பார்சர்',
    upload_resume: 'ரெஸ்யூமைப் பதிவேற்றவும் (PDF/DOC)',
    ai_extracting: '✨ AI ரெஸ்யூம் பகுப்பாய்வு செய்கிறது...',
    ai_extracted: '✓ AI பிரித்தெடுக்கப்பட்ட விவரங்கள்',
    recommended_for_you: 'உங்களுக்காக பரிந்துரைக்கப்பட்டது',
    match_score: 'பொருத்தம்',
    reason: 'ஏன் இது பொருத்தமானது',
    all: 'அனைத்தும்',
    close: 'மூடு',
    confirm_logout: 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா?',
    leave_page: 'பின்னால் செல்ல விரும்புகிறீர்களா?',
  },
  te: {
    nav_home: 'హోమ్',
    nav_for_you: 'మీ కోసం',
    nav_browse: 'బ్రౌజ్',
    nav_profile: 'ప్రొఫైల్',
    welcome_back: 'స్వాగతం',
    guest: 'అతిథి',
    profile_completion: 'మీ ప్రొఫైల్‌ను పూర్తి చేయండి',
    profile_complete_subtitle: 'వ్యక్తిగతీకరించిన పథకం సిఫార్సుల కోసం వివరాలను నింపండి',
    categories: 'వర్గాలు',
    internships: 'ఇంటర్న్‌షిప్‌లు',
    scholarships: 'స్కాలర్‌షిప్‌లు',
    training: 'నైపుణ్య శిక్షణ',
    schemes: 'ప్రభుత్వ పథకాలు',
    search_placeholder: 'పథకాలు, స్కాలర్‌షిప్‌లను శోధించండి...',
    language: 'యాప్ భాష',
    select_language: 'భాషను ఎంచుకోండి',
    edit_profile: 'ప్రొఫైల్‌ను సవరించండి',
    logout: 'లాగ్ అవుట్',
    save: 'సేవ్ చేయండి',
    save_exit: 'సేవ్ చేసి నిష్క్రమించండి',
    save_continue: 'సేవ్ చేసి కొనసాగించండి →',
    save_finish: 'సేవ్ చేసి పూర్తి చేయండి',
    apply_now: 'ఇప్పుడే దరఖాస్తు చేయండి',
    view_details: 'వివరాలను చూడండి',
    ai_resume_parser: 'AI రెజ్యూమ్ పార్సర్',
    upload_resume: 'రెజ్యూమ్‌ను అప్‌లోడ్ చేయండి (PDF/DOC)',
    ai_extracting: '✨ AI రెజ్యూమ్‌ను విశ్లేషిస్తోంది...',
    ai_extracted: '✓ AI సేకరించిన ప్రొఫైల్ వివరాలు',
    recommended_for_you: 'మీ కోసం సిఫార్సు చేయబడినవి',
    match_score: 'మ్యాచ్',
    reason: 'ఇది మీకు ఎందుకు సరిపోతుంది',
    all: 'అన్నీ',
    close: 'మూసివేయి',
    confirm_logout: 'మీరు నిజంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
    leave_page: 'మీరు వెనక్కి వెళ్లాలనుకుంటున్నారా?',
  },
  bn: {
    nav_home: 'হোম',
    nav_for_you: 'আপনার জন্য',
    nav_browse: 'ব্রাউজ',
    nav_profile: 'প্রোফাইল',
    welcome_back: 'স্বাগতম',
    guest: 'অতিথি',
    profile_completion: 'আপনার প্রোফাইল সম্পূর্ণ করুন',
    profile_complete_subtitle: 'ব্যক্তিগতকৃত সরকারি স্কিম সুপারিশের জন্য বিবরণ পূরণ করুন',
    categories: 'বিভাগসমূহ',
    internships: 'ইন্টার্নশিপ',
    scholarships: 'বৃত্তি',
    training: 'দক্ষতা প্রশিক্ষণ',
    schemes: 'সরকারি প্রকল্প',
    search_placeholder: 'প্রকল্প, বৃত্তি, প্রশিক্ষণ খুঁজুন...',
    language: 'অ্যাপের ভাষা',
    select_language: 'ভাষা নির্বাচন করুন',
    edit_profile: 'প্রোফাইল সম্পাদনা করুন',
    logout: 'লগ আউট',
    save: 'সংরক্ষণ করুন',
    save_exit: 'সংরক্ষণ করুন ও বের হন',
    save_continue: 'সংরক্ষণ করুন ও এগিয়ে যান →',
    save_finish: 'সংরক্ষণ করুন ও শেষ করুন',
    apply_now: 'এখনই আবেদন করুন',
    view_details: 'বিবরণ দেখুন',
    ai_resume_parser: 'AI রেজুমে পার্সার',
    upload_resume: 'রেজুমে আপলোড করুন (PDF/DOC)',
    ai_extracting: '✨ AI রেজুমে বিশ্লেষণ করছে...',
    ai_extracted: '✓ AI দ্বারা সংগৃহীত বিবরণ',
    recommended_for_you: 'আপনার জন্য সুপারিশকৃত',
    match_score: 'ম্যাচ',
    reason: 'কেন এটি উপযুক্ত',
    all: 'সব',
    close: 'বন্ধ করুন',
    confirm_logout: 'আপনি কি নিশ্চিত যে লগ আউট করতে চান?',
    leave_page: 'আপনি কি ফিরে যেতে চান?',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const loadLang = async () => {
      try {
        const saved = await AsyncStorage.getItem('appLanguage');
        if (saved && (saved in translations)) {
          setLanguageState(saved as LanguageCode);
        }
      } catch (e) {
        console.log('Error loading saved language:', e);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (e) {
      console.log('Error saving language preference:', e);
    }
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useTranslation = () => useContext(LanguageContext);
