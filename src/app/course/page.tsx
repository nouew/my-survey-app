
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft, Flame } from "lucide-react";
import { translations, Language, Direction } from "@/lib/translations";
import { courseStages } from "@/lib/course-data";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function CoursePage() {
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
      setDir(newDir);
    }
  }, []);

  const t = translations[lang] || translations.ar;
  
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8" dir={dir}>
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
            {t.course.title}
          </h1>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="me-2 h-4 w-4" />
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </Link>
      </header>

      <main className="w-full max-w-7xl space-y-6">
        <p className="text-muted-foreground text-center sm:text-start">{t.course.description}</p>
        
        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="stage-1">
          {courseStages.map((stage) => (
            <AccordionItem value={stage.id} key={stage.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-4 sm:p-6 text-base sm:text-lg font-semibold hover:no-underline text-start">
                {stage.title}
              </AccordionTrigger>
              <AccordionContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground mb-6">{stage.description}</p>
                {stage.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-primary">{section.title}</h3>
                        <p className="text-muted-foreground mb-4 whitespace-pre-line">{section.content}</p>

                        {section.table && (
                             <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                {section.table.headers.map((header, hIndex) => (
                                                    <TableHead key={hIndex} className="min-w-[150px]">{header}</TableHead>
                                                ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {section.table.rows.map((row, rIndex) => (
                                                <TableRow key={rIndex}>
                                                    {row.map((cell, cIndex) => (
                                                    <TableCell key={cIndex} className={cIndex === 0 ? "font-medium" : ""}>{cell}</TableCell>
                                                    ))}
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                             </Card>
                        )}
                    </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      <footer className="w-full max-w-7xl mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} {t.appName}. {t.footer}</p>
      </footer>
    </div>
  );
}
