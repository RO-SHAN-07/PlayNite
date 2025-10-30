'use client';
import { VideoCard } from '@/components/video-card';
import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Rss, Loader2, UserPlus } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import type { Video, Follower } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const followingQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query the 'followers' subcollection of OTHER users to see if the current user's ID is in there.
    return query(collectionGroup(firestore, 'followers'), where('followerId', '==', user.uid));
  }, [user, firestore]);
  
  const { data: following, isLoading: followingLoading } = useCollection<Follower>(followingQuery);
  
  const followedCreatorIds = useMemo(() => {
    if (!following) return [];
    // The 'followedId' is the ID of the creator channel being followed.
    return following.map(f => f.followedId);
  }, [following]);


  const feedVideosQuery = useMemoFirebase(() => {
    if (!firestore || followedCreatorIds.length === 0) return null;
    return query(
        collection(firestore, 'videos'), 
        where('creatorId', 'in', followedCreatorIds),
        orderBy('uploadedAt', 'desc'),
        limit(20)
    );
  }, [firestore, followedCreatorIds]);

  const { data: feedVideos, isLoading: videosLoading } = useCollection<Video>(feedVideosQuery);

  if (isUserLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }
  
  const isLoading = followingLoading || (followedCreatorIds.length > 0 && videosLoading);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Rss className="w-10 h-10 text-primary" />
          Your Feed
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Latest videos from creators you follow.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
             Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))
          ) : feedVideos && feedVideos.length > 0 ? (
            feedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Your Feed is Empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Follow some creators to see their videos here.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/explore">Explore Creators</Link>
                </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
