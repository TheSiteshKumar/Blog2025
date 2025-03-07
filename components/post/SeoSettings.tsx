'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface SeoSettingsProps {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  isSubmitting: boolean;
  onSlugChange: (value: string) => void;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
}

const MAX_META_TITLE_LENGTH = 60;
const MAX_META_DESCRIPTION_LENGTH = 160;
const SLUG_REGEX = /^[a-z0-9-]+$/;

export function SeoSettings({
  slug,
  metaTitle,
  metaDescription,
  isSubmitting,
  onSlugChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: SeoSettingsProps) {
  const [seoWarnings, setSeoWarnings] = useState<string[]>([]);

  // Sanitize and validate slug input
  const handleSlugChange = (rawSlug: string) => {
    const formattedSlug = rawSlug
      .toLowerCase()
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-+/g, '-')       // Replace multiple hyphens with single
      .replace(/^-+/, '')         // Remove leading hyphens
      .replace(/-+$/, '');        // Remove trailing hyphens

    onSlugChange(formattedSlug);
  };

  useEffect(() => {
    const warnings: string[] = [];
    
    // Slug validation
    if (!slug) {
      warnings.push('URL slug is required');
    } else if (!SLUG_REGEX.test(slug)) {
      warnings.push('Invalid URL slug format - only lowercase letters, numbers, and hyphens allowed');
    } else if (slug.length > 60) {
      warnings.push('URL slug is too long (max 60 characters)');
    }

    // Meta title validation
    if (metaTitle.length === 0) {
      warnings.push('Meta title is missing');
    } else if (metaTitle.length < 30) {
      warnings.push('Meta title is too short (min 30 characters)');
    } else if (metaTitle.length > MAX_META_TITLE_LENGTH) {
      warnings.push('Meta title is too long (max 60 characters)');
    }

    // Meta description validation
    if (metaDescription.length === 0) {
      warnings.push('Meta description is missing');
    } else if (metaDescription.length < 120) {
      warnings.push('Meta description is too short (min 120 characters)');
    } else if (metaDescription.length > MAX_META_DESCRIPTION_LENGTH) {
      warnings.push('Meta description is too long (max 160 characters)');
    }

    setSeoWarnings(warnings);
  }, [metaTitle, metaDescription, slug]); // Added slug to dependencies

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link2 className="w-5 h-5 mr-2" />
          SEO Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Slug Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL Slug</label>
          <Input
            placeholder="url-slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            disabled={isSubmitting}
            className={slug && !SLUG_REGEX.test(slug) ? 'border-red-500' : ''}
          />
          {slug && !SLUG_REGEX.test(slug) && (
            <p className="text-red-500 text-xs mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          )}
        </div>

        {/* Meta Title Input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Meta Title</label>
            <span className={`text-xs ${metaTitle.length > MAX_META_TITLE_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
              {metaTitle.length}/{MAX_META_TITLE_LENGTH}
            </span>
          </div>
          <Input
            placeholder="Meta Title (min 30, max 60 characters)"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Meta Description Input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Meta Description</label>
            <span className={`text-xs ${metaDescription.length > MAX_META_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
              {metaDescription.length}/{MAX_META_DESCRIPTION_LENGTH}
            </span>
          </div>
          <Textarea
            placeholder="Meta Description (min 120, max 160 characters)"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            disabled={isSubmitting}
            className="h-24"
          />
        </div>

        {/* SEO Preview */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium">Search Preview</h3>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-blue-600 text-xl mb-1 truncate">
              {metaTitle || 'Your Page Title'}
            </div>
            <div className="text-green-700 text-sm mb-1">
              example.com/{slug || 'page-url'}
            </div>
            <div className="text-gray-600 text-sm line-clamp-2">
              {metaDescription || 'Your page description will appear here. Make it compelling for better click-through rates.'}
            </div>
          </div>
        </div>

        {/* SEO Warnings */}
        {seoWarnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {seoWarnings.map((warning, index) => (
              <Alert key={index} variant="destructive">
                {warning}
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}