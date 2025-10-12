"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RefreshCw, X, Globe, Sparkles, Loader2, Maximize, Minimize, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translations, Language } from "@/lib/translations";
import type { ProfileData } from "@/lib/data";
import { generateAnswerFromScreenshot } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const USER_ID_KEY = "global_insights_user_id";

export function SurveyBrowserView({ lang, profile, onClose }: SurveyBrowserViewProps) {
  const [urlInput, setUrlInput] = useState("");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For AI analysis
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { toast } = useToast();
  const t = translations[lang];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);
  
  const navigateTo = useCallback((url: string) => {
    setIsIframeLoading(true);
    setLoadError(null);
    let finalUrl = url.trim();

    if (!finalUrl) {
      setIsIframeLoading(false);
      return;
    };

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    
    setUrlInput(finalUrl);
    setCurrentUrl(finalUrl);

    // Set a timeout to detect if the iframe fails to load
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
        handleIframeError();
    }, 10000); // 10-second timeout

  }, []);
  
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateTo(urlInput);
  };
  
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
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsIframeLoading(false);
    try {
        if (iframeRef.current?.contentWindow) {
            const iframeUrl = iframeRef.current.contentWindow.location.href;
            // 'about:blank' can be a sign of a failed navigation due to X-Frame-Options
            if (iframeUrl && iframeUrl !== 'about:blank') {
                setUrlInput(iframeUrl);
                setLoadError(null);
            } else {
               handleIframeError();
            }
        }
    } catch(e) {
        handleIframeError();
    }
  };

  const handleIframeError = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsIframeLoading(false);
    setLoadError(t.browser.loadError);
  };

  const openInNewTab = () => {
    if(currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  }

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
            disabled={isLoading || isIframeLoading || !currentUrl || !!loadError}
            aria-label="Analyze Screen"
          >
            {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Sparkles className="h-7 w-7" />}
         </Button>
      </div>

      {/* Header / Control Bar */}
      <div className="flex items-center p-2 border-b gap-2 bg-muted/50 rounded-t-lg flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={!currentUrl}>
          <RefreshCw />
        </Button>
        <div className="relative flex-grow">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <form onSubmit={handleUrlSubmit}>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-background ps-10"
              placeholder={t.browser.urlPlaceholder}
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
      <div className="flex-grow flex items-center justify-center relative overflow-auto bg-white">
        {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        )}

        {!currentUrl && !isIframeLoading && !loadError && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>{t.browser.startBrowsingTitle}</CardTitle>
                <CardDescription>{t.browser.startBrowsingDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                  <Input 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g., prolific.co"
                  />
                  <Button type="submit">{t.browser.go}</Button>
                </form>
                 <p className="text-xs text-muted-foreground mt-4">{t.browser.securityNote}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {loadError && !isIframeLoading && (
            <div className="text-center text-destructive p-4 z-10 flex flex-col items-center gap-4">
                 <X className="mx-auto h-12 w-12"/>
                 <p className="max-w-sm">{loadError}</p>
                 <Button variant="default" onClick={openInNewTab}>
                    <ExternalLink className="me-2"/>
                    {t.browser.openInNewTab}
                 </Button>
                 <Button variant="link" onClick={() => { setLoadError(null); setCurrentUrl(null); setUrlInput('')}}>
                    {t.browser.goBack}
                 </Button>
            </div>
        )}

        {currentUrl && (
            <iframe
                key={currentUrl}
                ref={iframeRef}
                src={currentUrl}
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
