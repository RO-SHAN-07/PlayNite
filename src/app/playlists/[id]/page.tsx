'use client';
import { useState, useEffect, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where, writeBatch, arrayRemove } from 'firebase/firestore';
import { Playlist, Video, UserProfile } from '@/lib/data';
import { Loader2, ListVideo, Play, GripVertical, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function DraggableVideoItem({ video, creator, index, onRemove }: { video: Video, creator: UserProfile | null, index: number, onRemove: (videoId: string) => void }) {
    const [isRemoving, setIsRemoving] = useState(false);
    
    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsRemoving(true);
        onRemove(video.id);
        // Optimistic UI, parent handles actual removal and potential revert
    }

    return (
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group" draggable="true">
            <span className="text-muted-foreground text-sm w-6 text-center cursor-grab"><GripVertical className="inline"/></span>
            <Link href={`/watch/${video.id}`} className="flex-1 flex items-center gap-4">
                <div className="relative w-32 h-18 rounded-md overflow-hidden flex-shrink-0">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white"/>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{creator?.displayName || video.creator}</p>
                </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isRemoving}>
                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />}
            </Button>
        </div>
    )
}


export default function PlaylistDetailsPage({ params }: { params: { id: string } }) {
  const { id: playlistId } = params;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const playlistRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/playlists`, playlistId);
  }, [user, firestore, playlistId]);

  const { data: playlist, isLoading: playlistLoading, refresh } = useDoc<Playlist>(playlistRef);
  
  const videosQuery = useMemoFirebase(() => {
    if (!firestore || !playlist || playlist.videoIds.length === 0) return null;
    return query(collection(firestore, 'videos'), where('__name__', 'in', playlist.videoIds));
  }, [firestore, playlist]);

  const { data: videos, isLoading: videosLoading } = useCollection<Video>(videosQuery);
  
  const videoMap = useMemo(() => new Map(videos?.map(v => [v.id, v])), [videos]);
  
  const orderedVideos = useMemo(() => {
    if (!playlist || !videoMap) return [];
    return playlist.videoIds.map(id => videoMap.get(id)).filter(Boolean) as Video[];
  }, [playlist, videoMap]);
  
  const creatorIds = useMemo(() => {
    if (!orderedVideos) return [];
    return [...new Set(orderedVideos.map(v => v.creatorId))];
  }, [orderedVideos]);

  const creatorsQuery = useMemoFirebase(() => {
    if(!firestore || creatorIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('__name__', 'in', creatorIds))
  }, [firestore, creatorIds]);

  const {data: creators, isLoading: creatorsLoading } = useCollection<UserProfile>(creatorsQuery);
  const creatorMap = useMemo(() => new Map(creators?.map(c => [c.uid, c])), [creators]);
  

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);
  
  const handleRemoveVideo = async (videoId: string) => {
    if (!playlistRef || !playlist) return;
    try {
        await updateDocumentNonBlocking(playlistRef, {
            videoIds: arrayRemove(videoId),
            videoCount: (playlist.videoCount || 0) - 1,
        });
        toast({ title: 'Video Removed', description: 'The video has been removed from your playlist.' });
        // The useDoc listener will handle the UI update
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove the video.' });
    }
  }
  
  const handleDeletePlaylist = async () => {
    if (!playlistRef) return;
    try {
        await deleteDoc(playlistRef);
        toast({ title: 'Playlist Deleted', description: `"${playlist?.name}" has been deleted.` });
        router.push('/library/playlists');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the playlist.' });
    }
  }


  if (playlistLoading || isUserLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  if (!playlist) {
    notFound();
  }

  const isLoading = videosLoading || creatorsLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex-shrink-0">
          <div className="aspect-square relative rounded-xl shadow-lg overflow-hidden">
            <Image src={`https://picsum.photos/seed/${playlist.id}/400/400`} alt={playlist.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Playlist</p>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline break-words">{playlist.name}</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl">{playlist.description}</p>
            <div className="flex items-center gap-4 text-muted-foreground mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        {user?.photoURL && <AvatarImage src={user.photoURL}/>}
                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user?.displayName}</span>
                </div>
                <span>&bull;</span>
                <span>{playlist.videoCount || 0} videos</span>
                 <span>&bull;</span>
                <span>Created {playlist.createdAt ? formatDistanceToNow(playlist.createdAt.toDate(), { addSuffix: true }) : ''}</span>
            </div>
            <div className="flex gap-2 mt-6">
                <Button size="lg"><Play className="mr-2"/> Play All</Button>
                <Button size="lg" variant="outline"><Edit className="mr-2"/> Edit Details</Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="lg" variant="destructive" ><Trash2 className="mr-2" /> Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{playlist.name}" playlist. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlaylist}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
            Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : orderedVideos.length > 0 ? (
            orderedVideos.map((video, index) => (
                <DraggableVideoItem key={video.id} video={video} index={index} creator={creatorMap.get(video.creatorId) || null} onRemove={handleRemoveVideo} />
            ))
        ) : (
             <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                <h3 className="mt-4 text-lg font-semibold">Playlist is empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Find some videos to add to this playlist.
                </p>
                 <Button asChild className="mt-4"><Link href="/explore">Explore Videos</Link></Button>
            </div>
        )}
      </div>
    </div>
  );
}
