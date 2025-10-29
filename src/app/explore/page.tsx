import { TagCloud } from '@/components/tag-cloud';
import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';

export default function ExplorePage() {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold font-headline mb-4">Explore Content</h1>
        <p className="text-lg text-muted-foreground">
          Discover new videos, trending topics, and popular categories.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Trending Tags</h2>
        <TagCloud />
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Popular Right Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.slice(0, 10).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
