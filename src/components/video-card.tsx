import Image from 'next/image';
import Link from 'next/link';
import type { Video } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { PlayCircle } from 'lucide-react';

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  const thumbnail = PlaceHolderImages.find((img) => img.id === video.thumbnailId);
  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  const formattedViews = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(video.views);

  const uploadedAt = formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true });

  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="overflow-hidden border-none bg-transparent shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
        <CardContent className="p-0">
          <div className="group relative aspect-video overflow-hidden">
            {thumbnail && (
              <Image
                src={thumbnail.imageUrl}
                alt={video.title}
                width={400}
                height={225}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={thumbnail.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white/80" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <Avatar className="h-10 w-10">
              {avatar && <AvatarImage src={avatar.imageUrl} alt={video.creator} data-ai-hint={avatar.imageHint} />}
              <AvatarFallback>{video.creator.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold leading-tight mb-1 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.creator}</p>
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
