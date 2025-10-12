"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileForm } from "@/components/profile-form";
import { Assistant } from "@/components/assistant";
import { LanguageToggle } from "@/components/language-toggle";
import { translations, Language, Direction } from "@/lib/translations";
import { ProfileData } from "@/lib/data";
import { Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrowserAssistant } from "@/components/browser-assistant";

const USER_ID_KEY = "global_insights_user_id";
const PROFILE_KEY = "global_insights_profile_data";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [dir, setDir] = useState<Direction>("ltr");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      // Set language and direction
      const newDir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      document.documentElement.dir = newDir;
      setDir(newDir);

      // Manage User ID
      if (!localStorage.getItem(USER_ID_KEY)) {
        localStorage.setItem(USER_ID_KEY, `user_${Date.now()}`);
      }

      // Load Profile
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error("Failed to parse profile data:", error);
          localStorage.removeItem(PROFILE_KEY);
        }
      }
    }
  }, [lang]);

  const handleProfileSave = useCallback((data: ProfileData) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);
  
  const t = translations[lang];

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">
            {t.appName}
          </h1>
        </div>
        <LanguageToggle lang={lang} setLang={setLang} />
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-8">
        <ProfileForm
          onSave={handleProfileSave}
          initialProfile={profile}
          lang={lang}
        />
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Assistant</TabsTrigger>
            <TabsTrigger value="browser">Browser Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Assistant profile={profile} lang={lang} />
          </TabsContent>
          <TabsContent value="browser">
            <BrowserAssistant lang={lang} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Global Insights Assistant. {t.footer}</p>
      </footer>
    </div>
  );
}
