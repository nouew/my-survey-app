
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, type User, type Auth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { Flame, BookMarked, BookOpen, LogOut, UserCog, Loader2 } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ManualAssistantPage } from "@/components/manual-assistant-page";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  status: 'active' | 'inactive';
  deviceId?: string;
  isAdmin?: boolean;
}

async function getDeviceId(): Promise<string> {
    const userAgent = window.navigator.userAgent || 'unknown';
    return userAgent;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");
  const [auth, setAuth] = useState<Auth | null>(null);


  useEffect(() => {
    if (!app || !db) {
        setLoading(false);
        return;
    };
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);

            // **CRITICAL FIX**: Use return to stop execution after redirection.
            if (data.isAdmin) {
                router.push('/admin');
                return; 
            }

            if (data.status === 'inactive') {
              router.push('/blocked');
              return;
            }
            
            const currentDeviceId = await getDeviceId();
            if (data.status === 'active' && data.deviceId && data.deviceId !== currentDeviceId) {
              router.push('/blocked?reason=device_mismatch');
              return;
            }
            
            setLoading(false);

          } else {
             // If document doesn't exist yet, it might still be creating.
             // A better approach would be to wait or handle this state.
             // For now, redirecting to blocked is a safe default.
             router.push('/blocked');
             return;
          }

        } catch (error) {
            console.error("Error verifying user status:", error);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading || userData?.isAdmin) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
         <div className="w-full max-w-7xl space-y-8">
            <header className="w-full max-w-7xl flex justify-between items-center">
              <Skeleton className="h-12 w-1/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </header>
            <div className="text-center py-16">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Redirecting...</p>
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
            {userData?.isAdmin && (
               <Link href="/admin">
                <Button variant="ghost" size="icon" aria-label={t.auth.admin.title}>
                    <UserCog className="h-5 w-5" />
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
