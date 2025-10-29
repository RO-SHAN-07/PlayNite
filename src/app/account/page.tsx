'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { Camera, Shield, Loader2, Edit3, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
    if (userProfile) {
        setBio(userProfile.bio || '');
    }
  }, [isUserLoading, user, router, userProfile]);

  const handleSaveBio = () => {
    if (!userProfileRef) return;
    updateDocumentNonBlocking(userProfileRef, { bio });
    toast({ title: 'Bio updated successfully!' });
    setIsEditingBio(false);
  }

  const isLoading = isUserLoading || profileLoading;

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const profile = {
    name: user.displayName || 'No Name',
    email: user.email || 'No Email',
    joined: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric'}) : 'N/A',
    avatar: user.photoURL,
    bio: userProfile?.bio || 'Lover of sci-fi, documentaries, and everything in between. Creator on the rise.',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold font-headline">My Account</h1>
        <p className="text-muted-foreground">View and manage your public profile.</p>
      </div>

      <Card>
        <CardHeader className="flex-row gap-6 space-y-0 items-center">
          <div className="relative group">
            <Avatar className="w-24 h-24">
              {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.name} data-ai-hint="person portrait" />}
              <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <CardTitle className="text-3xl font-headline">{profile.name}</CardTitle>
            <CardDescription className="text-base">{profile.email}</CardDescription>
            <CardDescription>Joined in {profile.joined}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Bio</h3>
                {isEditingBio ? (
                    <Button variant="ghost" size="icon" onClick={handleSaveBio}>
                        <Save className="w-5 h-5 text-primary" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(true)}>
                        <Edit3 className="w-5 h-5" />
                    </Button>
                )}
            </div>
            {isEditingBio ? (
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
            ) : (
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{profile.bio}</p>
            )}
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
