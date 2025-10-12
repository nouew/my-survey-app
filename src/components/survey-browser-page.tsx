"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile-form";
import { ProfileData } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { Rocket, Search } from "lucide-react";

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
        // If profile exists, maybe we want to go straight to browser view
        // setShowBrowser(true); 
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
    return (
      <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="text-primary" />
          {t.browser.title}
        </CardTitle>
        <CardDescription>
          {t.browser.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed">
          <p>{t.browser.inDevelopment}</p>
        </div>
         <Button onClick={() => setShowBrowser(false)} variant="outline" className="mt-4">
            {t.browser.backToProfile}
        </Button>
      </CardContent>
    </Card>
    )
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
                <Button onClick={() => setShowBrowser(true)} disabled={!profile}>
                     <Rocket className="me-2"/>
                    {t.browser.startBrowsing}
                </Button>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
