import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { categories, videos } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { VideoCard } from '@/components/video-card';
import { PlayCircle, Plus } from 'lucide-react';

export default function Home() {
  const featuredVideo = videos[0];
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden rounded-3xl">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Featured video background"
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">{featuredVideo.title}</h1>
          <p className="max-w-xl text-lg text-foreground/80 mb-6">{featuredVideo.description}</p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link href={`/watch/${featuredVideo.id}`}>
                <PlayCircle className="mr-2" />
                Play Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
              <Plus className="mr-2" />
              Add to List
            </Button>
          </div>
        </div>
      </section>

      {/* Category Carousel */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Browse by Category</h2>
        <Carousel opts={{ align: 'start', loop: true }}>
          <CarouselContent>
            {categories.map((category) => (
              <CarouselItem key={category.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <Link href={`/explore?category=${category.id}`}>
                  <div className="group relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </section>

      {/* Recommended For You */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.slice(1, 11).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Continue Watching */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">Continue Watching</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.slice(11, 16).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
