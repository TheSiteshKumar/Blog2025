'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  CornerDownRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Comment {
  id: string;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  parent_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  post_title?: string;
  post_slug?: string;
  parent_comment?: {
    id: string;
    author_name: string;
    content: string;
  } | null;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [viewingComment, setViewingComment] = useState<Comment | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  useEffect(() => {
    fetchComments(activeTab);
    fetchPendingCount();
  }, [activeTab]);

  const fetchComments = async (status: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch post information separately for each comment
      const commentsWithInfo = await Promise.all((data || []).map(async (comment) => {
        try {
          // Fetch post info
          const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('title, slug')
            .eq('id', comment.post_id)
            .single();
          
          let parentComment = null;
          
          // If this is a reply, fetch the parent comment
          if (comment.parent_id) {
            const { data: parentData, error: parentError } = await supabase
              .from('comments')
              .select('id, author_name, content')
              .eq('id', comment.parent_id)
              .single();
              
            if (!parentError && parentData) {
              parentComment = parentData;
            }
          }
          
          if (postError || !postData) {
            return {
              ...comment,
              post_title: 'Unknown Post',
              post_slug: '',
              parent_comment: parentComment
            };
          }
          
          return {
            ...comment,
            post_title: postData.title,
            post_slug: postData.slug,
            parent_comment: parentComment
          };
        } catch (err) {
          console.error('Error fetching post for comment:', err);
          return {
            ...comment,
            post_title: 'Unknown Post',
            post_slug: '',
            parent_comment: null
          };
        }
      }));
      
      setComments(commentsWithInfo);
    } catch (error: any) {
      toast.error('Error fetching comments: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      // Direct query approach - more reliable than RPC
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const updateCommentStatus = async (commentId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'spam') => {
    try {
      // Direct update approach - more reliable than RPC
      const { error } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .eq('id', commentId);
      
      if (error) {
        console.error('Error updating comment status:', error);
        throw error;
      }
      
      toast.success(`Comment ${newStatus} successfully`);
      fetchComments(activeTab);
      fetchPendingCount();
    } catch (error: any) {
      toast.error('Error updating comment: ' + error.message);
    }
  };

  const handleApprove = (commentId: string) => {
    updateCommentStatus(commentId, 'approved');
  };

  const handleReject = (commentId: string) => {
    updateCommentStatus(commentId, 'rejected');
  };

  const handleMarkAsSpam = (commentId: string) => {
    updateCommentStatus(commentId, 'spam');
  };

  const handleViewParentComment = (comment: Comment) => {
    setViewingComment(comment);
    setShowCommentDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      case 'spam':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Spam</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <MessageSquare className="mr-2 h-6 w-6" />
          Comment Moderation
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingCount} pending
            </Badge>
          )}
        </h1>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="spam">Spam</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading comments...
                    </TableCell>
                  </TableRow>
                ) : comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No {activeTab} comments found
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{comment.author_name}</p>
                          <p className="text-sm text-gray-500">{comment.author_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="line-clamp-2 text-sm">{comment.content}</p>
                          {comment.parent_id && (
                            <div className="mt-1 flex items-center">
                              <Badge variant="outline" className="mr-2">Reply</Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs text-blue-600"
                                onClick={() => handleViewParentComment(comment)}
                              >
                                <CornerDownRight className="h-3 w-3 mr-1" />
                                View parent comment
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {comment.post_slug ? (
                          <Link href={`/${comment.post_slug}`} className="flex items-center text-blue-600 hover:text-blue-800">
                            <span className="line-clamp-1 mr-1">{comment.post_title}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-gray-500">Post not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.created_at), 'h:mm a')}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {activeTab === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(comment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(comment.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() => handleMarkAsSpam(comment.id)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Spam
                              </Button>
                            </>
                          )}
                          {activeTab === 'approved' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(comment.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() => handleMarkAsSpam(comment.id)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Spam
                              </Button>
                            </>
                          )}
                          {activeTab === 'rejected' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(comment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() => handleMarkAsSpam(comment.id)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Spam
                              </Button>
                            </>
                          )}
                          {activeTab === 'spam' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(comment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Not Spam
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(comment.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Parent Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Parent Comment</DialogTitle>
          </DialogHeader>
          
          {viewingComment?.parent_comment ? (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{viewingComment.parent_comment.author_name}</p>
                </div>
                <p className="text-gray-700">{viewingComment.parent_comment.content}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Reply:</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{viewingComment.author_name}</p>
                    <Badge>{viewingComment.status}</Badge>
                  </div>
                  <p className="text-gray-700">{viewingComment.content}</p>
                </div>
              </div>
              
              {viewingComment.post_slug && (
                <div className="mt-4">
                  <Link 
                    href={`/${viewingComment.post_slug}`} 
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    target="_blank"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View in post: {viewingComment.post_title}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Parent comment not found or has been deleted.
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowCommentDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}