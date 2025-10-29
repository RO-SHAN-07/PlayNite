'use client';
import { VideoCard } from '@/components/video-card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Star, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Video, Favorite } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/favorites`));
  }, [user, firestore]);

  const { data: favorites, isLoading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);

  const videoIds = useMemo(() => favorites?.map(f => f.videoId) || [], [favorites]);

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || videoIds.length === 0) return null;
    return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
  }, [firestore, videoIds]);

  const { data: favoritedVideos, isLoading: videosLoading } = useCollection<Video>(videosQuery);

  if (isUserLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }
  
  if(!user) {
    router.push('/auth/login');
    return null;
  }

  const isLoading = favoritesLoading || videosLoading;

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
          ) : favoritedVideos && favoritedVideos.length > 0 ? (
            favoritedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">You have no favorited videos yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
