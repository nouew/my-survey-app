"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileForm } from "@/components/profile-form";
import { Assistant } from "@/components/assistant";
import { ProfileData } from "@/lib/data";
import type { Language } from "@/lib/translations";

const PROFILE_KEY = "global_insights_profile_data_manual";

interface ManualAssistantPageProps {
  lang: Language;
}

export function ManualAssistantPage({ lang }: ManualAssistantPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
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
  }, []);

  const handleProfileSave = useCallback((data: ProfileData) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);

  return (
    <>
      <ProfileForm
        onSave={handleProfileSave}
        initialProfile={profile}
        lang={lang}
        storageKey={PROFILE_KEY}
      />
      <Assistant profile={profile} lang={lang} />
    </>
  );
}
