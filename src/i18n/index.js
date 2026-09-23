import en from './en';
import te from './te';
import hi from './hi';
import ta from './ta';
import kn from './kn';
import mr from './mr';

export const translations = {
  en,
  te,
  hi,
  ta,
  kn,
  mr
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

export const DEFAULT_LANGUAGE = 'en';

/**
 * Returns translated string for a given language code and key.
 * Automatically falls back to English, and then the key itself,
 * guaranteeing no blank or missing text.
 *
 * @param {string} lang - Language code ('en' | 'te' | 'hi' | 'ta' | 'kn' | 'mr')
 * @param {string} key - Translation key
 * @returns {string}
 */
export function getTranslation(lang, key) {
  if (!key) return '';
  return translations[lang]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
}

export default translations;
