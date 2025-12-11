'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

interface ContentFormData {
  title: string;
  description: string;
  content: string;
  type: 'video' | 'blog' | 'image';
  category: string;
  tags: string[];
  author: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  readTime?: number;
  isPublished: boolean;
  publishedAt?: Date;
}

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  className?: string;
}

export default function ContentForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  className
}: ContentFormProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    content: '',
    type: 'blog',
    category: '',
    tags: [],
    author: '',
    isPublished: false,
    ...initialData
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast, ToastComponent } = useToast();

  const categories = [
    'Rituals',
    'Scriptures', 
    'Meditation',
    'Culture',
    'Art',
    'Festivals',
    'Philosophy',
    'History',
    'Spirituality',
    'Devotion'
  ];

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is being edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (formData.type === 'video' && !formData.videoUrl) {
      newErrors.videoUrl = 'Video URL is required for video content';
    }

    if (formData.type === 'video' && !formData.duration) {
      newErrors.duration = 'Duration is required for video content';
    }

    if (formData.type === 'blog' && !formData.readTime) {
      newErrors.readTime = 'Read time is required for blog content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        publishedAt: formData.isPublished ? new Date() : undefined
      });
      showToast(
        isEditing ? 'Content updated successfully!' : 'Content created successfully!',
        'success'
      );
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Failed to save content. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={cn('space-y-6 bg-white rounded-2xl p-6 border-2 border-deep-brown/10', className)}>
        <div className="border-b border-deep-brown/10 pb-4">
          <h2 className="text-2xl font-bold text-deep-brown">
            {isEditing ? 'Edit Content' : 'Create New Content'}
          </h2>
          <p className="text-deep-brown/70 mt-1">
            Fill in the details below to {isEditing ? 'update' : 'create'} spiritual content.
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title..."
              error={errors.title}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-deep-brown mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the content..."
              rows={3}
              className={cn(
                'w-full px-4 py-3 bg-white border-2 border-deep-brown/20 rounded-lg',
                'text-deep-brown placeholder-deep-brown/50',
                'focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20',
                'transition-all duration-200',
                errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-brown mb-2">
              Content Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as ContentFormData['type'])}
              className="w-full px-4 py-3 bg-white border-2 border-deep-brown/20 rounded-lg focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            >
              <option value="blog">📝 Blog Article</option>
              <option value="video">🎥 Video</option>
              <option value="image">🖼️ Image Gallery</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-brown mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={cn(
                'w-full px-4 py-3 bg-white border-2 border-deep-brown/20 rounded-lg focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20',
                errors.category && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <Input
            label="Author"
            value={formData.author}
            onChange={(e) => handleInputChange('author', e.target.value)}
            placeholder="Content author name..."
            error={errors.author}
          />

          {/* Type-specific fields */}
          {formData.type === 'video' && (
            <>
              <Input
                label="Video URL"
                value={formData.videoUrl || ''}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="https://example.com/video.mp4"
                error={errors.videoUrl}
              />
              <Input
                label="Duration (seconds)"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                placeholder="e.g., 720 for 12 minutes"
                error={errors.duration}
              />
            </>
          )}

          {formData.type === 'blog' && (
            <Input
              label="Read Time (minutes)"
              type="number"
              value={formData.readTime || ''}
              onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 0)}
              placeholder="e.g., 5"
              error={errors.readTime}
            />
          )}

          <Input
            label="Cover Image URL (optional)"
            value={formData.imageUrl || ''}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-deep-brown mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2 bg-white border-2 border-deep-brown/20 rounded-lg focus:outline-none focus:border-saffron"
            />
            <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
              Add Tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-saffron/20 text-deep-brown rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-deep-brown mb-2">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Write your content here... You can use markdown for formatting."
            rows={12}
            className={cn(
              'w-full px-4 py-3 bg-white border-2 border-deep-brown/20 rounded-lg',
              'text-deep-brown placeholder-deep-brown/50 font-mono text-sm',
              'focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20',
              'transition-all duration-200',
              errors.content && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
          {errors.content && (
            <p className="mt-2 text-sm text-red-600">{errors.content}</p>
          )}
          <p className="mt-2 text-xs text-deep-brown/60">
            💡 Tip: You can use markdown formatting like **bold**, *italic*, and # headings
          </p>
        </div>

        {/* Publishing Options */}
        <div className="border-t border-deep-brown/10 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-saffron border-deep-brown/30 rounded focus:ring-saffron"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-deep-brown">
              Publish immediately
            </label>
          </div>
          
          {formData.isPublished && (
            <p className="text-sm text-deep-brown/60 mb-4">
              This content will be visible to all users immediately after saving.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="divine"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Content' : 'Create Content')
            }
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

      {ToastComponent}
    </>
  );
}