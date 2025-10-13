
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft, Flame } from "lucide-react";
import { translations, Language, Direction } from "@/lib/translations";
import { surveySites } from "@/lib/sites-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SitesPage() {
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
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">
            {t.sites.title}
          </h1>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="me-2 h-4 w-4" />
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </Link>
      </header>

      <main className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{t.sites.title}</CardTitle>
            <CardDescription>{t.sites.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.sites.name}</TableHead>
                  <TableHead className="text-center">{t.sites.minPayout}</TableHead>
                  <TableHead>{t.sites.notes}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveySites.map((site) => (
                  <TableRow key={site.name}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell className="text-center">{site.minPayout}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Global Insights Assistant. {t.footer}</p>
      </footer>
    </div>
  );
}
