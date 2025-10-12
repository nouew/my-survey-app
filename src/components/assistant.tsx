"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import { generateAnswerAction } from "@/app/actions";
import type { ProfileData } from "@/lib/data";
import { translations, Language } from "@/lib/translations";

const USER_ID_KEY = "global_insights_user_id";

interface AssistantProps {
  profile: ProfileData | null;
  lang: Language;
}

export function Assistant({ profile, lang }: AssistantProps) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<{ preview: string; dataUri: string } | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
  };

  const handleSubmit = async () => {
    if (!profile) {
      setError(t.assistant.profileError);
      return;
    }
    if (!question && !image) {
      setError(t.assistant.inputError);
      return;
    }
    if (!userId) {
      setError("User session not found. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    const result = await generateAnswerAction(
      userId,
      question,
      image?.dataUri ?? null,
      profile
    );

    if (result.error) {
      setError(result.error);
    } else {
      setAnswer(result.answer ?? null);
    }
    setIsLoading(false);
  };

  return (
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
        />
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
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
          />
          {image && (
            <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                <Image
                    src={image.preview}
                    alt="Question image preview"
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t.assistant.generating}
            </>
          ) : (
            t.assistant.generate
          )}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {answer && (
          <div className="w-full space-y-2 rounded-lg border bg-secondary/30 p-4">
             <h3 className="font-semibold text-foreground">{t.assistant.perfectAnswer}</h3>
             <p className="text-muted-foreground whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
