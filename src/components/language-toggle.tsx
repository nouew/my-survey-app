"use client";

import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import type { Language } from "@/lib/translations";

interface LanguageToggleProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  const toggleLanguage = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        Switch to {lang === "en" ? "Arabic" : "English"}
      </span>
    </Button>
  );
}
