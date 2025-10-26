import { useState } from "react";
import { useTranslation } from "react-i18next";

type Language = "en" | "vi";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
      >
        {currentLang === "en" ? "🇺🇸 English" : "🇻🇳 Tiếng Việt"}
        <svg
          className="h-4 w-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => changeLanguage("en")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => changeLanguage("vi")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            🇻🇳 Tiếng Việt
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
