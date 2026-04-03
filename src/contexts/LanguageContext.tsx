import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getTranslation, LANGUAGE_LABELS } from '@/i18n';
import type { TranslationKeys, Language } from '@/i18n/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'sq',
  setLanguage: () => {},
  t: (key) => key,
});

const STORAGE_KEY = 'pulse-ai-lang';

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LANGUAGE_LABELS) return stored as Language;
  } catch {}
  return 'sq';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<TranslationKeys>(() => getTranslation(getInitialLanguage()));

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    setTranslations(getTranslation(lang));
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, []);

  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[key] || key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
