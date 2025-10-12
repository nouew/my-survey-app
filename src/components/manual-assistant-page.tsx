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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
  
  if (!isClient) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                {/* Skeleton for ProfileForm */}
            </div>
            <div className="lg:col-span-2">
                {/* Skeleton for Assistant */}
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <ProfileForm
          onSave={handleProfileSave}
          initialProfile={profile}
          lang={lang}
          storageKey={PROFILE_KEY}
        />
      </div>
      <div className="lg:col-span-2">
        <Assistant profile={profile} lang={lang} />
      </div>
    </div>
  );
}
