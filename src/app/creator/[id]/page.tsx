'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Loader2, Rss, UserCheck, UserPlus } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, query, where } from 'firebase/firestore';
import type { UserProfile, Video } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { VideoCard } from '@/components/video-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function CreatorPage({ params }: { params: { id: string } }) {
  const { id: creatorId } = params;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const creatorRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', creatorId);
  }, [firestore, creatorId]);

  const { data: creator, isLoading: creatorLoading } = useDoc<UserProfile>(creatorRef);
  
  const creatorVideosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), where('creatorId', '==', creatorId));
  }, [firestore, creatorId]);

  const { data: creatorVideos, isLoading: videosLoading } = useCollection<Video>(creatorVideosQuery);

  const followersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, `users/${creatorId}/followers`);
  }, [firestore, creatorId]);

  const { data: followers, isLoading: followersLoading } = useCollection(followersRef);

  const amIFollowingQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${creatorId}/followers`, user.uid);
  }, [firestore, creatorId, user]);

  const { data: amIFollowing, isLoading: amIFollowingLoading } = useDoc(amIFollowingQuery);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setIsFollowing(!!amIFollowing);
  }, [amIFollowing]);

  const handleFollowToggle = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to follow a creator.' });
      router.push('/auth/login');
      return;
    }
    if (user.uid === creatorId) {
      toast({ variant: 'destructive', title: "You can't follow yourself." });
      return;
    }

    const followDocRef = doc(firestore, `users/${creatorId}/followers`, user.uid);

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      if (previousState) {
        await deleteDocumentNonBlocking(followDocRef);
        toast({ title: 'Unfollowed!', description: `You are no longer following ${creator?.displayName}.` });
      } else {
        await setDocumentNonBlocking(followDocRef, {
          followerId: user.uid,
          followedId: creatorId,
          timestamp: new Date(),
        });
        toast({ title: 'Followed!', description: `You are now following ${creator?.displayName}.` });
      }
    } catch (error) {
      setIsFollowing(previousState);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the follow action.' });
    }
  };


  const isLoading = isUserLoading || creatorLoading || videosLoading || followersLoading || amIFollowingLoading;

  if (isLoading) {
    return <div className="max-w-6xl mx-auto"><CreatorPageSkeleton /></div>
  }
  
  if (!creator) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="h-48 bg-muted/30 w-full" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 -mt-20">
            <Avatar className="w-32 h-32 border-4 border-background ring-4 ring-primary">
              {creator.photoURL && <AvatarImage src={creator.photoURL} alt={creator.displayName || ''} />}
              <AvatarFallback className="text-5xl">{creator.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-16 sm:mt-0">
              <h1 className="text-4xl font-bold font-headline">{creator.displayName}</h1>
              <div className="text-muted-foreground flex items-center gap-4 mt-1">
                <span>@{creator.displayName?.toLowerCase().replace(/\s/g, '')}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5"><Rss className="w-4 h-4"/> {followers?.length || 0} Followers</span>
              </div>
              <p className="mt-2 text-muted-foreground max-w-xl">{creator.bio || 'This creator has not set a bio yet.'}</p>
            </div>
            <div>
              {user?.uid !== creatorId && (
                <Button onClick={handleFollowToggle} disabled={isLoading}>
                  {isFollowing ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Uploaded Videos</h2>
        {creatorVideos && creatorVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {creatorVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">This creator hasn't uploaded any videos yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function CreatorPageSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 -mt-20">
                        <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
                        <div className="flex-1 mt-16 sm:mt-0 space-y-2">
                           <Skeleton className="h-10 w-64" />
                           <Skeleton className="h-5 w-48" />
                           <Skeleton className="h-5 w-full max-w-lg mt-2" />
                        </div>
                        <div>
                            <Skeleton className="h-10 w-28" />
                        </div>
                    </div>
                </CardContent>
            </Card>

             <section>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
