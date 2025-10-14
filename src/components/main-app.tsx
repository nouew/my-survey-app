
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Flame, BookMarked, BookOpen, LogOut, Shield } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ManualAssistantPage } from "@/components/manual-assistant-page";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteCookie } from 'cookies-next';

interface MainAppProps {
    username: string;
}

export function MainApp({ username }: MainAppProps) {
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");
  const router = useRouter();
  const isAdmin = username.toLowerCase() === 'admin';

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
      setDir(newDir);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newDir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      document.documentElement.dir = newDir;
      localStorage.setItem("global_insights_lang", lang);
      setDir(newDir);
    }
  }, [lang]);

  const handleLogout = () => {
    deleteCookie('username');
    deleteCookie('uid');
    router.push('/login');
  };

  const t = translations[lang];

  return (
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8" dir={dir}>
        <header className="w-full max-w-7xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
              {t.appName}
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
                 <Link href="/admin">
                    <Button variant="ghost" size="icon" aria-label="Admin Panel">
                        <Shield className="h-5 w-5" />
                    </Button>
                </Link>
            )}
            <Link href="/course">
                <Button variant="ghost" size="icon" aria-label={t.course.title}>
                    <BookOpen className="h-5 w-5" />
                </Button>
            </Link>
            <Link href="/sites">
                <Button variant="ghost" size="icon" aria-label={t.sites.title}>
                    <BookMarked className="h-5 w-5" />
                </Button>
            </Link>
            <LanguageToggle lang={lang} setLang={setLang} />
            <ThemeToggle />
             <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t.auth.logout}>
                <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="w-full max-w-7xl">
          <ManualAssistantPage lang={lang} username={username} />
        </main>

        <footer className="w-full max-w-7xl mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} {t.appName}. {t.footer}</p>
        </footer>
      </div>
  );
}
