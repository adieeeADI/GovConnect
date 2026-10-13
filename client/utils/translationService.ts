import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, safeFetchJson } from '../config/api.config';
import { LanguageCode } from './i18n';

// In-memory cache for ultra-fast instant rendering
// Key: `${lang}:${cleanText.toLowerCase()}` -> Value: translatedText
const memoryCache = new Map<string, string>();

// Track pending translations to avoid duplicate concurrent in-flight requests
const inFlightRequests = new Map<string, Promise<string>>();

// Debounce queue for batching requests across components
type QueueItem = {
  text: string;
  lang: LanguageCode;
  resolve: (val: string) => void;
  reject: (err: any) => void;
};
let batchQueue: QueueItem[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

// Subscribers notified when new translations are cached
type CacheListener = () => void;
const listeners = new Set<CacheListener>();

export const subscribeToTranslations = (listener: CacheListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.log('Error in translation listener:', e);
    }
  });
};

const getStorageKey = (lang: string) => `@govconnect_trans_cache_v2_${lang}`;

// Initialize cache from AsyncStorage
export const initTranslationCache = async (lang: LanguageCode) => {
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(lang));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([orig, trans]) => {
          if (
            typeof trans === 'string' &&
            (lang === 'en' || trans.trim().toLowerCase() !== orig.trim().toLowerCase())
          ) {
            memoryCache.set(`${lang}:${orig.toLowerCase()}`, trans);
          }
        });
      }
    }
  } catch (err) {
    console.log('Error loading translation cache from storage:', err);
  }
};

// Persist new translations to AsyncStorage
const persistToStorage = async (lang: LanguageCode, entries: Record<string, string>) => {
  try {
    const storageKey = getStorageKey(lang);
    const existingRaw = await AsyncStorage.getItem(storageKey);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const merged = { ...existing, ...entries };
    await AsyncStorage.setItem(storageKey, JSON.stringify(merged));
  } catch (err) {
    console.log('Error saving translation cache to storage:', err);
  }
};

/**
 * Synchronously checks if a translation is already cached in memory.
 */
export const getCachedTranslation = (text: string, lang: LanguageCode): string | null => {
  if (!text || lang === 'en') return text;
  const key = `${lang}:${text.trim().toLowerCase()}`;
  const cached = memoryCache.get(key);
  // Don't treat English fallbacks as translated if target language is not English
  if (cached && cached.trim().toLowerCase() === text.trim().toLowerCase()) {
    return null;
  }
  return cached || null;
};

/**
 * Flush the batch queue and send a single API request for all collected texts.
 */
const flushBatchQueue = async () => {
  if (batchQueue.length === 0) return;
  const currentBatch = [...batchQueue];
  batchQueue = [];
  batchTimeout = null;

  // Group by language
  const byLang: Record<string, QueueItem[]> = {};
  currentBatch.forEach((item) => {
    if (!byLang[item.lang]) byLang[item.lang] = [];
    byLang[item.lang].push(item);
  });

  for (const [lang, items] of Object.entries(byLang)) {
    const targetLang = lang as LanguageCode;
    const textsToTranslate = [...new Set(items.map((i) => i.text.trim()))].filter(Boolean);

    try {
      console.log(`📡 Fetching API translations for ${textsToTranslate.length} texts [${lang}]...`);
      const res = await safeFetchJson(API_ENDPOINTS.TRANSLATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLang,
        }),
      });

      const translations: Record<string, string> = res?.translations || {};
      const newStorageEntries: Record<string, string> = {};

      Object.entries(translations).forEach(([orig, trans]) => {
        if (typeof trans === 'string' && trans.trim()) {
          const cacheKey = `${targetLang}:${orig.trim().toLowerCase()}`;
          memoryCache.set(cacheKey, trans.trim());
          newStorageEntries[orig.trim().toLowerCase()] = trans.trim();
        }
      });

      if (Object.keys(newStorageEntries).length > 0) {
        persistToStorage(targetLang, newStorageEntries);
        notifyListeners();
      }

      // Helper for case-insensitive and trimmed lookup
      const getTrans = (rawText: string): string => {
        if (!rawText) return '';
        const trimmed = rawText.trim();
        if (translations[trimmed]) return translations[trimmed];
        if (translations[rawText]) return translations[rawText];
        const lower = trimmed.toLowerCase();
        for (const [k, v] of Object.entries(translations)) {
          if (k.trim().toLowerCase() === lower && typeof v === 'string' && v.trim()) {
            return v.trim();
          }
        }
        return memoryCache.get(`${targetLang}:${lower}`) || rawText;
      };

      // Resolve promises
      items.forEach((item) => {
        const trans = getTrans(item.text);
        item.resolve(trans);
      });
    } catch (err) {
      console.log(`❌ Failed to translate batch for ${lang}:`, err);
      items.forEach((item) => {
        item.resolve(item.text); // Fallback gracefully to original
      });
    }
  }
};

/**
 * Request translation for a single text. Automatically batched and cached.
 */
export const translateDynamic = async (text: string, lang: LanguageCode): Promise<string> => {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed || lang === 'en') return text;

  // 1. Check in-memory cache
  const cached = getCachedTranslation(trimmed, lang);
  if (cached) return cached;

  // 2. Queue for batched network request
  return new Promise<string>((resolve, reject) => {
    batchQueue.push({
      text: trimmed,
      lang,
      resolve,
      reject,
    });

    if (!batchTimeout) {
      batchTimeout = setTimeout(flushBatchQueue, 35);
    }
  });
};

/**
 * Translates an array of texts in batch. Uses cached results where available,
 * and fetches the remainder from the backend.
 */
export const translateBatch = async (
  texts: string[],
  lang: LanguageCode
): Promise<Record<string, string>> => {
  if (!texts || texts.length === 0) return {};
  if (lang === 'en') {
    const res: Record<string, string> = {};
    texts.forEach((t) => {
      res[t] = t;
    });
    return res;
  }

  const result: Record<string, string> = {};
  const missing: string[] = [];

  texts.forEach((t) => {
    if (!t) return;
    const cached = getCachedTranslation(t, lang);
    if (cached) {
      result[t] = cached;
    } else {
      missing.push(t);
    }
  });

  if (missing.length === 0) {
    return result;
  }

  const promises = missing.map(async (text) => {
    const trans = await translateDynamic(text, lang);
    result[text] = trans;
  });

  await Promise.all(promises);
  return result;
};
