'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Share2, Plus } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default function WatchPage({ params }: { params: { id: string } }) {
  const video = videos.find((v) => v.id === params.id);
  const recommendedVideos = videos.filter((v) => v.id !== params.id).slice(0, 10);

  if (!video) {
    notFound();
  }

  const thumbnail = PlaceHolderImages.find((img) => img.id === video.thumbnailId);
  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  const formattedViews = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(video.views);

  const uploadedAt = formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
          {thumbnail && (
            <Image
              src={thumbnail.imageUrl}
              alt={video.title}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
              data-ai-hint={thumbnail.imageHint}
            />
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
              <Avatar>
                {avatar && <AvatarImage src={avatar.imageUrl} alt={video.creator} data-ai-hint={avatar.imageHint}/>}
                <AvatarFallback>{video.creator.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{video.creator}</p>
                <p className="text-sm text-muted-foreground">1.2M Subscribers</p>
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
               <Button variant="ghost" className="text-amber-400 hover:text-amber-500">
                <Star className="mr-2" /> Favorite
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
            {recommendedVideos.map(recVideo => (
                <VideoCard key={recVideo.id} video={recVideo} />
            ))}
        </div>
      </div>
    </div>
  );
}
