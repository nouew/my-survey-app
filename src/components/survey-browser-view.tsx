
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, X, Globe, Sparkles, Loader2, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translations, Language } from "@/lib/translations";
import type { ProfileData } from "@/lib/data";
import { generateAnswerFromScreenshot } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


const USER_ID_KEY = "global_insights_user_id";

interface SurveyBrowserViewProps {
  lang: Language;
  profile: ProfileData | null;
  onClose: () => void;
}

export function SurveyBrowserView({ lang, profile, onClose }: SurveyBrowserViewProps) {
  const [url, setUrl] = useState("https://www.google.com");
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const t = translations[lang];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);

    import('html2canvas').then(module => {
        (window as any).html2canvas = module.default;
    }).catch(error => console.error("Failed to load html2canvas", error));

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);

  }, []);

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (!finalUrl) return;

    const isUrl = /^(https?:\/\/)|([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(finalUrl);

    if (isUrl) {
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    }
    
    setDisplayUrl(finalUrl);
    setIsIframeLoading(true);
  };
  
  const handleRefresh = () => {
    if (iframeRef.current) {
        setIsIframeLoading(true);
        iframeRef.current.src = iframeRef.current.src;
    }
  }

  const toggleFullscreen = useCallback(() => {
    if (!viewRef.current) return;
    
    if (!document.fullscreenElement) {
        viewRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);
  
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
          // Temporarily expand the container to capture the full page content
          const originalHeight = containerRef.current.style.height;
          const scrollHeight = iframeRef.current.contentWindow.document.body.scrollHeight;
          containerRef.current.style.height = `${scrollHeight}px`;
          
          await new Promise(resolve => setTimeout(resolve, 50)); // Allow repaint

          const canvas = await html2canvas(iframeRef.current.contentWindow.document.body, {
            useCORS: true,
            allowTaint: true,
            height: scrollHeight,
            windowHeight: scrollHeight
          });

          // Restore container height
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
          // Ensure height is restored even on error
          if (containerRef.current) {
            containerRef.current.style.height = containerRef.current.style.height;
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div 
        ref={viewRef}
        className={cn(
            "w-full h-[80vh] flex flex-col bg-card border rounded-lg shadow-lg relative",
            isFullscreen && "fixed inset-0 z-50 h-screen"
        )}
    >
      <div className="absolute bottom-20 end-6 z-20">
         <Button 
            size="lg" 
            className="rounded-full h-16 w-16 shadow-2xl" 
            onClick={handleAnalyzeClick} 
            disabled={isLoading || isIframeLoading || !displayUrl}
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
              placeholder={lang === "ar" ? "ابحث في جوجل أو أدخل عنوان URL" : "Search Google or enter URL"}
            />
          </form>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div ref={containerRef} className="flex-grow flex items-center justify-center relative overflow-auto bg-muted/20">
         {isIframeLoading && displayUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
         )}
         
         {!displayUrl && (
            <div className="text-center text-muted-foreground">
                <Globe className="mx-auto h-12 w-12 mb-4"/>
                <p>{lang === 'ar' ? 'اكتب في الشريط أعلاه للبحث في جوجل أو إدخال رابط موقع' : 'Type in the bar above to search Google or enter a website URL'}</p>
            </div>
         )}

         {displayUrl && (
            <iframe
                ref={iframeRef}
                src={displayUrl}
                className={cn("w-full h-full border-0", isIframeLoading && "opacity-0")}
                title="Survey Browser"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
                onLoad={() => setIsIframeLoading(false)}
                onError={() => {
                    setIsIframeLoading(false);
                    toast({
                        variant: "destructive",
                        title: "Load Error",
                        description: "Could not load the website. It might be blocking embedded browsers.",
                    });
                }}
            />
         )}
      </div>
      
      {/* Footer */}
      <div className={cn("flex justify-end p-2 border-t rounded-b-lg bg-muted/50 flex-shrink-0", isFullscreen && "hidden")}>
          <Button onClick={onClose} variant="destructive">
            <X className="me-2" />
            {lang === "ar" ? "إغلاق المتصفح" : "Close Browser"}
          </Button>
      </div>
    </div>
  );
}
