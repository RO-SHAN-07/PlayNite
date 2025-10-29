'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();

  if(user) {
    router.push('/');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: 'Login Successful', description: 'Welcome!' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Login Failed', description: error.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <Card className="mx-auto max-w-sm w-full bg-background/60 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login to PlayNite</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
