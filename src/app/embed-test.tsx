'use client';

import { VideoEmbed } from '@/components/video-embed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EmbedTestPage() {
  // Test video configuration for the specific video mentioned
  const testVideo = {
    videoId: '0ef399b63a72d0e4ab57',
    videoUrl: 'https://www.pornhub.com/view_video.php?viewkey=0ef399b63a72d0e4ab57',
    title: 'Test Embedded Video',
    duration: '10:30',
    views: 125000,
    thumbnailUrl: '/api/placeholder/400/225',
    isEmbedded: true,
    embedProvider: 'adult' as const,
    videoKey: '0ef399b63a72d0e4ab57'
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Video Embed Test</h1>
        <p className="text-muted-foreground">
          Testing iframe-based video embedding functionality
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Standard Embed</CardTitle>
            <CardDescription>
              Basic video embed with metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoEmbed
              videoId={testVideo.videoId}
              videoUrl={testVideo.videoUrl}
              title={testVideo.title}
              duration={testVideo.duration}
              views={testVideo.views}
              thumbnailUrl={testVideo.thumbnailUrl}
              autoplay={false}
              showControls={true}
              showMetadata={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compact Embed</CardTitle>
            <CardDescription>
              Minimal controls and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoEmbed
              videoId={testVideo.videoId}
              videoUrl={testVideo.videoUrl}
              title={testVideo.title}
              aspectRatio="4:3"
              showControls={true}
              showMetadata={false}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Full Width Embed</CardTitle>
            <CardDescription>
              Responsive embed with all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoEmbed
              videoId={testVideo.videoId}
              videoUrl={testVideo.videoUrl}
              title={testVideo.title}
              duration={testVideo.duration}
              views={testVideo.views}
              autoplay={false}
              aspectRatio="16:9"
              showControls={true}
              showMetadata={true}
              onVideoLoad={() => console.log('Video loaded')}
              onVideoError={() => console.log('Video failed to load')}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Badge variant="secondary">Iframe Support</Badge>
              <Badge variant="secondary">Fullscreen</Badge>
              <Badge variant="secondary">Keyboard Controls</Badge>
              <Badge variant="secondary">Responsive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div><kbd className="px-2 py-1 bg-muted rounded">M</kbd> - Mute/Unmute</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">F</kbd> - Fullscreen</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Video Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm">
              <div>ID: {testVideo.videoId}</div>
              <div>Provider: {testVideo.embedProvider}</div>
              <div>Duration: {testVideo.duration}</div>
              <div>Views: {testVideo.views.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}