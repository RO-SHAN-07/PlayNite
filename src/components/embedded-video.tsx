'use client';

type EmbeddedVideoProps = {
  viewkey: string;
};

export function EmbeddedVideo({ viewkey }: EmbeddedVideoProps) {
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        src={`https://www.pornhub.com/embed/${viewkey}`}
        frameBorder="0"
        width="100%"
        height="100%"
        scrolling="no"
        allowFullScreen
      ></iframe>
    </div>
  );
}
