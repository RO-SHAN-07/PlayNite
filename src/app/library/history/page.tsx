'use client';
import { VideoCard } from '@/components/video-card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { History, Loader2 } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import type { Video, VideoHistory } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/video_history`), orderBy('watchDate', 'desc'));
  }, [user, firestore]);

  const { data: historyItems, isLoading: historyLoading } = useCollection<VideoHistory>(historyQuery);
  
  const videoIds = useMemo(() => historyItems?.map(h => h.videoId).filter((v, i, a) => a.indexOf(v) === i) || [], [historyItems]);

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || videoIds.length === 0) return null;
    return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
  }, [firestore, videoIds]);

  const { data: historyVideos, isLoading: videosLoading } = useCollection<Video>(videosQuery);
  
  const videoMap = useMemo(() => {
    if (!historyVideos) return new Map();
    return new Map(historyVideos.map(video => [video.id, video]));
  }, [historyVideos]);

  const orderedHistoryVideos = useMemo(() => {
    if (!historyItems || !videoMap) return [];
    // Get unique video IDs from history, preserving order
    const uniqueVideoIds = historyItems.map(item => item.videoId).filter((v, i, a) => a.indexOf(v) === i);
    return uniqueVideoIds.map(id => videoMap.get(id)).filter(Boolean) as Video[];
  }, [historyItems, videoMap]);

  if (isUserLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  const isLoading = historyLoading || videosLoading;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <History className="w-10 h-10 text-primary" />
          Watch History
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Videos you've recently watched.
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
          ) : orderedHistoryVideos && orderedHistoryVideos.length > 0 ? (
            orderedHistoryVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
             <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Your watch history is empty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
