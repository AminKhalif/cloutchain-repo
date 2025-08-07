import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface TikTokEmbedProps {
  url: string;
  className?: string;
}

interface TikTokOEmbedData {
  html: string;
  width: number;
  height: number;
  title: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url: string;
}

export function TikTokEmbed({ url, className = '' }: TikTokEmbedProps) {
  const [embedData, setEmbedData] = useState<TikTokOEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbedData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch embed data');
        }
        
        const data = await response.json();
        setEmbedData(data);
      } catch (err: any) {
        console.error('TikTok embed error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchEmbedData();
    }
  }, [url]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-300 rounded-xl mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !embedData) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-red-700 font-medium mb-2">Unable to load TikTok video</h3>
          <p className="text-red-600 text-sm mb-4">{error || 'Video may be private or unavailable'}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            View on TikTok <ExternalLink size={16} />
          </a>
        </div>
      </div>
    );
  }

  // Extract video ID for iframe embed
  const extractVideoId = (tiktokUrl: string) => {
    const match = tiktokUrl.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(url);

  return (
    <div className={`flex justify-center ${className}`}>
      {videoId ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}?lang=en-US`}
          width="325"
          height="580"
          frameBorder="0"
          scrolling="no"
          allow="encrypted-media"
          allowFullScreen
          className="rounded-lg shadow-lg"
        />
      ) : (
        <div className="w-80 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-4">
          <div 
            className="tiktok-embed-container"
            dangerouslySetInnerHTML={{ __html: embedData.html }}
          />
        </div>
      )}
    </div>
  );
}