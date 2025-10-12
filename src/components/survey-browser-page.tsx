"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileForm } from "@/components/profile-form";
import { ProfileData } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { Search, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SurveyBrowserView } from "@/components/survey-browser-view";

const PROFILE_KEY = "global_insights_profile_data_browser";

interface SurveyBrowserPageProps {
  lang: Language;
}

export function SurveyBrowserPage({ lang }: SurveyBrowserPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    // Load Profile for browser mode
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error("Failed to parse browser profile data:", error);
        localStorage.removeItem(PROFILE_KEY);
      }
    }
  }, []);

  const handleProfileSave = useCallback((data: ProfileData) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);

  if (showBrowser) {
    return <SurveyBrowserView lang={lang} profile={profile} onClose={() => setShowBrowser(false)} />;
  }

  return (
    <div className="w-full space-y-8">
      <ProfileForm
        onSave={handleProfileSave}
        initialProfile={profile}
        lang={lang}
        storageKey={PROFILE_KEY}
        title={t.browser.profileTitle}
        description={t.browser.profileDescription}
      />
      
      {profile && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search />
                    {t.browser.readyTitle}
                </CardTitle>
                 <CardDescription>{t.browser.readyDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setShowBrowser(true)}>
                     <Rocket className="me-2"/>
                    {t.browser.startBrowsing}
                </Button>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
