'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Maximize, Minimize, Volume2, VolumeX, ExternalLink, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type VideoEmbedProps = {
  videoId: string;
  videoUrl: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
};

export function VideoEmbed({
  videoId,
  videoUrl,
  title,
  autoplay = false,
  className,
  aspectRatio = '16:9',
}: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Calculate aspect ratio styles
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body || (e.target as HTMLElement)?.tagName?.toLowerCase() !== 'input') {
        if(e.key.toLowerCase() === 'f') {
            toggleFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const embedUrl = videoUrl.includes('pornhub.com') ? videoUrl.replace('view_video.php?viewkey=', 'embed/') : videoUrl;


  if (hasError) {
    return (
      <div className={cn('relative w-full bg-muted rounded-lg overflow-hidden', getAspectRatioClass(), className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <ExternalLink className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Video unavailable</h3>
            <p className="text-muted-foreground mb-4">
              This video cannot be embedded or is not available.
            </p>
            <Button asChild>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch on original site
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black rounded-lg overflow-hidden group',
        getAspectRatioClass(),
        className
      )}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className='w-full h-full'
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={title || 'Embedded video'}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10 h-8 w-8"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
