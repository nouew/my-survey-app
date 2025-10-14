
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Lightbulb, Loader2, AlertCircle, X } from "lucide-react";
import { generatePerfectAnswer } from "@/ai/flows/generate-perfect-answer";
import type { ProfileData } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";
import { AnswerHistory, AnswerRecord } from "@/components/answer-history";


const HISTORY_KEY_PREFIX = "global_insights_answer_history_";

interface AssistantProps {
  profile: ProfileData | null;
  lang: Language;
  username: string;
}

export function Assistant({ profile, lang, username }: AssistantProps) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<{ preview: string; dataUri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const t = translations[lang];

  const getHistoryKey = useCallback(() => `${HISTORY_KEY_PREFIX}${username}`, [username]);

  useEffect(() => {
    // Load History for the specific user
    const savedHistory = localStorage.getItem(getHistoryKey());
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history data:", error);
        localStorage.removeItem(getHistoryKey());
      }
    } else {
        setHistory([]);
    }
  }, [username, getHistoryKey]);

  const addToHistory = (newRecord: AnswerRecord) => {
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(getHistoryKey(), JSON.stringify(updatedHistory));
  };
  
  const handleDeleteItem = (indexToDelete: number) => {
    const updatedHistory = history.filter((_, index) => index !== indexToDelete);
    setHistory(updatedHistory);
    localStorage.setItem(getHistoryKey(), JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(getHistoryKey());
  }

  const handleImageFile = useCallback((file: File) => {
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError(t.assistant.imageSizeError);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          preview: URL.createObjectURL(file),
          dataUri: reader.result as string,
        });
        setError(null);
      };
      reader.onerror = () => {
        setError(t.assistant.imageReadError);
      };
      reader.readAsDataURL(file);
    }
  }, [t.assistant.imageSizeError, t.assistant.imageReadError]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                handleImageFile(blob);
                toast({
                    title: t.assistant.pasteSuccess,
                });
            }
            break; 
        }
    }
  }, [handleImageFile, t.assistant.pasteSuccess, toast]);

  useEffect(() => {
      window.addEventListener('paste', handlePaste);
      return () => {
          window.removeEventListener('paste', handlePaste);
      };
  }, [handlePaste]);


  const handleSubmit = async () => {
    if (!question && !image) {
      setError(t.assistant.inputError);
      return;
    }
    if (!profile) {
      setError(t.assistant.profileError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const profileString = `
    - Annual Income: ${profile.income}
    - Occupation: ${profile.occupation}
    - Location: ${profile.state}, ${profile.country}
    - Gender: ${profile.gender}
    - Date of Birth: ${profile.dob}
    - Marital Status: ${profile.maritalStatus}
    - Education: ${profile.education}
    - Employment: ${profile.employment}
    - Ethnicity: ${profile.ethnicity}
    `;

    try {
      const result = await generatePerfectAnswer({
        userId: username,
        questionData: question,
        imageFile: image?.dataUri,
        userProfile: profileString,
      });


      addToHistory({
        question: question || "Image Question",
        answer: result.answer,
        timestamp: new Date().toISOString(),
      });
      setQuestion("");
      setImage(null);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setQuestion("");
    setImage(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            {t.assistant.title}
          </CardTitle>
          <CardDescription>{t.assistant.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t.assistant.placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[120px]"
            dir={lang === "ar" ? "rtl" : "ltr"}
            disabled={isLoading}
          />
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="me-2 h-4 w-4" />
              {t.assistant.upload}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              disabled={isLoading}
            />
            {image && (
              <div className="flex items-center gap-2">
                <div className="relative w-20 h-20 rounded-md overflow-hidden border p-1 bg-muted/30 flex items-center justify-center">
                    <Image
                        src={image.preview}
                        alt="Question image preview"
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setImage(null)} disabled={isLoading}>
                    <X className="w-4 h-4"/>
                    <span className="sr-only">Clear Image</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isLoading || (!question && !image)}>
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t.assistant.generating}
                </>
              ) : (
                t.assistant.generate
              )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                <X className="w-4 h-4 me-1"/>
                {t.assistant.clear}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
      
      <AnswerHistory 
        history={history} 
        lang={lang} 
        onClear={clearHistory}
        onDeleteItem={handleDeleteItem}
      />

    </div>
  );
}
