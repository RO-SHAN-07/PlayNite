'use client';
import { TagCloud } from '@/components/tag-cloud';
import { VideoCard } from '@/components/video-card';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Video } from '@/lib/data';
import { collection, query, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExplorePage() {
    const firestore = useFirestore();

    const videosQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'videos'), limit(10));
    }, [firestore]);

    const { data: videos, loading } = useCollection<Video>(videosQuery);


  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold font-headline mb-4">Explore Content</h1>
        <p className="text-lg text-muted-foreground">
          Discover new videos, trending topics, and popular categories.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Trending Tags</h2>
        <TagCloud />
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Popular Right Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
             Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))
          ) : videos && videos.length > 0 ? (
                videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))
            ) : (
                <p className="text-muted-foreground col-span-full">No videos found.</p>
            )
          }
        </div>
      </section>
    </div>
  );
}
