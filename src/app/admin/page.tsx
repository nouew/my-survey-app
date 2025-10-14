
"use client";

import { useState, useEffect } from "react";
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
import { getAllUsers, activateUser } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { translations, Language } from "@/lib/translations";
import { Flame, ShieldCheck, UserCog } from "lucide-react";

interface UserRecord {
  uid: string;
  email: string | null;
  status: 'active' | 'inactive';
  deviceId: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('ar');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = (localStorage.getItem("global_insights_lang") as Language) || "ar";
      setLang(storedLang);
      const newDir = storedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = storedLang;
      document.documentElement.dir = newDir;
    }
    fetchUsers();
  }, []);

  const t = translations[lang] || translations.ar;

  const fetchUsers = async () => {
    setIsLoading(true);
    const userList = await getAllUsers();
    setUsers(userList);
    setIsLoading(false);
  };

  const handleActivate = async (uid: string) => {
    const result = await activateUser(uid);
    if (result.success) {
      toast({
        title: "User Activated",
        description: `User ${uid} has been successfully activated.`,
      });
      fetchUsers(); // Refresh the list
    } else {
        toast({
            variant: "destructive",
            title: "Activation Failed",
            description: `Could not activate user ${uid}.`,
        });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-headline">
            {t.appName}
          </h1>
        </div>
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
                                    <TableCell colSpan={4} className="text-center h-24">Loading users...</TableCell>
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
