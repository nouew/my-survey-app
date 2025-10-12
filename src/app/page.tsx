"use client";

import { useState, useEffect } from "react";
import { Flame, BookUser, Search } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ManualAssistantPage } from "@/components/manual-assistant-page";
import { SurveyBrowserPage } from "@/components/survey-browser-page";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type Mode = "manual" | "browser";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [dir, setDir] = useState<Direction>("ltr");
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<Mode>("manual");

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      const newDir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      document.documentElement.dir = newDir;
      setDir(newDir);
    }
  }, [lang]);

  const t = translations[lang];

  if (!isClient) {
    return null; // or a loading skeleton
  }
  
  const isArabic = lang === 'ar';

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <header className="w-full max-w-5xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">
              {t.appName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant={mode === 'manual' ? 'default' : 'outline'} 
                        onClick={() => setMode('manual')}
                        aria-label={isArabic ? "المساعد اليدوي" : "Manual Assistant"}
                    >
                        <BookUser className="h-5 w-5" />
                        <span className="hidden md:inline-block md:ms-2">
                            {isArabic ? "يدوي" : "Manual"}
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isArabic ? "المساعد اليدوي" : "Manual Assistant"}</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant={mode === 'browser' ? 'default' : 'outline'} 
                        onClick={() => setMode('browser')}
                        aria-label={isArabic ? "متصفح الاستبيانات" : "Survey Browser"}
                    >
                        <Search className="h-5 w-5" />
                         <span className="hidden md:inline-block md:ms-2">
                           {isArabic ? "متصفح" : "Browser"}
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isArabic ? "متصفح الاستبيانات" : "Survey Browser"}</p>
                </TooltipContent>
            </Tooltip>

            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </header>

        <main className="w-full max-w-5xl flex flex-col gap-8">
          {mode === 'manual' && <ManualAssistantPage lang={lang} />}
          {mode === 'browser' && <SurveyBrowserPage lang={lang} />}
        </main>

        <footer className="w-full max-w-5xl mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Global Insights Assistant. {t.footer}</p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
