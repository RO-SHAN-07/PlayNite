'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video-card';
import { type Video, UserProfile, Comment, VideoLike, Playlist } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Share2, Loader2, Send, ListPlus } from 'lucide-react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, serverTimestamp, query, where, limit, orderBy, arrayUnion } from 'firebase/firestore';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/video-player';
import { VideoEmbed } from '@/components/video-embed';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function CommentItem({ comment }: { comment: Comment }) {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', comment.userId);
    }, [firestore, comment.userId]);
    const { data: user, isLoading } = useDoc<UserProfile>(userRef);

    if (isLoading) return <Skeleton className="h-16 w-full" />

    return (
        <div className="flex gap-3">
            <Avatar className="w-10 h-10">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'user'} />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{user?.displayName || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                        {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : 'just now'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
            </div>
        </div>
    )
}

function CommentsSection({ videoId }: { videoId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [commentText, setCommentText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const commentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `videos/${videoId}/comments`), orderBy('timestamp', 'desc'));
    }, [firestore, videoId]);

    const { data: comments, loading } = useCollection<Comment>(commentsQuery);
  
    const handlePostComment = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Please log in to comment.' });
            return;
        }
        if (!commentText.trim()) return;

        setIsPosting(true);
        try {
            const commentsCollection = collection(firestore, `videos/${videoId}/comments`);
            await addDocumentNonBlocking(commentsCollection, {
                videoId,
                userId: user.uid,
                text: commentText,
                timestamp: serverTimestamp(),
            });
            setCommentText('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error posting comment.' });
        } finally {
            setIsPosting(false);
        }
    }

    return (
        <div className="bg-muted/30 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">{comments?.length || 0} Comments</h2>
            {user && (
                <div className="flex gap-3 mb-6">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Textarea 
                            placeholder="Add a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="bg-background pr-12"
                        />
                        <Button 
                            size="icon" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={handlePostComment}
                            disabled={isPosting || !commentText.trim()}
                        >
                            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4"/>}
                        </Button>
                    </div>
                </div>
            )}
            <div className="space-y-6">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : comments && comments.length > 0 ? (
                    comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">Be the first to comment!</p>
                )}
            </div>
        </div>
    );
}

function AddToPlaylistDialog({ videoId, open, onOpenChange }: { videoId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const playlistsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/playlists`), orderBy('createdAt', 'desc'));
    }, [user, firestore]);

    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsQuery);
    
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
    
    useEffect(() => {
        if(playlists && videoId){
            const initialSelected = playlists.filter(p => p.videoIds.includes(videoId)).map(p => p.id);
            setSelectedPlaylists(initialSelected);
        }
    }, [playlists, videoId])


    const handlePlaylistToggle = async (playlistId: string, isChecked: boolean) => {
        if (!user || !firestore) return;
        const playlistRef = doc(firestore, `users/${user.uid}/playlists`, playlistId);
        
        // Optimistic update
        const originalSelected = [...selectedPlaylists];
        setSelectedPlaylists(current => isChecked ? [...current, playlistId] : current.filter(id => id !== playlistId));

        try {
            const playlist = playlists?.find(p => p.id === playlistId);
            if (!playlist) return;

            const videoIds = isChecked 
                ? arrayUnion(videoId) 
                : arrayRemove(videoId);
            
            const videoCount = isChecked ? (playlist.videoCount || 0) + 1 : Math.max(0, (playlist.videoCount || 0) - 1);

            await updateDocumentNonBlocking(playlistRef, { videoIds, videoCount, updatedAt: serverTimestamp() });
        } catch (error) {
            // Revert on error
            setSelectedPlaylists(originalSelected);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update playlist.' });
        }
    }

    if (isLoading || isUserLoading) {
        return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><Loader2 className="w-8 h-8 animate-spin mx-auto my-8"/></DialogContent></Dialog>;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to playlist</DialogTitle>
                    <DialogDescription>Select the playlists you want to add this video to.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
                    {playlists && playlists.length > 0 ? playlists.map(playlist => (
                        <div key={playlist.id} className="flex items-center space-x-3">
                            <Checkbox 
                                id={playlist.id} 
                                checked={selectedPlaylists.includes(playlist.id)}
                                onCheckedChange={(checked) => handlePlaylistToggle(playlist.id, !!checked)}
                            />
                            <Label htmlFor={playlist.id} className="flex-1 cursor-pointer">{playlist.name} ({playlist.videoCount || 0})</Label>
                        </div>
                    )) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>You don't have any playlists.</p>
                             <Button variant="link" asChild><Link href="/library/playlists">Create one?</Link></Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id: videoId } = params;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoPlayerRef = useRef<{ getCurrentTime: () => number }>(null);

  const videoRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'videos', videoId);
  }, [firestore, videoId]);
  const { data: video, isLoading: videoLoading } = useDoc<Video>(videoRef);

  const creatorRef = useMemoFirebase(() => {
    if (!firestore || !video?.creatorId) return null;
    return doc(firestore, 'users', video.creatorId);
  }, [firestore, video?.creatorId]);
  const { data: creator, isLoading: creatorLoading } = useDoc<UserProfile>(creatorRef);
  
  const favoriteQuery = useMemoFirebase(() => {
    if (!firestore || !user || !videoId) return null;
    return query(collection(firestore, `users/${user.uid}/favorites`), where('videoId', '==', videoId), limit(1));
  }, [firestore, user, videoId]);

  const { data: favorite, loading: favoriteLoading } = useCollection(favoriteQuery);
  const isFavoritedInitially = useMemo(() => favorite && favorite.length > 0, [favorite]);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const likesQuery = useMemoFirebase(() => {
    if (!firestore || !videoId) return null;
    return collection(firestore, 'videos', videoId, 'likes');
    }, [firestore, videoId]);

    const { data: likes, loading: likesLoading } = useCollection<VideoLike>(likesQuery);

    const userLikeQuery = useMemoFirebase(() => {
        if (!firestore || !user || !videoId) return null;
        return doc(firestore, 'videos', videoId, 'likes', user.uid);
    }, [firestore, videoId, user]);
    
    const { data: userLike, isLoading: userLikeLoading } = useDoc<VideoLike>(userLikeQuery);
    const [isLiking, setIsLiking] = useState(false);


    const likeCount = useMemo(() => likes?.filter(l => l.type === 'like').length || 0, [likes]);
    const dislikeCount = useMemo(() => likes?.filter(l => l.type === 'dislike').length || 0, [likes]);
  
  useEffect(() => {
    setIsFavorited(isFavoritedInitially);
  }, [isFavoritedInitially]);

  const recommendedVideosQuery = useMemoFirebase(() => {
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
      const historyRef = doc(firestore, `users/${user.uid}/video_history`, video.id);
      setDocumentNonBlocking(historyRef, {
        videoId: video.id,
        watchDate: serverTimestamp(),
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
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

    setIsFavoriting(true);
    const favoriteRef = doc(firestore, `users/${user.uid}/favorites`, video.id);
    
    try {
      if (isFavorited) {
          await deleteDocumentNonBlocking(favoriteRef);
          toast({ title: 'Removed from favorites' });
          setIsFavorited(false);
      } else {
          await setDocumentNonBlocking(favoriteRef, {
              videoId: video.id,
              addedDate: serverTimestamp(),
          }, { merge: true });
          toast({ title: 'Added to favorites!' });
          setIsFavorited(true);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update favorites.' });
    } finally {
        setIsFavoriting(false);
    }
  };

  const handleLike = async (type: 'like' | 'dislike') => {
    if (!user || !firestore || !video) {
        toast({ variant: 'destructive', title: 'Please log in to react.' });
        router.push('/auth/login');
        return;
    }
    setIsLiking(true);
    const likeRef = doc(firestore, `videos/${video.id}/likes/${user.uid}`);
    try {
        if (userLike && userLike.type === type) {
            await deleteDocumentNonBlocking(likeRef);
        } else {
            await setDocumentNonBlocking(likeRef, { type }, { merge: true });
        }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save reaction.' });
    } finally {
        setIsLiking(false);
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link Copied!', description: 'Video link copied to your clipboard.' });
  }

    const handleAddToPlaylist = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Please log in', description: 'You need to be logged in to manage playlists.' });
            router.push('/auth/login');
            return;
        }
        setShowAddToPlaylist(true);
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
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
            {video.isEmbedded ? (
                <VideoEmbed
                    videoId={video.id}
                    videoUrl={video.embedUrl || video.videoUrl}
                    title={video.title}
                    duration={video.duration}
                    views={video.views}
                    thumbnailUrl={video.thumbnailUrl}
                    autoplay={true}
                    showControls={true}
                    showMetadata={true}
                    aspectRatio="16:9"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <VideoPlayer ref={videoPlayerRef} src={video.videoUrl} poster={video.thumbnailUrl} startTime={startTime ? Number(startTime) : undefined} />
                </div>
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
              <Link href={`/creator/${video.creatorId}`}>
                 {creatorLoading ? <Skeleton className="h-12 w-12 rounded-full" /> : (
                  <Avatar>
                    {creator?.photoURL && <AvatarImage src={creator.photoURL} alt={creator.displayName || ''}/>}
                    <AvatarFallback>{creator?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                 )}
              </Link>
              <div>
                {creatorLoading ? (
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ) : (
                    <>
                     <Link href={`/creator/${video.creatorId}`} className="font-semibold hover:underline">{creator?.displayName}</Link>
                     <p className="text-sm text-muted-foreground">1.2M Subscribers</p>
                    </>
                )}
              </div>
              <Button variant="outline">Subscribe</Button>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <Button variant="ghost" onClick={() => handleLike('like')} className={userLike?.type === 'like' ? 'text-primary' : ''} disabled={isLiking}>
                <ThumbsUp className="mr-2" /> 
                {likeCount}
              </Button>
              <Button variant="ghost" onClick={() => handleLike('dislike')} className={userLike?.type === 'dislike' ? 'text-primary' : ''} disabled={isLiking}>
                <ThumbsDown />
              </Button>
               <Button variant="ghost" onClick={handleShare}>
                <Share2 className="mr-2" /> Share
              </Button>
               <Button variant="ghost" onClick={handleAddToPlaylist}>
                 <ListPlus className="mr-2" /> Add to Playlist
               </Button>
               <Button variant="ghost" className={isFavorited ? "text-amber-400 hover:text-amber-500" : ""} onClick={handleFavorite} disabled={isFavoriting || favoriteLoading}>
                {isFavoriting || favoriteLoading ? <Loader2 className="animate-spin mr-2"/> : <Star className="mr-2" />}
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{video.description}</p>
        </div>
        
        <CommentsSection videoId={videoId} />

      </div>
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-2xl font-bold font-headline">Up Next</h2>
        <div className="flex flex-col gap-4">
            {recommendedVideosLoading 
              ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : recommendedVideos?.filter(v => v.id !== video.id).map(recVideo => (
                <VideoCard key={recVideo.id} video={recVideo} active={recVideo.id === video.id} />
            ))}
        </div>
      </div>
    </div>
    <AddToPlaylistDialog videoId={videoId} open={showAddToPlaylist} onOpenChange={setShowAddToPlaylist} />
    </>
  );
}
