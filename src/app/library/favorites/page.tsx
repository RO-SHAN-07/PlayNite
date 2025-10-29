'use client';
import { VideoCard } from '@/components/video-card';
import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Star, Loader2, HeartCrack } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import type { Video, Favorite } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/favorites`), orderBy('addedDate', 'desc'));
  }, [user, firestore]);

  const { data: favorites, isLoading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);

  const videoIds = useMemo(() => favorites?.map(f => f.videoId).filter(Boolean) || [], [favorites]);

  const videosQuery = useMemoFirebase(() => {
    // Prevent invalid query with empty 'in' array
    if (!firestore || videoIds.length === 0) return null;
    return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
  }, [firestore, videoIds]);

  const { data: favoritedVideos, isLoading: videosLoading } = useCollection<Video>(videosQuery);
  
  const orderedFavoritedVideos = useMemo(() => {
      if (!favoritedVideos || !favorites) return [];
      const videoMap = new Map(favoritedVideos.map(v => [v.id, v]));
      return favorites.map(f => videoMap.get(f.videoId)).filter(Boolean) as Video[];
  }, [favoritedVideos, favorites]);


  if (isUserLoading || (!user && !isUserLoading)) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  const isLoading = favoritesLoading || (videoIds.length > 0 && videosLoading);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Star className="w-10 h-10 text-primary" />
          Favorites
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          All the videos you've marked as favorites.
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
          ) : orderedFavoritedVideos && orderedFavoritedVideos.length > 0 ? (
            orderedFavoritedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Favorited Videos</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Click the star icon on a video to save it here.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/explore">Explore Videos</Link>
                </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
