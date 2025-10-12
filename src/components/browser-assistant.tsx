"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import type { Language } from "@/lib/translations";

interface BrowserAssistantProps {
  lang: Language;
}

export function BrowserAssistant({ lang }: BrowserAssistantProps) {
  const isArabic = lang === "ar";
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="text-primary" />
          {isArabic ? "متصفح الاستبيانات المدمج" : "Integrated Survey Browser"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "هذه الميزة قيد التطوير حاليًا." : "This feature is currently under development."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground p-8">
          <p>{isArabic ? "تخيل أنك تملأ الاستبيانات تلقائيًا بنقرة زر واحدة. هذا ما سيأتي قريبًا!" : "Imagine filling out surveys automatically with the click of a button. That's what's coming soon!"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
