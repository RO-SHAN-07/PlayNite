import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { History, Star, Upload } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const favoritedVideos = videos.slice(0, 5);
  const historyVideos = videos.slice(5, 10);
  const uploadedVideos = videos.slice(10, 15);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold font-headline mb-4">My Library</h1>
        <p className="text-lg text-muted-foreground">
          Your saved videos, watch history, and uploads all in one place.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Star className="text-primary" />
            Favorites
          </h2>
          <Link href="/library/favorites" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favoritedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <History className="text-primary" />
            Recently Watched
          </h2>
          <Link href="/library/history" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {historyVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Upload className="text-primary" />
            My Uploads
          </h2>
          <Link href="/studio" className="text-sm text-primary hover:underline">
            Go to Studio
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {uploadedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
