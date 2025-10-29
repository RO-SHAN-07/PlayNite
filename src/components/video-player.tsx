'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  Rewind,
  Loader2,
  PictureInPicture2,
  Settings,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


type VideoPlayerProps = {
  src: string;
  poster?: string;
};

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  let controlsTimeout: NodeJS.Timeout;

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    if (isPlaying) {
      controlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const onTimeUpdate = () => {
        if (!isNaN(video.duration)) {
            setProgress(video.currentTime);
        }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if((e.target as HTMLElement)?.tagName?.toLowerCase() === 'input') return;
        switch(e.key.toLowerCase()){
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'm':
                toggleMute();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'arrowright':
                handleSeek(10);
                break;
            case 'arrowleft':
                handleSeek(-10);
                break;
        }
    }
    
    container.addEventListener('mousemove', handleMouseMove);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(controlsTimeout);
      container.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
  };
  
  const handleSeek = (amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += amount;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePictureInPicture = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => { if(isPlaying) setShowControls(false) }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />
      {isLoading && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300',
          (showControls || !isPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-mono w-14 text-center">{formatTime(progress)}</span>
          <Slider
            min={0}
            max={duration}
            step={1}
            value={[progress]}
            onValueChange={handleProgressChange}
            className="w-full"
          />
          <span className="text-sm font-mono w-14 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleSeek(-10)} className="text-white hover:bg-white/10">
              <Rewind />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => handleSeek(10)} className="text-white hover:bg-white/10">
              <FastForward />
            </Button>
            <div className="flex items-center gap-2 w-32">
                 <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">
                    {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                </Button>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 bg-black/80 border-white/20 text-white p-2">
                <div className="text-sm font-bold mb-2 px-2">Playback Speed</div>
                 {playbackRates.map(rate => (
                    <button 
                        key={rate} 
                        onClick={() => setPlaybackRate(rate)} 
                        className={cn(
                            "w-full text-left p-2 text-sm rounded-md hover:bg-white/10",
                            playbackRate === rate && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                 ))}
              </PopoverContent>
            </Popover>
            
             {document.pictureInPictureEnabled && (
                <Button variant="ghost" size="icon" onClick={togglePictureInPicture} className="text-white hover:bg-white/10">
                    <PictureInPicture2 />
                </Button>
             )}
             <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
                {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
