'use client';
import { useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Video } from '@/lib/data';
import { VideoCard } from '@/components/video-card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon, Film } from 'lucide-react';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

export function SearchResults() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q');
    const firestore = useFirestore();

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || !queryParam) return null;

        const titleQuery = where('title', '>=', queryParam);
        const titleQueryEnd = where('title', '<=', queryParam + '\uf8ff');

        return query(collection(firestore, 'videos'), titleQuery, titleQueryEnd);

    }, [firestore, queryParam]);

    const { data: videos, isLoading } = useCollection<Video>(videosQuery);

    return (
        <div className="space-y-8">
            <section>
                <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
                    <SearchIcon className="w-10 h-10 text-primary" />
                    Search Results
                </h1>
                {queryParam && <p className="text-lg text-muted-foreground mt-2">Showing results for: <span className="font-semibold text-foreground">{queryParam}</span></p>}
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
                    ) : videos && videos.length > 0 ? (
                        videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                             <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                             <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
                             <p className="mt-2 text-sm text-muted-foreground">
                                We couldn't find any videos matching your search.
                             </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
