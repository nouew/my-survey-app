
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
  const [urlInput, setUrlInput] = useState("https://www.google.com");
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For AI analysis
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { toast } = useToast();
  const t = translations[lang];
  const iframeRef = useRef<HTMLIFrameElement>(null);
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

  const navigateTo = (url: string) => {
    setIsIframeLoading(true);
    setLoadError(null);
    let finalUrl = url.trim();

    const isUrl = /^(https?:\/\/)|([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(finalUrl);

    if (isUrl) {
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    }
    
    setUrlInput(finalUrl);
    setIframeSrc(finalUrl);
  };
  
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!urlInput) return;
    navigateTo(urlInput);
  };

  const goBack = () => iframeRef.current?.contentWindow?.history.back();
  const goForward = () => iframeRef.current?.contentWindow?.history.forward();
  
  const handleRefresh = () => {
    if (iframeRef.current) {
        setIsIframeLoading(true);
        setLoadError(null);
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
      if (!iframeRef.current?.contentWindow) {
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
          // Temporarily set scroll to top to capture the visible part
          iframeRef.current.contentWindow.document.documentElement.scrollTop = 0;
          
          const canvas = await html2canvas(iframeRef.current.contentWindow.document.body, {
            useCORS: true,
            allowTaint: true,
            height: iframeRef.current.contentWindow.innerHeight,
            windowHeight: iframeRef.current.contentWindow.innerHeight,
          });

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
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleIframeLoad = () => {
    setIsIframeLoading(false);
    try {
        if (iframeRef.current?.contentWindow) {
            const iframeUrl = iframeRef.current.contentWindow.location.href;
            if (iframeUrl && iframeUrl !== 'about:blank' && !iframeUrl.startsWith('https://www.google.com/search')) {
                setUrlInput(iframeUrl);
            }
        }
    } catch(e) {
        // Cross-origin error, can't access location, which is fine.
    }
  };

  const handleIframeError = () => {
    setIsIframeLoading(false);
    setLoadError(lang === 'ar' ? 'لا يمكن تحميل هذا الموقع. قد تكون سياسة أمان الموقع تمنع عرضه في إطار.' : 'Could not load this website. The site\'s security policy may be blocking it from being displayed in a frame.');
  };

  return (
    <div 
        ref={viewRef}
        className={cn(
            "w-full h-[80vh] flex flex-col bg-card border rounded-lg shadow-lg relative",
            isFullscreen && "fixed inset-0 z-50 h-screen"
        )}
    >
      <div className="absolute bottom-4 end-4 z-20 flex flex-col gap-2">
         <Button 
            size="lg" 
            className="rounded-full h-16 w-16 shadow-2xl" 
            onClick={handleAnalyzeClick} 
            disabled={isLoading || isIframeLoading || !iframeSrc || !!loadError}
            aria-label="Analyze Screen"
          >
            {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Sparkles className="h-7 w-7" />}
         </Button>
      </div>


      {/* Header / Control Bar */}
      <div className="flex items-center p-2 border-b gap-2 bg-muted/50 rounded-t-lg flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={goBack} disabled={!iframeSrc}>
          <ArrowLeft />
        </Button>
        <Button variant="ghost" size="icon" onClick={goForward} disabled={!iframeSrc}>
          <ArrowRight />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={!iframeSrc}>
          <RefreshCw />
        </Button>
        <div className="relative flex-grow">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <form onSubmit={handleUrlSubmit}>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-background ps-10"
              placeholder={lang === "ar" ? "ابحث في جوجل أو أدخل عنوان URL" : "Search Google or enter URL"}
            />
          </form>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
         <Button onClick={onClose} variant="ghost" size="icon" className={cn("text-destructive hover:text-destructive hover:bg-destructive/10", isFullscreen && "hidden")}>
            <X />
          </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center relative overflow-auto bg-muted/20">
         {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
         )}
         
         {!iframeSrc && !isIframeLoading && (
            <div className="text-center text-muted-foreground p-4">
                <Globe className="mx-auto h-12 w-12 mb-4"/>
                <p>{lang === 'ar' ? 'اكتب في الشريط أعلاه للبحث في جوجل أو إدخال رابط موقع' : 'Type in the bar above to search Google or enter a website URL'}</p>
            </div>
         )}
         
         {loadError && !isIframeLoading && (
            <div className="text-center text-destructive p-4">
                 <X className="mx-auto h-12 w-12 mb-4"/>
                 <p>{loadError}</p>
                 <Button variant="link" onClick={() => { setLoadError(null); setIframeSrc(null); }}>
                    {lang === 'ar' ? 'حاول مرة أخرى' : 'Try again'}
                 </Button>
            </div>
         )}

         {iframeSrc && (
            <iframe
                key={iframeSrc} // Add key to force re-creation
                ref={iframeRef}
                src={iframeSrc}
                className={cn("w-full h-full border-0", (isIframeLoading || !!loadError) && "opacity-0")}
                title="Survey Browser"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
            />
         )}
      </div>
      
    </div>
  );
}
