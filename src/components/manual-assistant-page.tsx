
"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileForm } from "@/components/profile-form";
import { Assistant } from "@/components/assistant";
import { ProfileData } from "@/lib/data";
import type { Language } from "@/lib/translations";

const PROFILE_KEY_PREFIX = "global_insights_profile_";

interface ManualAssistantPageProps {
  lang: Language;
  username: string;
}

export function ManualAssistantPage({ lang, username }: ManualAssistantPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isClient, setIsClient] = useState(false);

  const getProfileKey = useCallback(() => `${PROFILE_KEY_PREFIX}${username}`, [username]);

  useEffect(() => {
    setIsClient(true);
    // Load Profile for the specific user
    const savedProfile = localStorage.getItem(getProfileKey());
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Failed to parse profile data:", error);
        localStorage.removeItem(getProfileKey());
      }
    } else {
        setProfile(null);
    }
  }, [username, getProfileKey]);

  const handleProfileSave = useCallback((data: ProfileData) => {
    localStorage.setItem(getProfileKey(), JSON.stringify(data));
    setProfile(data);
  }, [getProfileKey]);
  
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
          lang={lang}
          storageKey={getProfileKey()}
        />
      </div>
      <div className="lg:col-span-2">
        <Assistant profile={profile} lang={lang} username={username} />
      </div>
    </div>
  );
}

