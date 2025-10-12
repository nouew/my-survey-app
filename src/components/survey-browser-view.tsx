"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, X, Globe, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translations, Language } from "@/lib/translations";
import type { ProfileData } from "@/lib/data";
import { generateAnswerFromScreenshot } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const USER_ID_KEY = "global_insights_user_id";

interface SurveyBrowserViewProps {
  lang: Language;
  profile: ProfileData | null;
  onClose: () => void;
}

export function SurveyBrowserView({ lang, profile, onClose }: SurveyBrowserViewProps) {
  const [url, setUrl] = useState("https://attapoll.com");
  const [displayUrl, setDisplayUrl] = useState(url);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const { toast } = useToast();
  const t = translations[lang];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we have a unique user ID for the session for the AI flow
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);

    // Dynamic import for html2canvas
    import('html2canvas').then(module => {
        (window as any).html2canvas = module.default;
    }).catch(error => console.error("Failed to load html2canvas", error));

  }, []);

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let finalUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      finalUrl = "https://" + url;
    }
    setDisplayUrl(finalUrl);
    setIsIframeLoaded(false); // Reset loading state for new URL
  };
  
  const handleRefresh = () => {
    if (iframeRef.current) {
        setIsIframeLoaded(false);
        iframeRef.current.src = iframeRef.current.src;
    }
  }
  
  const handleAnalyzeClick = async () => {
      if (!iframeRef.current?.contentWindow || !containerRef.current) {
          toast({ variant: "destructive", title: "Error", description: "Browser content is not accessible." });
          return;
      }
      
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
          toast({ variant: "destructive", title: "Error", description: "Screenshot library not loaded yet." });
          return;
      }

      if (!profile || !userId) {
          toast({ variant: "destructive", title: "Profile Error", description: "Your profile must be set to use the assistant." });
          return;
      }

      setIsLoading(true);
      try {
          // Temporarily set the iframe container to a large size to capture full content
          const originalHeight = containerRef.current.style.height;
          const scrollHeight = iframeRef.current.contentWindow.document.body.scrollHeight;
          containerRef.current.style.height = `${scrollHeight}px`;
          
          await new Promise(resolve => setTimeout(resolve, 50)); // allow repaint

          const canvas = await html2canvas(iframeRef.current.contentWindow.document.body, {
            useCORS: true,
            allowTaint: true,
            height: scrollHeight,
            windowHeight: scrollHeight
          });

          // Restore original height
          containerRef.current.style.height = originalHeight;

          const dataUrl = canvas.toDataURL("image/png");
          
          const result = await generateAnswerFromScreenshot(userId, dataUrl, profile);

          if (result.error) {
              toast({ variant: "destructive", title: "AI Error", description: result.error });
          } else {
              toast({
                  title: "AI Suggested Answer",
                  description: result.answer,
                  duration: 9000,
              });
          }

      } catch (error) {
          console.error("Error capturing or analyzing screenshot:", error);
          toast({ variant: "destructive", title: "Capture Error", description: "Could not capture screen. The website's policy might be blocking it." });
          if (containerRef.current) {
            containerRef.current.style.height = containerRef.current.style.height; // try to restore
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="w-full h-[80vh] flex flex-col bg-card border rounded-lg shadow-lg relative">
      {/* Floating Action Button */}
      <div className="absolute bottom-20 end-6 z-20">
         <Button 
            size="lg" 
            className="rounded-full h-16 w-16 shadow-2xl" 
            onClick={handleAnalyzeClick} 
            disabled={isLoading || !isIframeLoaded}
            aria-label="Analyze Screen"
          >
            {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Sparkles className="h-7 w-7" />}
         </Button>
      </div>


      {/* Header / Control Bar */}
      <div className="flex items-center p-2 border-b gap-2 bg-muted/50 rounded-t-lg flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => iframeRef.current?.contentWindow?.history.back()} >
          <ArrowLeft />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => iframeRef.current?.contentWindow?.history.forward()}>
          <ArrowRight />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
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
      <div ref={containerRef} className="flex-grow flex items-center justify-center relative overflow-auto">
         {!isIframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
         )}
         <iframe
            ref={iframeRef}
            src={displayUrl}
            className="w-full h-full border-0"
            title="Survey Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsIframeLoaded(true)}
            onError={() => {
                setIsIframeLoaded(true); // Stop loading indicator even on error
                 toast({
                    variant: "destructive",
                    title: "Load Error",
                    description: "Could not load the website. It might be blocking embedded browsers.",
                });
            }}
          />
      </div>
      
      {/* Footer */}
      <div className="flex justify-end p-2 border-t rounded-b-lg bg-muted/50 flex-shrink-0">
          <Button onClick={onClose} variant="destructive">
            <X className="me-2" />
            {lang === "ar" ? "إغلاق المتصفح" : "Close Browser"}
          </Button>
      </div>
    </div>
  );
}
