
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, KeyRound, User } from "lucide-react";
import { findOrCreateUser, validateActivationKey } from '@/app/actions';
import { setCookie } from 'cookies-next';
import { translations, Language, Direction } from "@/lib/translations";
import { LanguageToggle } from '@/components/language-toggle';

type Stage = 'username' | 'activate' | 'pending';

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('username');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Language and direction state
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");

  const t = translations[lang];

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    const newDir = newLang === "ar" ? "rtl" : "ltr";
    setDir(newDir);
    if (typeof window !== "undefined") {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newDir;
    }
  };
  
  const usernameSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  });

  const activationSchema = z.object({
    activationKey: z.string().min(1, { message: 'Activation key is required.' }),
  });

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: '' },
  });

  const activationForm = useForm<z.infer<typeof activationSchema>>({
    resolver: zodResolver(activationSchema),
    defaultValues: { activationKey: '' },
  });

  const onUsernameSubmit = async (data: z.infer<typeof usernameSchema>) => {
    setIsLoading(true);
    setError(null);
    const result = await findOrCreateUser(data.username);
    if (result.status === 'exists') {
      setUsername(data.username);
      setStage('activate');
    } else if (result.status === 'created') {
      setStage('pending');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const onActivationSubmit = async (data: z.infer<typeof activationSchema>) => {
    setIsLoading(true);
    setError(null);
    const result = await validateActivationKey(username, data.activationKey);
    if (result.status === 'valid') {
      // Set cookies and redirect
      setCookie('username', username, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
      setCookie('activationKey', data.activationKey, { maxAge: 60 * 60 * 24 * 30 });
      router.push('/');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div dir={dir} className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-4 end-4">
        <LanguageToggle lang={lang} setLang={handleLangChange} />
       </div>

      {stage === 'username' && (
        <Card className="w-full max-w-sm">
          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}>
              <CardHeader className="text-center">
                <CardTitle>{t.auth.loginTitle}</CardTitle>
                <CardDescription>{t.auth.loginDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.usernameLabel}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t.auth.usernamePlaceholder} {...field} className="ps-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t.auth.continue}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {stage === 'activate' && (
        <Card className="w-full max-w-sm">
          <Form {...activationForm}>
            <form onSubmit={activationForm.handleSubmit(onActivationSubmit)}>
              <CardHeader className="text-center">
                <CardTitle>{t.auth.activationTitle}</CardTitle>
                <CardDescription>{t.auth.activationDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={activationForm.control}
                  name="activationKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.activationKeyLabel}</FormLabel>
                      <FormControl>
                         <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t.auth.activationKeyPlaceholder} {...field} className="ps-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t.auth.loginButton}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {stage === 'pending' && (
        <Alert className="max-w-md text-center">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.auth.pendingActivationTitle}</AlertTitle>
          <AlertDescription>
            {t.auth.pendingActivationDescription}
          </AlertDescription>
           <Button variant="link" className="mt-4" onClick={() => {
               // Replace with actual support link
               window.location.href = "https://t.me/your-support-channel";
           }}>
            {t.auth.contactSupport}
          </Button>
        </Alert>
      )}
    </div>
  );
}
