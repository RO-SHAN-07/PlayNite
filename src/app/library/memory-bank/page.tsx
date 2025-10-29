'use client';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { Banknote, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import type { Memory, Video } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function MemoryBankPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const memoriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/memories`), orderBy('addedDate', 'desc'));
  }, [user, firestore]);

  const { data: memories, isLoading: memoriesLoading } = useCollection<Memory>(memoriesQuery);

  const videoIds = useMemoFirebase(() => {
    if (!memories) return [];
    return [...new Set(memories.map(m => m.videoId))];
  }, [memories]);

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || videoIds.length === 0) return null;
    return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
  }, [firestore, videoIds]);

  const { data: videos, isLoading: videosLoading } = useCollection<Video>(videosQuery);

  const videoMap = useMemoFirebase(() => {
    if (!videos) return new Map();
    return new Map(videos.map(video => [video.id, video]));
  }, [videos]);


  if (isUserLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  const isLoading = memoriesLoading || videosLoading;

  function formatTimestamp(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Banknote className="w-10 h-10 text-primary" />
          Memory Bank
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your saved video moments and notes.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-1/2" /></CardFooter>
                </Card>
            ))
          ) : memories && memories.length > 0 && videoMap.size > 0 ? (
            memories.map((memory) => {
              const video = videoMap.get(memory.videoId);
              if (!video) return null;
              
              const addedAt = (memory.addedDate as any)?.toDate ? formatDistanceToNow((memory.addedDate as any).toDate(), { addSuffix: true }) : 'recently';

              return (
                 <Card key={memory.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                           <Image src={video.thumbnailUrl} alt={video.title} width={120} height={68} className="rounded-md object-cover"/>
                           <div>
                            <CardTitle className="text-xl leading-tight line-clamp-2">{video.title}</CardTitle>
                             <CardDescription>Note added {addedAt}</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
                           {memory.note}
                         </blockquote>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-sm font-semibold text-primary">
                            Saved at {formatTimestamp(memory.timestamp)}
                        </div>
                        <Button asChild size="sm">
                            <Link href={`/watch/${video.id}?t=${memory.timestamp}`}>Jump to Moment</Link>
                        </Button>
                    </CardFooter>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">You haven't saved any memories yet.</p>
              <Button asChild variant="link"><Link href="/explore">Explore videos</Link></Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}