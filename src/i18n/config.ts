import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import bn from "./locales/bn.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";

const LOCALE_KEY = "tpt-locale";

function detectLocale(): string {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored) return stored;
  } catch { /* unavailable */ }
  try {
    const nav = navigator.language?.split("-")[0];
    if (["en", "bn", "de", "es", "fr", "zh"].includes(nav)) return nav;
  } catch { /* ignore */ }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, bn: { translation: bn }, de: { translation: de }, es: { translation: es }, fr: { translation: fr }, zh: { translation: zh } },
  lng: detectLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export function setLocale(locale: string) {
  i18n.changeLanguage(locale);
  try { localStorage.setItem(LOCALE_KEY, locale); } catch { /* unavailable */ }
  document.documentElement.lang = locale;
}

export default i18n;
