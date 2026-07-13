"use client";

import { useLang } from "@/lib/i18n";

// Two-way segmented switch — EN / ID. Lives in Settings only.
export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full bg-ink/[.06] p-1">
      {(["en", "id"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
            lang === l ? "bg-white text-ink shadow-sm" : "text-muted"
          }`}
        >
          {l === "en" ? "EN" : "ID"}
        </button>
      ))}
    </div>
  );
}
