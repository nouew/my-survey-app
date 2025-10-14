
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, ShieldOff, ClipboardCopy, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

interface User {
  id: string;
  uid: string;
  status: 'active' | 'inactive';
}

// Hardcoded admin username
const ADMIN_USERNAME = 'admin';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
        const username = getCookie('username');
        if (username !== ADMIN_USERNAME) {
            router.push('/login');
            return;
        }

        const activationKey = getCookie('activationKey');
        const adminRef = doc(db, 'users', ADMIN_USERNAME);
        try {
            const adminDoc = await getDoc(adminRef);
            if (adminDoc.exists() && adminDoc.data().uid === activationKey && adminDoc.data().status === 'active') {
                setIsAdmin(true);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            router.push('/login');
        }
    };

    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData: User[] = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.id !== ADMIN_USERNAME); // Exclude admin from the list
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const toggleUserStatus = async (username: string, currentStatus: 'active' | 'inactive') => {
    const userRef = doc(db, 'users', username);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(userRef, { status: newStatus });
      toast({
        title: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Username: ${username}`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update user status.',
      });
    }
  };

  const copyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast({
      title: 'Copied to Clipboard!',
      description: 'The user\'s activation key (UID) has been copied.',
    });
  };
  
  if (!isAdmin) {
       return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage user accounts and activations.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="me-2 h-4 w-4" />
            Go to App
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Activation Key (UID)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-sm">{user.uid.substring(0,10)}...</span>
                           <Button variant="ghost" size="icon" onClick={() => copyUid(user.uid)}>
                               <ClipboardCopy className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                            {user.status === 'active' ? (
                                <ShieldOff className="me-2 h-4 w-4" />
                            ) : (
                                <ShieldCheck className="me-2 h-4 w-4" />
                            )}
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users have registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

