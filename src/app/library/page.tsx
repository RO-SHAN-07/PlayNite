'use client';
import { VideoCard } from '@/components/video-card';
import { History, Star, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Video, Favorite, VideoHistory } from '@/lib/data';
import { useMemo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function VideoRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
         <div key={i} className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
         </div>
      ))}
    </div>
  );
}


export default function LibraryPage() {
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
    return query(collection(firestore, `users/${user.uid}/favorites`), orderBy('addedDate', 'desc'), limit(5));
  }, [user, firestore]);
  
  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/video_history`), orderBy('watchDate', 'desc'), limit(5));
  }, [user, firestore]);
  
  const uploadsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'videos'), where('creatorId', '==', user.uid), limit(5));
  }, [user, firestore]);

  const { data: favorites, isLoading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);
  const { data: history, isLoading: historyLoading } = useCollection<VideoHistory>(historyQuery);
  const { data: uploads, isLoading: uploadsLoading } = useCollection<Video>(uploadsQuery);

  const { data: favoriteVideos, isLoading: favoriteVideosLoading } = useCollection<Video>(
    useMemoFirebase(() => {
      if (!firestore || !favorites || favorites.length === 0) return null;
      const videoIds = favorites.map(f => f.videoId);
      return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, favorites])
  );

  const { data: historyVideos, isLoading: historyVideosLoading } = useCollection<Video>(
    useMemoFirebase(() => {
      if (!firestore || !history || history.length === 0) return null;
      const videoIds = history.map(h => h.videoId).filter((v, i, a) => a.indexOf(v) === i);
      if(videoIds.length === 0) return null;
      return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, history])
  );

  if (isUserLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  const isLoading = favoritesLoading || historyLoading || uploadsLoading || favoriteVideosLoading || historyVideosLoading;

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold font-headline mb-4">My Library</h1>
        <p className="text-lg text-muted-foreground">
          Your saved videos, watch history, and uploads all in one place.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Star className="text-primary" />
            Favorites
          </h2>
          <Link href="/library/favorites" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>
        {isLoading ? <VideoRowSkeleton/> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoriteVideos && favoriteVideos.length > 0 ? (
                favoriteVideos.map((video) => <VideoCard key={video.id} video={video} />)
              ) : (
                <p className="text-muted-foreground col-span-full">You have no favorited videos.</p>
              )}
            </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <History className="text-primary" />
            Recently Watched
          </h2>
          <Link href="/library/history" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>
        {isLoading ? <VideoRowSkeleton/> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {historyVideos && historyVideos.length > 0 ? (
                historyVideos.map((video) => <VideoCard key={video.id} video={video} />)
              ) : (
                <p className="text-muted-foreground col-span-full">Your watch history is empty.</p>
              )}
            </div>
        )}
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Upload className="text-primary" />
            My Uploads
          </h2>
          <Link href="/studio" className="text-sm text-primary hover:underline">
            Go to Studio
          </Link>
        </div>
        {isLoading ? <VideoRowSkeleton/> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {uploads && uploads.length > 0 ? (
                uploads.map((video) => <VideoCard key={video.id} video={video as Video} />)
              ) : (
                <p className="text-muted-foreground col-span-full">You haven't uploaded any videos.</p>
              )}
            </div>
        )}
      </section>
    </div>
  );
}
