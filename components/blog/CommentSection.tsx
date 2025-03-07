'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Reply, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  replies: {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
  }[];
}

interface CommentSectionProps {
  postId: number;
  postTitle: string;
}

export default function CommentSection({ postId, postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // Direct query approach - more reliable than RPC
      const { data: approvedComments, error: queryError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error fetching comments:', queryError);
        setIsLoading(false);
        return;
      }

      // Format comments to match the expected structure
      const formattedComments = await Promise.all((approvedComments || []).map(async (comment) => {
        // Get replies for this comment
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select('id, author_name, content, created_at')
          .eq('post_id', postId)
          .eq('parent_id', comment.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: true });

        if (repliesError) {
          console.error('Error fetching replies:', repliesError);
          return {
            ...comment,
            replies: []
          };
        }

        return {
          ...comment,
          replies: replies || []
        };
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author_name: name,
            author_email: email,
            content,
            parent_id: null,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('Comment submitted for moderation');
      setContent('');
      // Don't clear name and email for convenience
    } catch (error: any) {
      toast.error('Error submitting comment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !replyContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author_name: name,
            author_email: email,
            content: replyContent,
            parent_id: parentId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('Reply submitted for moderation');
      setReplyContent('');
      setReplyingTo(null);
      // Don't clear name and email for convenience
    } catch (error: any) {
      toast.error('Error submitting reply: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=128`;
  };

  return (
    <div className="mt-12">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-5 w-5 mr-2" />
        <h2 className="text-2xl font-bold">Comments</h2>
      </div>

      {/* Comment Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Leave a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (not published)"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your comment"
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 border-t pt-4">
          Comments are moderated and will appear after approval.
        </CardFooter>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-white">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(comment.author_name)} alt={comment.author_name} />
                    <AvatarFallback>{getInitials(comment.author_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{comment.author_name}</h4>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-gray-500"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-lg">
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`reply-name-${comment.id}`}>Name</Label>
                          <Input
                            id={`reply-name-${comment.id}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reply-email-${comment.id}`}>Email</Label>
                          <Input
                            id={`reply-email-${comment.id}`}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email (not published)"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`reply-content-${comment.id}`}>Reply</Label>
                        <Textarea
                          id={`reply-content-${comment.id}`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Your reply"
                          rows={3}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                          {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-14 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(reply.author_name)} alt={reply.author_name} />
                            <AvatarFallback>{getInitials(reply.author_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h5 className="font-medium text-sm">{reply.author_name}</h5>
                              <span className="text-xs text-gray-500 ml-2">
                                {format(new Date(reply.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}