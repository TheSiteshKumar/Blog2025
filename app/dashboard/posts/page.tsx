'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  status: string;
  created_at: string;
  slug: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error('Error fetching posts');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(posts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: number, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId]);
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    }
  };

  const handlePublishSelected = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .in('id', selectedPosts);

      if (error) throw error;

      toast.success('Selected posts published successfully');
      fetchPosts();
      setSelectedPosts([]);
    } catch (error: any) {
      toast.error('Error publishing posts');
      console.error('Error:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm('Are you sure you want to delete the selected posts?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', selectedPosts);

      if (error) throw error;

      toast.success('Selected posts deleted successfully');
      fetchPosts();
      setSelectedPosts([]);
    } catch (error: any) {
      toast.error('Error deleting posts');
      console.error('Error:', error);
    }
  };

  const handleEditPost = (postId: number) => {
    router.push(`/dashboard/posts/edit/${postId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Posts</h1>
        <Button onClick={() => router.push('/dashboard/create')}>Add New Post</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {selectedPosts.length > 0 && (
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-600">
              {selectedPosts.length} posts selected
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublishSelected}
              >
                Publish Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPosts.length === posts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={(checked) => handleSelectPost(post.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(post.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setSelectedPosts([post.id]);
                        handleDeleteSelected();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}