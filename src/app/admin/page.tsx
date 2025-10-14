
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { translations, Language } from "@/lib/translations";
import { Flame, ShieldCheck, UserCog, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface UserRecord {
  uid: string;
  email: string | null;
  status: 'active' | 'inactive';
  deviceId: string | null;
  isAdmin?: boolean;
}

async function getDeviceId(): Promise<string> {
    const userAgent = window.navigator.userAgent || 'unknown';
    return userAgent;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ar');
  const { toast } = useToast();

  const fetchUsers = async (adminUser: User) => {
    if (!db) {
        toast({ variant: "destructive", title: "Firebase Error", description: "Firestore is not configured." });
        setIsLoading(false);
        return;
    }

    try {
        // Step 1: Verify if the current user is an admin by checking their document.
        const adminDocRef = doc(db, "users", adminUser.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists() && adminDoc.data().isAdmin === true) {
            setIsAdmin(true);

            // Step 2: If they are an admin, fetch all users.
            const usersCollection = collection(db, "users");
            const querySnapshot = await getDocs(usersCollection);
            const userList: UserRecord[] = [];
            querySnapshot.forEach((doc) => {
                // Ensure we don't list the admin themselves if they don't have an email (edge case)
                if(doc.data().email) {
                  userList.push(doc.data() as UserRecord);
                }
            });
            // Filter out the current admin from the list to not show them
            setUsers(userList.filter(u => u.uid !== adminUser.uid));
        } else {
            setError(translations[lang].auth.admin.notAdmin);
        }
    } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
    }
    
    if (app) {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUsers(user);
            } else {
                // Not logged in, redirect or show error
                setError("You must be logged in to view this page.");
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = translations[lang] || translations.ar;

  const handleActivate = async (uid: string) => {
    if (!db) return;
    try {
        const userDocRef = doc(db, "users", uid);
        const currentDeviceId = await getDeviceId();
        await updateDoc(userDocRef, { 
            status: 'active',
            deviceId: currentDeviceId // Bind device on first activation
        });
        toast({
            title: "User Activated",
            description: `User ${uid} has been successfully activated.`,
        });
        const auth = getAuth(app);
        if(auth.currentUser) fetchUsers(auth.currentUser); // Refresh the list
    } catch (error: any) {
        console.error("Error activating user:", error);
        toast({
            variant: "destructive",
            title: "Activation Failed",
            description: `Could not activate user ${uid}. Check permissions.`,
        });
    }
  };
  
  if (!isAdmin && !isLoading) {
    return (
        <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
             <header className="w-full max-w-7xl flex justify-between items-center mb-8">
                <Link href="/" className="flex items-center gap-2 sm:gap-3">
                    <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
                        {t.appName}
                    </h1>
                </Link>
            </header>
            <main className="w-full max-w-5xl">
                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertTriangle className="w-8 h-8"/>
                            <div>
                                <CardTitle className="text-2xl">{t.auth.admin.accessDenied}</CardTitle>
                                <CardDescription className="text-destructive/80">{error || t.auth.admin.notAdmin}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
       <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
            {t.appName}
          </h1>
        </Link>
      </header>
       <main className="w-full max-w-5xl">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <UserCog className="w-8 h-8 text-primary"/>
                    <div>
                        <CardTitle className="text-2xl">{t.auth.admin.title}</CardTitle>
                        <CardDescription>{t.auth.admin.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>{t.auth.admin.email}</TableHead>
                            <TableHead>{t.auth.admin.status}</TableHead>
                            <TableHead className="min-w-[200px]">{t.auth.admin.deviceId}</TableHead>
                            <TableHead className="text-right">{t.auth.admin.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">{t.auth.admin.noUsers}</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{user.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                            {user.status === 'active' ? t.auth.admin.active : t.auth.admin.inactive}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{user.deviceId || t.auth.admin.noDeviceId}</TableCell>
                                    <TableCell className="text-right">
                                    {user.status === 'inactive' && (
                                        <Button size="sm" onClick={() => handleActivate(user.uid)}>
                                            <ShieldCheck className="me-2 h-4 w-4"/>
                                            {t.auth.admin.activate}
                                        </Button>
                                    )}
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
       </main>
    </div>
  );
}
