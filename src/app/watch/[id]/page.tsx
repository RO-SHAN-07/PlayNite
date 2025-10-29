'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video-card';
import { type Video } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Share2, Plus, Loader2, Play } from 'lucide-react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, serverTimestamp, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { useMemo, useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function WatchPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const videoRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'videos', params.id);
  }, [firestore, params.id]);
  const { data: video, loading: videoLoading } = useDoc<Video>(videoRef);

  const creatorRef = useMemo(() => {
    if (!firestore || !video?.creatorId) return null;
    return doc(firestore, 'users', video.creatorId);
  }, [firestore, video?.creatorId]);
  const { data: creator, loading: creatorLoading } = useDoc(creatorRef);
  
  const favoritesRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/favorites`);
  }, [firestore, user]);
  const favoriteQuery = useMemo(() => {
    if (!favoritesRef) return null;
    return query(favoritesRef, where('videoId', '==', params.id), limit(1));
  }, [favoritesRef, params.id]);

  const { data: favorite, loading: favoriteLoading } = useCollection(favoriteQuery);
  const isFavorited = favorite && favorite.length > 0;

  const recommendedVideosQuery = useMemo(() => {
    if (!firestore || !video) return null;
    return query(
      collection(firestore, 'videos'), 
      where('categoryId', '==', video.categoryId),
      limit(10)
    );
  }, [firestore, video]);
  const { data: recommendedVideos, loading: recommendedVideosLoading } = useCollection<Video>(recommendedVideosQuery);


  // Add to history
  useEffect(() => {
    if (user && firestore && video) {
      const historyRef = doc(firestore, `users/${user.uid}/history`, video.id);
      setDoc(historyRef, {
        videoId: video.id,
        watchedAt: serverTimestamp(),
      }, { merge: true });
    }
  }, [user, firestore, video]);

  const handleFavorite = async () => {
    if (!user || !firestore || !video) {
        toast({
            variant: 'destructive',
            title: 'Please log in',
            description: 'You need to be logged in to favorite a video.',
        });
        router.push('/auth/login');
        return;
    }

    const favoriteRef = doc(firestore, `users/${user.uid}/favorites`, video.id);

    if (isFavorited) {
        await deleteDoc(favoriteRef);
        toast({ title: 'Removed from favorites' });
    } else {
        await setDoc(favoriteRef, {
            videoId: video.id,
            favoritedAt: serverTimestamp(),
        });
        toast({ title: 'Added to favorites!' });
    }
  };


  if (videoLoading) {
    return <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
    </div>;
  }

  if (!video) {
    notFound();
  }

  const formattedViews = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(video.views);

  const uploadedAt = video.uploadedAt ? formatDistanceToNow(video.uploadedAt.toDate(), { addSuffix: true }) : "somewhen";

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
          ) : (
             <Play className="h-24 w-24 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold font-headline">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>{formattedViews} views</span>
            <span>&bull;</span>
            <span>{uploadedAt}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
             {creatorLoading ? <Skeleton className="h-12 w-12 rounded-full" /> : (
              <Avatar>
                {creator?.photoURL && <AvatarImage src={creator.photoURL} alt={creator.displayName}/>}
                <AvatarFallback>{creator?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
             )}
              <div>
                {creatorLoading ? (
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ) : (
                    <>
                     <p className="font-semibold">{creator?.displayName}</p>
                     <p className="text-sm text-muted-foreground">1.2M Subscribers</p>
                    </>
                )}
              </div>
              <Button variant="outline">Subscribe</Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost">
                <ThumbsUp className="mr-2" /> 
                15K
              </Button>
              <Button variant="ghost">
                <ThumbsDown />
              </Button>
               <Button variant="ghost">
                <Share2 className="mr-2" /> Share
              </Button>
               <Button variant="ghost">
                <Plus className="mr-2" /> Add to List
              </Button>
               <Button variant="ghost" className={isFavorited ? "text-amber-400 hover:text-amber-500" : ""} onClick={handleFavorite} disabled={favoriteLoading}>
                {favoriteLoading ? <Loader2 className="animate-spin mr-2"/> : <Star className="mr-2" />}
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{video.description}</p>
        </div>

      </div>
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-2xl font-bold font-headline">Up Next</h2>
        <div className="flex flex-col gap-4">
            {recommendedVideosLoading 
              ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : recommendedVideos?.filter(v => v.id !== video.id).map(recVideo => (
                <VideoCard key={recVideo.id} video={recVideo} />
            ))}
        </div>
      </div>
    </div>
  );
}
