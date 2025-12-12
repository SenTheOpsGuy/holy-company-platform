'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CONTENT_TYPES } from '@/lib/constants';

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  type: keyof typeof CONTENT_TYPES;
  imageUrl?: string;
  duration?: number;
  readTime?: number;
  author: string;
  publishedAt: Date;
  viewCount?: number;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  className?: string;
}

export default function ContentCard({
  id,
  title,
  description,
  type,
  imageUrl,
  duration,
  readTime,
  author,
  publishedAt,
  viewCount = 0,
  isBookmarked = false,
  onBookmark,
  className
}: ContentCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'VIDEO':
        return '🎥';
      case 'BLOG':
        return '📝';
      case 'IMAGE':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'VIDEO':
        return 'text-red-600 bg-red-100';
      case 'BLOG':
        return 'text-blue-600 bg-blue-100';
      case 'IMAGE':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(id);
  };

  return (
    <Link href={`/content/${id}`}>
      <article className={cn(
        'bg-white rounded-2xl border-2 border-deep-brown/10 overflow-hidden',
        'transition-all duration-300 hover:border-saffron hover:scale-105 hover:shadow-lg',
        'cursor-pointer group',
        className
      )}>
        {/* Image/Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-saffron/20 to-gold/20 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-deep-brown/30">
              {getTypeIcon()}
            </div>
          )}
          
          {/* Type badge */}
          <div className={cn(
            'absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
            getTypeColor()
          )}>
            <span>{getTypeIcon()}</span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>

          {/* Duration/Read time */}
          {(duration || readTime) && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {type === 'VIDEO' && duration 
                ? formatDuration(duration)
                : `${readTime} min read`
              }
            </div>
          )}

          {/* Bookmark button */}
          <button
            onClick={handleBookmarkClick}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:scale-110',
              isBookmarked 
                ? 'bg-saffron text-deep-brown' 
                : 'bg-black/20 text-white hover:bg-black/40'
            )}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-playfair text-lg font-bold text-deep-brown mb-2 line-clamp-2 group-hover:text-saffron transition-colors duration-200">
            {title}
          </h3>

          {/* Description */}
          <p className="text-deep-brown/70 text-sm line-clamp-3 mb-4">
            {description}
          </p>

          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-deep-brown/50">
            <div className="flex items-center gap-3">
              <span>By {author}</span>
              <span>•</span>
              <span>{publishedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}