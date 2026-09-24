
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English Translations
const en = {
  translation: {
    nav: {
      home: "Home",
      howItWorks: "How It Works",
      impact: "Our Impact",
      findFood: "Find Food",
      dashboard: "Dashboard",
      login: "Log in",
      signup: "Sign up"
    },
    hero: {
      badge: "Zero Waste Initiative",
      title1: "Good food deserves",
      title2: "another plate.",
      subtitle: "Connect surplus food from commercial kitchens with NGOs and individuals in need. Stop waste, start feeding.",
      ctaPrimary: "Find Food Now",
      ctaSecondary: "Partner With Us"
    }
  }
};

// Hindi Translations
const hi = {
  translation: {
    nav: {
      home: "????? ?????",
      howItWorks: "?? ???? ??? ???? ??",
      impact: "????? ??????",
      findFood: "???? ?????",
      dashboard: "????????",
      login: "??? ??",
      signup: "???? ??"
    },
    hero: {
      badge: "????? ??????? ???",
      title1: "????? ???? ????? ??",
      title2: "?? ?? ???? ???",
      subtitle: "?????????? ???? ?? ??? ??? ???? ?? ???????? ????? ?? ?????????? ?? ??????? ??????? ?????, ?????? ???? ?????",
      ctaPrimary: "??? ???? ?????",
      ctaSecondary: "????? ??? ??????"
    }
  }
};

// Spanish Translations
const es = {
  translation: {
    nav: {
      home: "Inicio",
      howItWorks: "Cómo funciona",
      impact: "Nuestro Impacto",
      findFood: "Buscar Comida",
      dashboard: "Panel",
      login: "Iniciar sesión",
      signup: "Regístrate"
    },
    hero: {
      badge: "Iniciativa Cero Residuos",
      title1: "La buena comida merece",
      title2: "otro plato.",
      subtitle: "Conecte el excedente de alimentos de las cocinas comerciales con ONG y personas necesitadas. Detén el desperdicio, empieza a alimentar.",
      ctaPrimary: "Encuentra comida ahora",
      ctaSecondary: "Asóciate con nosotros"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      hi,
      es
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

