
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, type User, type Auth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { Flame, BookMarked, BookOpen, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ManualAssistantPage } from "@/components/manual-assistant-page";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function getDeviceId(): Promise<string> {
    // This function can only run on the client, so we can safely assume window is available.
    const userAgent = window.navigator.userAgent || 'unknown';
    // NOTE: IP address is not available on the client. We'll use user-agent as a simplified device ID.
    // In a real production scenario, a more robust client-side fingerprinting library might be used.
    return userAgent;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");
  const [auth, setAuth] = useState<Auth | null>(null);


  useEffect(() => {
    if (!app || !db) {
        setLoading(false); // If firebase is not configured, don't show loading screen
        return;
    };
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user status and verify device on the client
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === 'inactive') {
              router.push('/blocked');
              return;
            }
            
            // Device verification logic now on client
            const currentDeviceId = await getDeviceId();
            if (userData.status === 'active' && userData.deviceId && userData.deviceId !== currentDeviceId) {
              router.push('/blocked?reason=device_mismatch');
              return;
            }
          } else {
             // This case might happen if document creation fails, direct to blocked.
             router.push('/blocked');
             return;
          }

          setLoading(false);

        } catch (error) {
            console.error("Error verifying user status:", error);
            // If we can't read the doc, it's a permissions issue or user is new.
            // For a new user, the doc doesn't exist, which is fine, but they start as inactive.
            // Let's redirect to blocked page as a safe fallback.
             router.push('/blocked');
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
      localStorage.setItem("global_insights_lang", lang);
    }
  }, [lang]);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/login');
    }
  };

  const t = translations[lang];

  if (loading && auth) { // Only show loading if firebase is configured
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
            {auth && user && (
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t.auth.logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
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
