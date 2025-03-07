'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Mail,
  MessageSquare,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'archived';
}

export default function ContactFormPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error('Error fetching contact submissions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: number, status: 'new' | 'read' | 'archived') => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Submission marked as ${status}`);
      fetchSubmissions();
    } catch (error: any) {
      toast.error('Error updating submission: ' + error.message);
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Submission deleted successfully');
      fetchSubmissions();
      if (viewingSubmission?.id === id) {
        setShowSubmissionDialog(false);
      }
    } catch (error: any) {
      toast.error('Error deleting submission: ' + error.message);
    }
  };

  const handleViewSubmission = async (submission: ContactSubmission) => {
    setViewingSubmission(submission);
    setShowSubmissionDialog(true);
    
    // Mark as read if it's new
    if (submission.status === 'new') {
      await updateSubmissionStatus(submission.id, 'read');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'read':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Read</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Archived</Badge>;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'read', label: 'Read' },
    { id: 'archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Mail className="mr-2 h-6 w-6" />
          Contact Form Submissions
        </h1>
      </div>

      <div className="flex space-x-2 mb-4">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            className="px-4"
          >
            {tab.label}
            {tab.id === 'new' && submissions.filter(s => s.status === 'new').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {submissions.filter(s => s.status === 'new').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading submissions...
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} className={submission.status === 'new' ? 'bg-blue-50' : ''}>
                  <TableCell>
                    {getStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell className="font-medium">{submission.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                      {submission.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1">
                      {submission.subject || '(No subject)'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    <p className="text-xs text-gray-500">
                      {format(new Date(submission.created_at), 'h:mm a')}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewSubmission(submission)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateSubmissionStatus(submission.id, 'archived')}
                          title="Archive"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteSubmission(submission.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Submission Detail Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          
          {viewingSubmission && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{viewingSubmission.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>
                    <a href={`mailto:${viewingSubmission.email}`} className="text-blue-600 hover:underline">
                      {viewingSubmission.email}
                    </a>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                <p>{viewingSubmission.subject || '(No subject)'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {viewingSubmission.message}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p>{format(new Date(viewingSubmission.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p>{getStatusBadge(viewingSubmission.status)}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              <Button 
                variant="destructive" 
                onClick={() => viewingSubmission && deleteSubmission(viewingSubmission.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="space-x-2">
              {viewingSubmission && viewingSubmission.status !== 'archived' && (
                <Button 
                  variant="outline" 
                  onClick={() => viewingSubmission && updateSubmissionStatus(viewingSubmission.id, 'archived')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
              <Button onClick={() => setShowSubmissionDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}