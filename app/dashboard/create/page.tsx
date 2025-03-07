'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, FileText, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import { SeoSettings } from '@/components/post/SeoSettings';
import { PostSettings } from '@/components/post/PostSettings';
import { Editor } from '@/components/editor/Editor';

const MAX_EXCERPT_LENGTH = 160;

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMetaTitleManuallyEdited, setIsMetaTitleManuallyEdited] = useState(false);
  const router = useRouter();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-')         // Replace spaces with -
      .replace(/-+/g, '-')          // Replace multiple - with single -
      .replace(/^-+/, '')           // Trim - from start of text
      .replace(/-+$/, '');          // Trim - from end of text
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-generate slug if it hasn't been manually edited
    const newSlug = generateSlug(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(newSlug);
    }

    // Auto-generate meta title if it hasn't been manually edited
    if (!isMetaTitleManuallyEdited) {
      setMetaTitle(newTitle);
    }

    // Auto-generate excerpt if it's empty
    if (!excerpt) {
      setExcerpt(newTitle);
    }
  };

  const handleMetaTitleChange = (value: string) => {
    setMetaTitle(value);
    setIsMetaTitleManuallyEdited(true);
  };

  const validatePost = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return false;
    }

    if (!slug.trim()) {
      toast.error('URL slug is required');
      return false;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return false;
    }

    if (!metaTitle.trim()) {
      toast.error('Meta title is required');
      return false;
    }

    if (metaTitle.length > 60) {
      toast.error('Meta title must be less than 60 characters');
      return false;
    }

    if (metaDescription && metaDescription.length > 160) {
      toast.error('Meta description must be less than 160 characters');
      return false;
    }

    if (excerpt && excerpt.length > MAX_EXCERPT_LENGTH) {
      toast.error(`Excerpt must be less than ${MAX_EXCERPT_LENGTH} characters`);
      return false;
    }

    return true;
  };

  const handleCreatePost = async (e: React.SyntheticEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!validatePost()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const postData = {
        title,
        content,
        excerpt,
        author_id: user.id,
        slug,
        status: newStatus,
        tags,
        image_url: imageUrl,
        image_alt: imageAlt,
        category_id: categoryId,
        meta_title: metaTitle || title, // Use title as fallback
        meta_description: metaDescription || excerpt // Use excerpt as fallback
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      toast.success(`Post ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`);
      router.push('/dashboard/posts');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={(e) => {
              setStatus('draft');
              handleCreatePost(e, 'draft');
            }}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => {
              setStatus('published');
              handleCreatePost(e, 'published');
            }}
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleCreatePost(e, status)} className="h-[calc(100%-4rem)]">
        <div className="grid grid-cols-3 gap-6 h-full">
          <div className="col-span-2 space-y-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Title & Excerpt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post Title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  disabled={isSubmitting}
                  className="text-xl font-semibold"
                />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Excerpt</label>
                    <span className={`text-xs ${excerpt.length > MAX_EXCERPT_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                      {excerpt.length}/{MAX_EXCERPT_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Brief description of your post"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    maxLength={MAX_EXCERPT_LENGTH}
                    className="h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="h-[calc(100%-6rem)]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Editor
                  content={content}
                  onChange={setContent}
                  editable={!isSubmitting}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SeoSettings
              slug={slug}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              isSubmitting={isSubmitting}
              onSlugChange={setSlug}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={setMetaDescription}
            />
            <PostSettings
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              tags={tags}
              categoryId={categoryId}
              isSubmitting={isSubmitting}
              onImageUrlChange={setImageUrl}
              onImageAltChange={setImageAlt}
              onTagsChange={setTags}
              onCategoryChange={setCategoryId}
            />
          </div>
        </div>
      </form>
    </div>
  );
}