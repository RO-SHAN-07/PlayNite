'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Camera, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }
  
  const userProfile = {
    name: user.displayName || 'No Name',
    email: user.email || 'No Email',
    joined: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric'}) : 'N/A',
    avatar: user.photoURL,
    bio: 'Lover of sci-fi, documentaries, and everything in between. Creator on the rise.',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold font-headline">My Account</h1>
        <p className="text-muted-foreground">View and manage your public profile.</p>
      </div>

      <Card>
        <CardHeader className="flex-row gap-6 space-y-0">
          <div className="relative group">
            <Avatar className="w-24 h-24">
              {userProfile.avatar && <AvatarImage src={userProfile.avatar} alt={userProfile.name} data-ai-hint="person portrait" />}
              <AvatarFallback className="text-3xl">{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <CardTitle className="text-3xl font-headline">{userProfile.name}</CardTitle>
            <CardDescription className="text-base">{userProfile.email}</CardDescription>
            <CardDescription>Joined in {userProfile.joined}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">Bio</h3>
            <p className="text-muted-foreground mt-1">{userProfile.bio}</p>
          </div>
          
          <div className="flex gap-4">
             <Button asChild>
                <Link href="/settings">Edit Profile</Link>
             </Button>
             <Button variant="outline" asChild>
                <Link href="#">
                    <Shield className="mr-2"/>
                    Security Settings
                </Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
