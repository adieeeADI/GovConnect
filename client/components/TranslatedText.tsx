import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation, translateValue } from '../utils/i18n';
import {
  getCachedTranslation,
  translateDynamic,
  subscribeToTranslations,
} from '../utils/translationService';

interface TranslatedTextProps extends TextProps {
  text: string | null | undefined;
  prefix?: string;
  suffix?: string;
  children?: React.ReactNode;
}

export default function TranslatedText({
  text,
  prefix = '',
  suffix = '',
  style,
  ...rest
}: TranslatedTextProps) {
  const { language, t } = useTranslation();

  // Helper to determine the best immediate translation available synchronously
  const getImmediateTranslation = (raw: string | null | undefined): string => {
    if (!raw) return '';
    if (language === 'en') return raw;

    // 1. Try static translateValue dictionary
    const staticVal = translateValue(raw, t);
    if (staticVal && staticVal.toLowerCase() !== raw.toLowerCase()) {
      return staticVal;
    }

    // 2. Try static t(key)
    const staticKey = t(raw);
    if (staticKey && staticKey !== raw) {
      return staticKey;
    }

    // 3. Try memory cache
    const cached = getCachedTranslation(raw, language);
    if (cached) return cached;

    // Fallback to raw text until background fetch completes
    return raw;
  };

  const [displayText, setDisplayText] = useState<string>(() =>
    getImmediateTranslation(text)
  );

  useEffect(() => {
    if (!text || language === 'en') {
      setDisplayText(text || '');
      return;
    }

    // Set immediate cached/fallback
    const immediate = getImmediateTranslation(text);
    setDisplayText(immediate);

    // If already properly translated from static or cache, no need to fetch
    const cached = getCachedTranslation(text, language);
    if (!cached && immediate === text) {
      // Trigger background translation fetch
      translateDynamic(text, language)
        .then((translated) => {
          if (translated) {
            setDisplayText(translated);
          }
        })
        .catch(() => {});
    }

    // Subscribe to translation cache updates
    const unsubscribe = subscribeToTranslations(() => {
      const updated = getCachedTranslation(text, language);
      if (updated) {
        setDisplayText(updated);
      }
    });

    return unsubscribe;
  }, [text, language]);

  return (
    <Text style={style} {...rest}>
      {prefix}
      {displayText}
      {suffix}
    </Text>
  );
}
