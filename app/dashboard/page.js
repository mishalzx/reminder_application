'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Bell, Calendar, Clock, Mail, Plus, Trash2, LogOut, Edit, TrendingUp } from 'lucide-react';
import { formatDateDisplay } from '@/lib/dateFormatter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PURPLE = '#6757b6';

export default function DashboardPage() {
  const [reminders, setReminders] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/');
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchReminders();
  }, [router]);

  const fetchReminders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reminders');
      const data = await response.json();
      setReminders(data.reminders || []);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete reminder');
      toast({ title: 'Success', description: 'Reminder deleted successfully' });
      fetchReminders();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Date formatting is now imported from utility

  const stats = {
    total: reminders.length,
    active: reminders.filter(r => r.status === 'active').length,
    sent: reminders.filter(r => r.status === 'sent').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PURPLE }}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: PURPLE }}>
                <Bell className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: PURPLE }}>Reminder Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="text-white rounded-lg px-6 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: PURPLE }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderColor: PURPLE }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Reminders</p>
                <h3 className="text-3xl font-bold" style={{ color: PURPLE }}>{stats.total}</h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: PURPLE + '20' }}>
                <Bell className="h-6 w-6" style={{ color: PURPLE }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Active</p>
                <h3 className="text-3xl font-bold text-orange-600">{stats.active}</h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Sent</p>
                <h3 className="text-3xl font-bold text-green-600">{stats.sent}</h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/create-reminder')}
            className="text-white rounded-lg px-6 py-6 text-base hover:opacity-90 transition-opacity shadow-lg"
            style={{ backgroundColor: PURPLE }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Reminder
          </Button>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: PURPLE + '20' }}>
              <Bell className="h-10 w-10" style={{ color: PURPLE }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-600 mb-6">Create your first reminder to get started</p>
            <Button
              onClick={() => router.push('/create-reminder')}
              className="text-white rounded-lg px-6 hover:opacity-90"
              style={{ backgroundColor: PURPLE }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{reminder.name}</h3>
                      {(reminder.frequencies || [reminder.frequency]).map((freq, idx) => (
                        <Badge key={idx} className="rounded-full text-xs px-3" style={{ backgroundColor: PURPLE, color: 'white' }}>
                          {freq}
                        </Badge>
                      ))}
                      {reminder.status === 'active' ? (
                        <Badge className="rounded-full text-xs px-3 bg-green-500 text-white">Active</Badge>
                      ) : (
                        <Badge className="rounded-full text-xs px-3 bg-gray-500 text-white">Sent</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{reminder.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" style={{ color: PURPLE }} />
                        <div>
                          <p className="text-gray-500 text-xs">Event Date</p>
                          <p className="font-medium">{formatDateDisplay(reminder.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2" style={{ color: PURPLE }} />
                        <div>
                          <p className="text-gray-500 text-xs">Reminder</p>
                          <p className="font-medium">{formatDateDisplay(reminder.reminderDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2" style={{ color: PURPLE }} />
                        <div>
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="font-medium">{reminder.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/edit-reminder/${reminder.id}`)}
                      className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="h-5 w-5" style={{ color: PURPLE }} />
                    </button>
                    <button
                      onClick={() => setDeleteId(reminder.id)}
                      className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reminder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}