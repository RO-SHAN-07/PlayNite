'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Maximize, Minimize, Volume2, VolumeX, ExternalLink, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type VideoEmbedProps = {
  videoId: string;
  videoUrl: string;
  title?: string;
  duration?: string;
  views?: number;
  thumbnailUrl?: string;
  autoplay?: boolean;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  showControls?: boolean;
  showMetadata?: boolean;
  showThumbnailPreview?: boolean;
  onVideoLoad?: () => void;
  onVideoError?: () => void;
  onThumbnailLoad?: () => void;
};

export function VideoEmbed({
  videoId,
  videoUrl,
  title,
  duration,
  views,
  thumbnailUrl,
  autoplay = false,
  className,
  aspectRatio = '16:9',
  showControls = true,
  showMetadata = true,
  showThumbnailPreview = true,
  onVideoLoad,
  onVideoError,
  onThumbnailLoad
}: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [showThumbnail, setShowThumbnail] = useState(!autoplay && showThumbnailPreview);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const thumbnailRef = useRef<HTMLImageElement>(null);

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

  const formatViews = (viewCount?: number) => {
    if (!viewCount) return '';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(viewCount);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (showThumbnailPreview) {
      setShowThumbnail(false);
    }
    onVideoLoad?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onVideoError?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const playVideo = () => {
    setShowThumbnail(false);
    setIsPlaying(true);
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
    onThumbnailLoad?.();
  };

  const handleThumbnailError = () => {
    setThumbnailError(true);
    setThumbnailLoaded(true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body || (e.target as HTMLElement)?.tagName?.toLowerCase() !== 'input') {
        switch(e.key.toLowerCase()) {
          case 'm':
            toggleMute();
            break;
          case 'f':
            toggleFullscreen();
            break;
          case ' ':
          case 'k':
            if (showThumbnail) {
              e.preventDefault();
              playVideo();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showThumbnail]);

  // Handle autoplay
  useEffect(() => {
    if (autoplay) {
      setShowThumbnail(false);
      setIsPlaying(true);
    }
  }, [autoplay]);

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
      {/* Thumbnail preview */}
      {showThumbnail && !isLoading && (
        <div className="absolute inset-0">
          {thumbnailUrl ? (
            <img
              ref={thumbnailRef}
              src={thumbnailUrl}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover"
              onLoad={handleThumbnailLoad}
              onError={handleThumbnailError}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Thumbnail overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="lg"
              onClick={playVideo}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </Button>
          </div>

          {/* Play button in center when thumbnail is loaded */}
          {thumbnailLoaded && !thumbnailError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Button
                size="lg"
                onClick={playVideo}
                className="bg-black/50 hover:bg-black/70 border-0 opacity-80 hover:opacity-100 transition-all duration-300 scale-110"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </Button>
            </div>
          )}

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {duration}
            </div>
          )}
        </div>
      )}

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className={cn(
          'w-full h-full',
          showThumbnail && 'opacity-0 pointer-events-none',
          !showThumbnail && 'opacity-100 pointer-events-auto'
        )}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={title || 'Embedded video'}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && !isLoading && !hasError && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* Metadata overlay */}
      {showMetadata && (title || duration || views) && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/80 rounded-lg p-3 text-white">
            {title && (
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{title}</h3>
            )}
            <div className="flex items-center gap-2 text-xs text-white/80">
              {duration && <span>{duration}</span>}
              {duration && views && <span>•</span>}
              {views && <span>{formatViews(views)} views</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}