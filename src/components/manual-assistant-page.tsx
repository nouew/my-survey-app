
"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile-form";
import { Assistant } from "@/components/assistant";
import { ProfileData } from "@/lib/data";
import type { Language } from "@/lib/translations";

interface ManualAssistantPageProps {
  lang: Language;
  username: string;
}

export function ManualAssistantPage({ lang, username }: ManualAssistantPageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const handleProfileUpdate = (data: ProfileData | null) => {
    setProfile(data);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <ProfileForm
          onSave={handleProfileUpdate}
          onProfileLoad={handleProfileUpdate}
          lang={lang}
        />
      </div>
      <div className="lg:col-span-2">
        <Assistant profile={profile} lang={lang} username={username} />
      </div>
    </div>
  );
}
