
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, AlertTriangle, LogOut } from "lucide-react";
import { translations, Language } from "@/lib/translations";

export default function BlockedPage() {
    const [lang, setLang] = useState<Language>('ar');
    const searchParams = useSearchParams();
    const router = useRouter();
    const reason = searchParams.get('reason');

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
            setLang(storedLang);
            const newDir = storedLang === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = storedLang;
            document.documentElement.dir = newDir;
        }
    }, []);

    const t = translations[lang] || translations.ar;

    const handleLogout = async () => {
        if (app) {
            const auth = getAuth(app);
            await signOut(auth);
            router.push('/login');
        }
    };

    const isDeviceMismatch = reason === 'device_mismatch';
    const title = isDeviceMismatch ? t.auth.blocked.deviceMismatchTitle : t.auth.blocked.title;
    const description = isDeviceMismatch ? t.auth.blocked.deviceMismatchDescription : t.auth.blocked.description;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                      <AlertTriangle className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription className="text-lg">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <a href="mailto:support@example.com">
                        <Button size="lg">{t.auth.blocked.contactSupport}</Button>
                    </a>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                     <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="me-2 h-4 w-4" />
                        {t.auth.logout}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
