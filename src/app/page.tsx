
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Flame, BookMarked, BookOpen, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ManualAssistantPage } from "@/components/manual-assistant-page";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserStatus, verifyDevice } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

const auth = getAuth(app);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const { status } = await getUserStatus(user.uid);
        const { isVerified } = await verifyDevice(user.uid);
        
        if (status === 'inactive') {
          router.push('/blocked');
        } else if (!isVerified) {
           router.push('/blocked?reason=device_mismatch');
        } else {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
      setDir(newDir);
    }

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newDir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      document.documentElement.dir = newDir;
      setDir(newDir);
      localStorage.setItem("global_insights_lang", lang);
    }
  }, [lang]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const t = translations[lang];

  if (loading || !user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
         <div className="w-full max-w-7xl space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
         </div>
       </div>
    );
  }
  
  return (
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <header className="w-full max-w-7xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
              {t.appName}
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
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
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t.auth.logout}>
              <LogOut className="h-5 w-5" />
            </Button>
            <LanguageToggle lang={lang} setLang={setLang} />
            <ThemeToggle />
          </div>
        </header>

        <main className="w-full max-w-7xl">
          <ManualAssistantPage lang={lang} />
        </main>

        <footer className="w-full max-w-7xl mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} {t.appName}. {t.footer}</p>
        </footer>
      </div>
  );
}
