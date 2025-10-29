import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
  const favoritedVideos = videos; 

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Star className="w-10 h-10 text-primary" />
          Favorites
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          All the videos you've marked as favorites.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favoritedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
