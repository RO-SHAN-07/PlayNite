
'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { categories, type Video } from '@/lib/data';
import { VideoCard } from '@/components/video-card';
import { EmbeddedVideo } from '@/components/embedded-video';
import { PlayCircle, Plus, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, limit, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function VideoRowSkeleton({ count = 5 }: { count?: number }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: count }).map((_, i) => (
           <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="space-y-1 p-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
              </div>
           </div>
        ))}
      </div>
    );
}


export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);

  const trendingVideosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('views', 'desc'), limit(10));
  }, [firestore]);

  const newReleasesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('uploadedAt', 'desc'), limit(5));
  }, [firestore]);

  const { data: trendingVideos, loading: trendingLoading } = useCollection<Video>(trendingVideosQuery);
  const { data: newReleases, loading: newReleasesLoading } = useCollection<Video>(newReleasesQuery);
  
  const featuredVideo = trendingVideos?.[0];
  const heroImage = {
    imageUrl: 'https://images.unsplash.com/photo-1754346724171-ddd61d8dd8da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhYnN0cmFjdCUyMGNpbmVtYXRpY3xlbnwwfHx8fDE3NjE3MjYxODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'abstract cinematic'
  };

  const handleAddToWatchLater = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You need to be logged in to add videos to your list.' });
      router.push('/auth/login');
      return;
    }
    if (!firestore || !featuredVideo) return;
    setIsAdding(true);
    try {
        const watchLaterRef = doc(firestore, `users/${user.uid}/watchLater`, featuredVideo.id);
        await setDocumentNonBlocking(watchLaterRef, {
            videoId: featuredVideo.id,
            addedDate: serverTimestamp(),
        }, { merge: true });
        toast({ title: 'Added to Watch Later', description: `"${featuredVideo.title}" has been added to your list.` });
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add to Watch Later.' });
    } finally {
        setIsAdding(false);
    }
  }


  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden rounded-3xl">
        {trendingLoading || !featuredVideo ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            {featuredVideo.thumbnailUrl && (
              <Image
                src={featuredVideo.thumbnailUrl}
                alt="Featured video background"
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
              <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">{featuredVideo.title}</h1>
              <p className="max-w-xl text-lg text-foreground/80 mb-6 line-clamp-2">{featuredVideo.description}</p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/watch/${featuredVideo.id}`}>
                    <PlayCircle className="mr-2" />
                    Play Now
                  </Link>
                </Button>
                <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                    onClick={handleAddToWatchLater}
                    disabled={isAdding}
                >
                  {isAdding ? <Loader2 className="mr-2 animate-spin"/> : <Plus className="mr-2" />}
                  Add to List
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Category Carousel */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline">Browse by Category</h2>
          <Button variant="link" asChild>
            <Link href="/categories">See all</Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: true }}>
          <CarouselContent>
            {categories.map((category) => (
              <CarouselItem key={category.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <Link href={`/explore?category=${category.id}`}>
                  <div className="group relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </section>

      {/* Recommended For You */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Trending Now</h2>
         {trendingLoading ? (
          <VideoRowSkeleton />
        ) : trendingVideos && trendingVideos.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingVideos.slice(1, 6).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground col-span-full py-12">
            <p>No trending videos found.</p>
          </div>
        )}
      </section>

      {/* New Releases */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">New Releases</h2>
        {newReleasesLoading ? (
            <VideoRowSkeleton />
        ) : newReleases && newReleases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <div className="col-span-full">
                  <EmbeddedVideo />
                </div>
                {newReleases.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        ) : (
             <div className="text-center text-muted-foreground col-span-full py-12">
                <p>No new releases at the moment. Check back later!</p>
            </div>
        )}
      </section>
    </div>
  );
}
