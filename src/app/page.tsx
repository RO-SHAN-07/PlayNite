
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
import { PlayCircle, Plus, Loader2, ArrowRight } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, limit, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

function VideoCarousel({ videos, loading }: { videos: Video[] | null, loading: boolean }) {
    if (loading) {
        return (
            <div className="flex space-x-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-64 flex-shrink-0 space-y-2">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <div className="space-y-1 p-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (!videos || videos.length === 0) {
        return <p className="text-muted-foreground">No videos found.</p>;
    }
    return (
        <Carousel opts={{ align: 'start', dragFree: true }}>
            <CarouselContent className="-ml-2">
                {videos.map((video) => (
                    <CarouselItem key={video.id} className="basis-auto pl-4">
                       <div className="w-64">
                         <VideoCard video={video} />
                       </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
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
    return query(collection(firestore, 'videos'), orderBy('uploadedAt', 'desc'), limit(10));
  }, [firestore]);

  const { data: trendingVideos, loading: trendingLoading } = useCollection<Video>(trendingVideosQuery);
  const { data: newReleases, loading: newReleasesLoading } = useCollection<Video>(newReleasesQuery);
  
  const featuredVideo = trendingVideos?.[0];

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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center justify-center">
        {trendingLoading || !featuredVideo ? (
          <Skeleton className="w-full h-full rounded-3xl" />
        ) : (
          <>
            {featuredVideo.thumbnailUrl && (
              <Image
                src={featuredVideo.thumbnailUrl}
                alt="Featured video background"
                fill
                className="object-cover rounded-3xl"
                data-ai-hint="abstract cinematic"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-3xl" />
            <div className="absolute bottom-8 left-8 right-8">
               <Card className="bg-background/60 backdrop-blur-xl border-white/10 p-6 rounded-2xl w-full max-w-2xl">
                 <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3 line-clamp-2">{featuredVideo.title}</h1>
                 <p className="max-w-xl text-md text-foreground/80 mb-5 line-clamp-2">{featuredVideo.description}</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                      <Link href={`/watch/${featuredVideo.id}`}>
                        <PlayCircle className="mr-2" />
                        Play Now
                      </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="secondary" 
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        onClick={handleAddToWatchLater}
                        disabled={isAdding}
                    >
                      {isAdding ? <Loader2 className="mr-2 animate-spin"/> : <Plus className="mr-2" />}
                      Add to List
                    </Button>
                 </div>
               </Card>
            </div>
          </>
        )}
      </section>
      

      {/* Category Carousel */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline">Browse by Category</h2>
          <Button variant="link" asChild>
            <Link href="/categories">See all <ArrowRight className="ml-1"/></Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: false }}>
          <CarouselContent className='-ml-4'>
            {categories.map((category) => (
              <CarouselItem key={category.id} className="md:basis-1/4 lg:basis-1/5 pl-4">
                <Link href={`/explore?category=${category.id}`}>
                  <div className="group relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={category.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Recommended For You */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Trending Now</h2>
        <VideoCarousel videos={trendingVideos} loading={trendingLoading} />
      </section>

      {/* New Releases */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">New Releases</h2>
        <VideoCarousel videos={newReleases} loading={newReleasesLoading} />
      </section>
    </div>
  );
}
