'use client';

import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'spiritual' | 'error' | 'success';
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
  variant = 'default'
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'text-4xl',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12',
      icon: 'text-6xl',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'text-8xl',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const variants = {
    default: {
      iconColor: 'text-deep-brown/30',
      titleColor: 'text-deep-brown',
      descriptionColor: 'text-deep-brown/60'
    },
    spiritual: {
      iconColor: 'text-saffron/60',
      titleColor: 'text-deep-brown',
      descriptionColor: 'text-deep-brown/70'
    },
    error: {
      iconColor: 'text-red-400',
      titleColor: 'text-red-700',
      descriptionColor: 'text-red-600'
    },
    success: {
      iconColor: 'text-green-400',
      titleColor: 'text-green-700',
      descriptionColor: 'text-green-600'
    }
  };

  const defaultIcons = {
    default: '📄',
    spiritual: '🕉️',
    error: '⚠️',
    success: '✅'
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      currentSize.container,
      currentSize.spacing,
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'mb-2 transition-transform hover:scale-110',
        currentSize.icon,
        currentVariant.iconColor
      )}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-bold font-playfair',
        currentSize.title,
        currentVariant.titleColor
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        'max-w-md mx-auto leading-relaxed',
        currentSize.description,
        currentVariant.descriptionColor
      )}>
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant={variant === 'spiritual' ? 'divine' : 'default'}
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {actionLabel}
            </Button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="ghost"
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export const EmptyStates = {
  noPujas: () => (
    <EmptyState
      icon="🙏"
      title="No Pujas Yet"
      description="Start your spiritual journey by performing your first puja. Choose a deity and begin your divine connection."
      actionLabel="Start First Puja"
      variant="spiritual"
    />
  ),
  
  noGames: () => (
    <EmptyState
      icon="🎮"
      title="Games Locked"
      description="Complete a puja to unlock spiritual games and earn more punya points through divine play."
      actionLabel="Perform Puja"
      variant="spiritual"
    />
  ),
  
  noContent: () => (
    <EmptyState
      icon="📚"
      title="No Content Available"
      description="We're working on bringing you inspiring spiritual content. Check back soon for articles, videos, and sacred teachings."
      actionLabel="Refresh"
    />
  ),
  
  noSearchResults: (query: string) => (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={`We couldn't find any content matching "${query}". Try different keywords or browse our categories.`}
      actionLabel="Clear Search"
    />
  ),
  
  noBookmarks: () => (
    <EmptyState
      icon="🔖"
      title="No Bookmarks Yet"
      description="Save your favorite spiritual content by clicking the bookmark icon. Your saved items will appear here."
      actionLabel="Browse Content"
    />
  ),
  
  connectionError: () => (
    <EmptyState
      icon="📡"
      title="Connection Error"
      description="We're having trouble connecting to our servers. Please check your internet connection and try again."
      actionLabel="Retry"
      secondaryActionLabel="Go Back"
      variant="error"
    />
  ),
  
  maintenanceMode: () => (
    <EmptyState
      icon="🔧"
      title="Under Maintenance"
      description="We're making improvements to enhance your spiritual experience. We'll be back shortly with exciting new features."
      size="lg"
    />
  ),
  
  comingSoon: (feature: string) => (
    <EmptyState
      icon="🚀"
      title="Coming Soon"
      description={`${feature} is being crafted with love and devotion. We'll notify you when it's ready for your spiritual journey.`}
      actionLabel="Notify Me"
      variant="spiritual"
    />
  ),
  
  completedPuja: () => (
    <EmptyState
      icon="✨"
      title="Puja Completed!"
      description="Your prayers have been offered with devotion. May the divine blessings flow into your life."
      actionLabel="View Blessing Card"
      secondaryActionLabel="Perform Another Puja"
      variant="success"
      size="lg"
    />
  ),
  
  profileIncomplete: () => (
    <EmptyState
      icon="👤"
      title="Complete Your Profile"
      description="Help us personalize your spiritual experience by completing your profile information."
      actionLabel="Complete Profile"
      variant="spiritual"
    />
  ),
  
  noNotifications: () => (
    <EmptyState
      icon="🔔"
      title="All Caught Up!"
      description="You have no new notifications. We'll let you know when there's something important for your spiritual journey."
      variant="success"
      size="sm"
    />
  ),

  adminNoUsers: () => (
    <EmptyState
      icon="👥"
      title="No Users Found"
      description="No users match your current filters. Try adjusting your search criteria or clearing filters."
      actionLabel="Clear Filters"
    />
  ),

  adminNoContent: () => (
    <EmptyState
      icon="📝"
      title="No Content Created"
      description="Start building your spiritual content library. Create articles, videos, and inspiring materials for your community."
      actionLabel="Create Content"
      variant="spiritual"
    />
  )
};