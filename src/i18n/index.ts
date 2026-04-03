import { sq } from './sq';
import { en } from './en';
import type { TranslationKeys, Language } from './types';

const translations: Record<string, TranslationKeys> = { sq, en };

// For languages not yet translated, fall back to English then Albanian
export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang] || translations.en || translations.sq;
}

export type { TranslationKeys, Language };
export { LANGUAGE_LABELS } from './types';
