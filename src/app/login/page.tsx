
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, KeyRound, User } from "lucide-react";
import { createUser, getCustomToken } from '@/app/actions';
import { setCookie } from 'cookies-next';
import { translations, Language, Direction } from "@/lib/translations";
import { LanguageToggle } from '@/components/language-toggle';
import { getAuth, signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { app } from '@/lib/firebase-client';

const auth = getAuth(app);

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("ar");
  const [dir, setDir] = useState<Direction>("rtl");

  const t = translations[lang];

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });
  
  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    const newDir = newLang === "ar" ? "rtl" : "ltr";
    setDir(newDir);
    if (typeof window !== "undefined") {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newDir;
    }
  };

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    setPendingMessage(null);

    const cleanUsername = data.username.toLowerCase().trim();
    const email = `${cleanUsername}@survey-app.com`;

    try {
      // Step 1: Verify password with client-side SDK
      await signInWithEmailAndPassword(auth, email, data.password);

      // Step 2: If password is correct, get a custom token from the server action
      const result = await getCustomToken(data.username, data.password);

      if (result.status === 'success') {
          // Step 3: Sign in with the custom token on the client
          const customToken = result.message;
          await signInWithCustomToken(auth, customToken);
          
          setCookie('username', data.username.toLowerCase().trim(), { maxAge: 60 * 60 * 24 * 30 });
          setCookie('uid', result.uid!, { maxAge: 60 * 60 * 24 * 30 });
          router.push('/');
      } else if (result.status === 'pending') {
          setPendingMessage(result.message);
      } else {
          setError(result.message);
      }
    } catch (e: any) {
        console.error("Login error:", e.code);
        if(e.code === 'auth/invalid-credential'){
            setError('Invalid username or password.');
        } else {
            setError('An unexpected error occurred during login.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setError(null);
    setPendingMessage(null);

    const result = await createUser(data.username, data.password);
    
    if (result.status === 'pending') {
        setPendingMessage(result.message);
        signupForm.reset();
    } else if (result.status === 'error') {
        setError(result.message);
    }
    setIsLoading(false);
  };
  
  const clearMessages = () => {
      setError(null);
      setPendingMessage(null);
  }

  return (
    <div dir={dir} className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 end-4">
        <LanguageToggle lang={lang} setLang={handleLangChange} />
      </div>

      <Tabs defaultValue="login" className="w-full max-w-sm" onValueChange={clearMessages}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. john-doe" {...field} className="ps-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="ps-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                   {pendingMessage && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{pendingMessage}</AlertDescription></Alert>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>Enter a username and password to get started.</CardDescription>
            </CardHeader>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                <CardContent className="space-y-4">
                   <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Choose a unique username" {...field} className="ps-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="6+ characters" {...field} className="ps-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="ps-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                  {pendingMessage && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{pendingMessage}</AlertDescription></Alert>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
