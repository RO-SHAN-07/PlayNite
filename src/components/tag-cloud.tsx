'use client';

import { generateContentTagsCloud } from '@/ai/flows/ai-created-content-tags-cloud';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const colors = [
  'bg-primary/20 text-primary-foreground border-primary/50 hover:bg-primary/30',
  'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/50 hover:bg-fuchsia-500/30',
  'bg-violet-500/20 text-violet-200 border-violet-500/50 hover:bg-violet-500/30',
  'bg-sky-500/20 text-sky-200 border-sky-500/50 hover:bg-sky-500/30',
  'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 hover:bg-emerald-500/30',
  'bg-amber-500/20 text-amber-200 border-amber-500/50 hover:bg-amber-500/30',
];

const fontSizes = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
];

export function TagCloud() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonWidths, setSkeletonWidths] = useState<string[]>([]);

  useEffect(() => {
    // Generate skeleton widths only on the client
    setSkeletonWidths(Array.from({ length: 15 }, () => `${Math.random() * 80 + 80}px`));

    async function fetchTags() {
      try {
        // No need to set loading to true here as it's the default state
        const result = await generateContentTagsCloud({});
        // Add more tags for a better visual effect
        const moreTags = [
          'Gaming', 'Live Streams', 'Tech Reviews', 'DIY Projects', 'Cooking Shows',
          'Travel Vlogs', 'Educational', 'Music Videos', 'Fitness Workouts', 'Unboxing',
          'Podcasts', 'ASMR', 'Comedy Skits', 'Movie Reviews', 'Space Docs'
        ];
        // Shuffle and combine to make it look dynamic
        setTags([...result.tags, ...moreTags].sort(() => 0.5 - Math.random()).slice(0, 25));
      } catch (error) {
        console.error('Failed to generate tag cloud:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4">
        {skeletonWidths.length > 0 ? (
          skeletonWidths.map((width, index) => (
            <Skeleton key={index} className="h-8 rounded-full" style={{ width }}/>
          ))
        ) : (
          // Render a static set of skeletons on the server to avoid hydration issues
          Array.from({ length: 15 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`cursor-pointer transition-all duration-300 transform hover:scale-110 ${
            colors[index % colors.length]
          } ${fontSizes[index % fontSizes.length]}`}
          style={{
             padding: `${(index % 3 + 2) * 4}px ${(index % 3 + 4) * 4}px`
          }}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
