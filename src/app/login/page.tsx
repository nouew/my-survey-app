
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, type Auth } from "firebase/auth";
import { app, firebaseInitializationError } from "@/lib/firebase";
import { createUserRecord } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Flame } from 'lucide-react';
import { translations, Language } from "@/lib/translations";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Language>('ar');
  const [auth, setAuth] = useState<Auth | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (firebaseInitializationError) {
        setError(`Firebase Error: ${firebaseInitializationError.message}`);
        return;
    }
    if (!app) {
        setError("Firebase is not configured. Please add your Firebase configuration to the .env file.");
        return;
    }
    const authInstance = getAuth(app);
    setAuth(authInstance);

    // Redirect if user is already logged in
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        router.push('/');
      }
    });

    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
    }
    return () => unsubscribe();
  }, [router]);
  
  const t = translations[lang] || translations.ar;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let the onAuthStateChanged handle redirection
    } catch (err: any) {
      const errorCode = err.code as keyof typeof t.auth.errors;
      setError(t.auth.errors[errorCode] || t.auth.errors.default);
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const dbResult = await createUserRecord(result.user.uid, result.user.email);
       if (!dbResult.success) {
        setError(dbResult.error || "Failed to create user record in database.");
        setIsLoading(false);
        return;
      }
       // Let the onAuthStateChanged handle redirection
    } catch (err: any) {
      const errorCode = err.code as keyof typeof t.auth.errors;
      setError(t.auth.errors[errorCode] || t.auth.errors.default);
      setIsLoading(false);
    }
  };

  if (!app || firebaseInitializationError) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
             <Card className="w-full max-w-md border-destructive">
                <CardHeader className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <CardTitle className="mt-4">Firebase Not Configured</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Configuration Error</AlertTitle>
                        <AlertDescription>
                            {error || "An unknown error occurred during Firebase initialization."}
                        </AlertDescription>
                    </Alert>
                </CardContent>
             </Card>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">{t.appName}</h1>
            </div>
            <CardTitle>{t.auth.loginTitle}</CardTitle>
            <CardDescription>{t.auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t.auth.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.auth.passwordLabel}</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
               {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t.auth.loginButton}
              </Button>
            </div>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : 
                <svg className="me-2 h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.998C34.553 6.186 29.655 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.998C34.553 6.186 29.655 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l6.84-6.84C34.553 6.186 29.655 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20z"></path>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.426 44 30.039 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                </svg>
                }
                {t.auth.googleLogin}
            </Button>
          <div className="mt-4 text-center text-sm">
            {t.auth.noAccount}
            <Link href="/signup" className="underline ms-1">
              {t.auth.signupLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
