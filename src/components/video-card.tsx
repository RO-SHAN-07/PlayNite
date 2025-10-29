'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { Video } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { PlayCircle } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';
import { UserProfile } from '@/lib/data';
import { cn } from '@/lib/utils';

type VideoCardProps = {
  video: Video;
  active?: boolean;
};

export function VideoCard({ video, active = false }: VideoCardProps) {
  const firestore = useFirestore();

  const creatorRef = useMemoFirebase(() => {
    if (!firestore || !video.creatorId) return null;
    return doc(firestore, 'users', video.creatorId);
  }, [firestore, video.creatorId]);

  const { data: creator, isLoading: creatorLoading } = useDoc<UserProfile>(creatorRef);
  
  const formattedViews = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(video.views);

  const uploadedAt = video.uploadedAt ? formatDistanceToNow(video.uploadedAt.toDate(), { addSuffix: true }) : 'unknown';
  
  return (
    <Link href={`/watch/${video.id}`}>
      <Card className={cn("overflow-hidden border-none bg-transparent shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20", active && "bg-primary/10")}>
        <CardContent className="p-0">
          <div className="group relative aspect-video overflow-hidden rounded-lg">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                width={400}
                height={225}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
                <Skeleton className="w-full h-full" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white/80" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
          <div className="flex items-start gap-4 p-2">
           {creatorLoading ? (
             <Skeleton className="h-10 w-10 rounded-full" />
           ) : (
            <Avatar className="h-10 w-10">
              {creator?.photoURL && <AvatarImage src={creator.photoURL} alt={creator.displayName || ''} />}
              <AvatarFallback>{creator?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
           )}
            <div className="flex-1">
              <h3 className="font-semibold leading-tight mb-1 line-clamp-2">{video.title}</h3>
              {creatorLoading ? (
                 <Skeleton className="h-4 w-24 mt-1" />
              ) : (
                <p className="text-sm text-muted-foreground">{creator?.displayName || 'Unknown Creator'}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formattedViews} views &bull; {uploadedAt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
