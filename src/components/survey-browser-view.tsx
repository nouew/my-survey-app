"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, X, Search, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translations, Language } from "@/lib/translations";
import type { ProfileData } from "@/lib/data";

interface SurveyBrowserViewProps {
  lang: Language;
  profile: ProfileData | null;
  onClose: () => void;
}

export function SurveyBrowserView({ lang, profile, onClose }: SurveyBrowserViewProps) {
  const [url, setUrl] = useState("https://attapoll.com");
  const [displayUrl, setDisplayUrl] = useState(url);
  const t = translations[lang];

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let finalUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      finalUrl = "https://" + url;
    }
    setDisplayUrl(finalUrl);
  };

  return (
    <div className="w-full h-[80vh] flex flex-col bg-card border rounded-lg shadow-lg">
      {/* Header / Control Bar */}
      <div className="flex items-center p-2 border-b gap-2 bg-muted/50 rounded-t-lg">
        <Button variant="ghost" size="icon" disabled>
          <ArrowLeft />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <ArrowRight />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <RefreshCw />
        </Button>
        <div className="relative flex-grow">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <form onSubmit={handleUrlSubmit}>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-background ps-10"
              placeholder="https://example.com"
            />
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p>{t.browser.inDevelopment}</p>
        </div>
        {/*
          When ready, the iframe will go here, like this:
          <iframe
            src={displayUrl}
            className="w-full h-full border-0"
            title="Survey Browser"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        */}
      </div>
      
      {/* Footer */}
      <div className="flex justify-end p-2 border-t rounded-b-lg bg-muted/50">
          <Button onClick={onClose} variant="destructive">
            <X className="me-2" />
            {lang === "ar" ? "إغلاق المتصفح" : "Close Browser"}
          </Button>
      </div>
    </div>
  );
}
