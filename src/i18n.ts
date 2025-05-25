import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 파일들을 import
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";

const getSavedLanguage = () => {
  return sessionStorage.getItem("language") || "ko"; // 세션에 언어가 없으면 기본값 'ko'로 설정
};

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  zh: { translation: zh },
  ja: { translation: ja },
};

i18n
  .use(initReactI18next) // i18next를 React에서 사용할 수 있게 설정
  .init({
    resources,
    lng: getSavedLanguage(), // 기본 언어 설정
    fallbackLng: "ko", // 지원하지 않는 언어를 요청할 경우 사용할 언어
    interpolation: {
      escapeValue: false, // React는 기본적으로 XSS 방지 처리가 되어 있으므로 비활성화
    },
  });

export default i18n;
