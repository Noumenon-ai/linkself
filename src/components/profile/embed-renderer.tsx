interface EmbedRendererProps {
  title: string;
  embedUrl: string;
}

function getYouTubeVideoId(url: string): string | null {
  // Handle youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // Handle youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function getSpotifyEmbedUrl(url: string): { src: string; height: number } | null {
  // Convert open.spotify.com/track/ID to embed URL
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const type = match[1];
  const id = match[2];
  const height = type === "track" ? 80 : 380;
  return { src: `https://open.spotify.com/embed/${type}/${id}`, height };
}

export function EmbedRenderer({ title, embedUrl }: EmbedRendererProps) {
  if (!embedUrl) return null;

  // YouTube
  const ytId = getYouTubeVideoId(embedUrl);
  if (ytId) {
    return (
      <div className="w-full space-y-2">
        {title && <p className="text-sm font-semibold text-center opacity-80">{title}</p>}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-xl"
            style={{ border: 0 }}
          />
        </div>
      </div>
    );
  }

  // Spotify
  const spotify = getSpotifyEmbedUrl(embedUrl);
  if (spotify) {
    return (
      <div className="w-full space-y-2">
        {title && <p className="text-sm font-semibold text-center opacity-80">{title}</p>}
        <iframe
          src={spotify.src}
          title={title || "Spotify embed"}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-xl"
          style={{ border: 0, height: `${spotify.height}px` }}
        />
      </div>
    );
  }

  // Generic iframe
  return (
    <div className="w-full space-y-2">
      {title && <p className="text-sm font-semibold text-center opacity-80">{title}</p>}
      <iframe
        src={embedUrl}
        title={title || "Embedded content"}
        loading="lazy"
        className="w-full rounded-xl"
        style={{ border: 0, height: "315px" }}
        sandbox="allow-scripts allow-popups"
      />
    </div>
  );
}
