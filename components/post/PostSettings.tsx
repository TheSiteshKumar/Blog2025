'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PostSettingsProps {
  imageUrl: string;
  imageAlt: string;
  tags: string[];
  categoryId: number | null;
  isSubmitting: boolean;
  onImageUrlChange: (url: string) => void;
  onImageAltChange: (alt: string) => void;
  onTagsChange: (tags: string[]) => void;
  onCategoryChange: (categoryId: number | null) => void;
}

const MAX_TAGS = 5;
const MIN_IMAGE_WIDTH = 1200;
const MIN_IMAGE_HEIGHT = 630;

export function PostSettings({
  imageUrl,
  imageAlt,
  tags = [], // Provide default empty array
  categoryId,
  isSubmitting,
  onImageUrlChange,
  onImageAltChange,
  onTagsChange,
  onCategoryChange,
}: PostSettingsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error loading categories');
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth < MIN_IMAGE_WIDTH || img.naturalHeight < MIN_IMAGE_HEIGHT) {
      setImageError(`Image dimensions too small. Minimum size: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`);
    } else {
      setImageError(null);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= MAX_TAGS) {
        toast.error(`Maximum ${MAX_TAGS} tags allowed`);
        return;
      }
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCategoryClick = (id: number) => {
    // If the category is already selected, deselect it
    if (categoryId === id) {
      onCategoryChange(null);
    } else {
      onCategoryChange(id);
    }
  };

  const handleNewCategory = async () => {
    const categoryName = newCategory.trim();
    if (!categoryName) return;

    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName, slug }])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        toast.error('Error creating category');
        return;
      }

      toast.success('Category created successfully');
      setCategories([...categories, data]);
      onCategoryChange(data.id);
      setShowCategoryDialog(false);
      setNewCategory('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error creating category');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Post Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Featured Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Featured Image</label>
          <Input
            type="url"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            placeholder="Image Alt Text"
            value={imageAlt}
            onChange={(e) => onImageAltChange(e.target.value)}
            disabled={isSubmitting}
          />
          {imageUrl && (
            <div className="mt-2 rounded-md overflow-hidden">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-32 object-cover"
                onError={() => setImageError('Invalid image URL')}
                onLoad={handleImageLoad}
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <div className="flex gap-2 flex-wrap">
            {isLoadingCategories ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={categoryId === category.id ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors hover:text-white hover:bg-primary/90"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                  {categoryId === category.id && (
                    <X className="w-3 h-3 ml-1 inline-block" />
                  )}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-gray-500">No categories found</div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryDialog(true)}
              disabled={isSubmitting}
            >
              + Add Category
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Tags</label>
            <span className="text-sm text-gray-500">{tags.length}/{MAX_TAGS}</span>
          </div>
          <Input
            placeholder="Add tags (press Enter or comma to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            disabled={isSubmitting || tags.length >= MAX_TAGS}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {/* New Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNewCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}