'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video-card';
import { type Video, type Memory } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Share2, Plus, Loader2, Banknote } from 'lucide-react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, serverTimestamp, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/video-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id: videoId } = params;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoPlayerRef = useRef<{ getCurrentTime: () => number }>(null);

  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false);
  const [memoryNote, setMemoryNote] = useState('');
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  const videoRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'videos', videoId);
  }, [firestore, videoId]);
  const { data: video, isLoading: videoLoading } = useDoc<Video>(videoRef);

  const creatorRef = useMemoFirebase(() => {
    if (!firestore || !video?.creatorId) return null;
    return doc(firestore, 'users', video.creatorId);
  }, [firestore, video?.creatorId]);
  const { data: creator, isLoading: creatorLoading } = useDoc(creatorRef);
  
  const favoritesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/favorites`);
  }, [firestore, user]);
  const favoriteQuery = useMemoFirebase(() => {
    if (!favoritesRef) return null;
    return query(favoritesRef, where('videoId', '==', videoId), limit(1));
  }, [favoritesRef, videoId]);

  const { data: favorite, isLoading: favoriteLoading } = useCollection(favoriteQuery);
  const isFavorited = favorite && favorite.length > 0;

  const recommendedVideosQuery = useMemoFirebase(() => {
    if (!firestore || !video) return null;
    return query(
      collection(firestore, 'videos'), 
      where('categoryId', '==', video.categoryId),
      limit(10)
    );
  }, [firestore, video]);
  const { data: recommendedVideos, isLoading: recommendedVideosLoading } = useCollection<Video>(recommendedVideosQuery);


  // Add to history
  useEffect(() => {
    if (user && firestore && video) {
      const historyRef = doc(firestore, `users/${user.uid}/video_history`, video.id);
      setDocumentNonBlocking(historyRef, {
        videoId: video.id,
        watchDate: serverTimestamp(),
      }, { merge: true });
    }
  }, [user, firestore, video]);
  
  const startTime = searchParams.get('t');

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
        deleteDocumentNonBlocking(favoriteRef);
        toast({ title: 'Removed from favorites' });
    } else {
        setDocumentNonBlocking(favoriteRef, {
            videoId: video.id,
            addedDate: serverTimestamp(),
        }, { merge: true });
        toast({ title: 'Added to favorites!' });
    }
  };

  const handleSaveMemory = async () => {
    if (!user || !firestore || !video || !videoPlayerRef.current) return;

    setIsSavingMemory(true);
    try {
        const memoriesCollection = collection(firestore, 'memories');
        const currentTime = videoPlayerRef.current.getCurrentTime();
        
        await addDocumentNonBlocking(memoriesCollection, {
            videoId: video.id,
            userId: user.uid,
            timestamp: currentTime,
            note: memoryNote,
            addedDate: serverTimestamp(),
        });
        
        toast({ title: 'Memory Saved!', description: 'Your note has been added to your Memory Bank.'});
        setIsMemoryDialogOpen(false);
        setMemoryNote('');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save memory.' });
    } finally {
        setIsSavingMemory(false);
    }
  }


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
    <>
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
            <VideoPlayer ref={videoPlayerRef} src={video.videoUrl} poster={video.thumbnailUrl} startTime={startTime ? Number(startTime) : undefined} />
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

            <div className="flex items-center gap-1 flex-wrap">
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
               <Button variant="ghost" onClick={() => setIsMemoryDialogOpen(true)}>
                  <Banknote className="mr-2" /> Save Memory
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

    <Dialog open={isMemoryDialogOpen} onOpenChange={setIsMemoryDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Save a Memory</DialogTitle>
                <DialogDescription>
                    Add a note to this moment in the video. It will be saved to your Memory Bank.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="memory-note">Your Note</Label>
                    <Textarea 
                        id="memory-note"
                        placeholder="What's special about this moment?"
                        value={memoryNote}
                        onChange={(e) => setMemoryNote(e.target.value)}
                        className="resize-y"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMemoryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveMemory} disabled={isSavingMemory}>
                    {isSavingMemory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Memory
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
