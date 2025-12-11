'use client';

import { useState, useEffect } from 'react';
import ContentCard from './ContentCard';
import SearchBar from './SearchBar';
import FilterChips from './FilterChips';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'blog' | 'image';
  imageUrl?: string;
  duration?: number;
  readTime?: number;
  author: string;
  publishedAt: Date;
  viewCount: number;
  tags: string[];
  category: string;
}

interface ContentFeedProps {
  className?: string;
}

export default function ContentFeed({ className }: ContentFeedProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const { showToast, ToastComponent } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: '1',
        title: 'The Sacred Significance of Ganga Aarti',
        description: 'Discover the spiritual meaning behind the evening prayers at the holy Ganges river and its transformative power.',
        type: 'video',
        duration: 720, // 12 minutes
        author: 'Pandit Rajesh Sharma',
        publishedAt: new Date('2024-01-15'),
        viewCount: 12450,
        tags: ['ganga', 'aarti', 'prayers'],
        category: 'rituals',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3c6c8d1b1f95?w=400'
      },
      {
        id: '2',
        title: 'Understanding the Bhagavad Gita: Chapter 1',
        description: 'An in-depth exploration of the first chapter of the Bhagavad Gita, setting the stage for Arjuna\'s spiritual journey.',
        type: 'blog',
        readTime: 8,
        author: 'Dr. Priya Vishwanath',
        publishedAt: new Date('2024-01-18'),
        viewCount: 8900,
        tags: ['bhagavad-gita', 'philosophy', 'krishna'],
        category: 'scriptures'
      },
      {
        id: '3',
        title: 'Sacred Yantra Designs and Their Meanings',
        description: 'Beautiful collection of traditional yantra designs used in Hindu worship and meditation practices.',
        type: 'image',
        author: 'Artistic Heritage Studio',
        publishedAt: new Date('2024-01-20'),
        viewCount: 5670,
        tags: ['yantra', 'sacred-geometry', 'meditation'],
        category: 'art',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
      },
      {
        id: '4',
        title: 'Morning Mantras for Daily Practice',
        description: 'Start your day with these powerful Sanskrit mantras that bring peace, prosperity, and spiritual awakening.',
        type: 'video',
        duration: 480, // 8 minutes
        author: 'Swami Anandananda',
        publishedAt: new Date('2024-01-22'),
        viewCount: 15670,
        tags: ['mantras', 'morning', 'daily-practice'],
        category: 'meditation'
      },
      {
        id: '5',
        title: 'The Art of Temple Architecture',
        description: 'Explore the intricate details and spiritual symbolism behind ancient Indian temple design and construction.',
        type: 'blog',
        readTime: 12,
        author: 'Prof. Kamala Devi',
        publishedAt: new Date('2024-01-25'),
        viewCount: 7890,
        tags: ['temples', 'architecture', 'culture'],
        category: 'culture'
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setContent(mockContent);
      setFilteredContent(mockContent);
      setLoading(false);
    }, 1000);

    // Load bookmarks from localStorage
    const saved = localStorage.getItem('bookmarked-content');
    if (saved) {
      setBookmarkedIds(new Set(JSON.parse(saved)));
    }
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...content];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category/type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(item =>
        selectedFilters.includes(item.type) ||
        selectedFilters.includes(item.category) ||
        item.tags.some(tag => selectedFilters.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.viewCount - a.viewCount;
        case 'trending':
          // Simple trending algorithm based on recent views
          const aScore = a.viewCount * (Date.now() - a.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
          const bScore = b.viewCount * (Date.now() - b.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
          return bScore - aScore;
        case 'latest':
        default:
          return b.publishedAt.getTime() - a.publishedAt.getTime();
      }
    });

    setFilteredContent(filtered);
  }, [content, searchQuery, selectedFilters, sortBy]);

  const handleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarkedIds);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      showToast('Removed from bookmarks', 'info');
    } else {
      newBookmarks.add(id);
      showToast('Added to bookmarks', 'success');
    }
    
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('bookmarked-content', JSON.stringify([...newBookmarks]));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const filterOptions = [
    { id: 'video', label: '🎥 Videos' },
    { id: 'blog', label: '📝 Articles' },
    { id: 'image', label: '🖼️ Images' },
    { id: 'rituals', label: '🪔 Rituals' },
    { id: 'scriptures', label: '📜 Scriptures' },
    { id: 'meditation', label: '🧘 Meditation' },
    { id: 'culture', label: '🏛️ Culture' },
    { id: 'art', label: '🎨 Art' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron mx-auto mb-4"></div>
          <p className="text-deep-brown/60">Loading spiritual content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for spiritual content..."
        />
        
        <FilterChips
          options={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-deep-brown">Sort by:</span>
          <div className="flex gap-2">
            {[
              { id: 'latest', label: 'Latest' },
              { id: 'popular', label: 'Popular' },
              { id: 'trending', label: 'Trending' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
                  sortBy === option.id
                    ? 'bg-saffron text-deep-brown'
                    : 'bg-deep-brown/10 text-deep-brown/70 hover:bg-deep-brown/20'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-deep-brown/60">
        {filteredContent.length === content.length 
          ? `${content.length} articles available`
          : `${filteredContent.length} of ${content.length} articles found`
        }
      </div>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map(item => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              type={item.type}
              imageUrl={item.imageUrl}
              duration={item.duration}
              readTime={item.readTime}
              author={item.author}
              publishedAt={item.publishedAt}
              viewCount={item.viewCount}
              isBookmarked={bookmarkedIds.has(item.id)}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-deep-brown mb-2">No content found</h3>
          <p className="text-deep-brown/60 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilters([]);
            }}
            className="text-saffron hover:text-saffron/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}