'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Bell, Calendar, Mail } from 'lucide-react';

export default function EditReminderPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    email: '',
    reminderDate: '',
    reminderTime: '',
    frequency: 'once'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchReminder();
  }, [params.id]);

  const fetchReminder = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      const reminder = data.reminders.find(r => r.id === params.id);

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Split date and time for separate inputs
      // Extract UTC components to show the exact stored values
      const formatDateTimeForInputs = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        
        // Create Date object from the string (MongoDB returns ISO string in UTC)
        const date = new Date(dateString);
        
        // Check if valid date
        if (isNaN(date.getTime())) return { date: '', time: '' };
        
        // Extract UTC components (not local) to preserve the exact stored values
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        
        return {
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}`
        };
      };

      const eventDateTime = formatDateTimeForInputs(reminder.date);
      const reminderDateTime = formatDateTimeForInputs(reminder.reminderDate);

      setFormData({
        name: reminder.name || '',
        description: reminder.description || '',
        date: eventDateTime.date,
        time: eventDateTime.time,
        email: reminder.email || '',
        reminderDate: reminderDateTime.date,
        reminderTime: reminderDateTime.time,
        frequency: reminder.frequency || 'once'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      // Combine date and time into datetime strings
      const dateTime = `${formData.date}T${formData.time}`;
      const reminderDateTime = `${formData.reminderDate}T${formData.reminderTime}`;
      
      const payload = {
        name: formData.name,
        description: formData.description,
        date: dateTime,
        email: formData.email,
        reminderDate: reminderDateTime,
        frequency: formData.frequency
      };

      const response = await fetch(`/api/reminders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update reminder');
      }

      toast({
        title: 'Success!',
        description: 'Reminder updated successfully',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reminder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-black hover:text-white border-2 border-black rounded-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-12 w-12 bg-black flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black uppercase tracking-wide">Edit Reminder</h1>
              <p className="text-sm text-gray-600 font-light">Update your reminder details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-2 border-black">
          <div className="border-b-2 border-black px-8 py-6">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-black">Reminder Details</h2>
            <p className="text-sm text-gray-600 mt-1 font-light">Update the information below</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-black font-bold uppercase text-xs tracking-wider">
                  Reminder Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Team Meeting, Doctor Appointment"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="h-12 border-2 border-black rounded-none focus:ring-black"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-black font-bold uppercase text-xs tracking-wider">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about this reminder..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  rows={4}
                  className="resize-none border-2 border-black rounded-none focus:ring-black"
                />
              </div>

              {/* Event Date and Time */}
              <div className="space-y-3">
                <Label className="text-black font-bold uppercase text-xs tracking-wider flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Event Date & Time *
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                  />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                  />
                </div>
              </div>

              {/* Reminder Date and Time */}
              <div className="space-y-3">
                <Label className="text-black font-bold uppercase text-xs tracking-wider flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Reminder Date & Time *
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => handleChange('reminderDate', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                  />
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => handleChange('reminderTime', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-black font-bold uppercase text-xs tracking-wider flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="h-12 border-2 border-black rounded-none focus:ring-black"
                />
                <p className="text-xs text-gray-500 font-light">
                  The reminder will be sent to this email address
                </p>
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <Label htmlFor="frequency" className="text-black font-bold uppercase text-xs tracking-wider">
                  Reminder Frequency *
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleChange('frequency', value)}
                >
                  <SelectTrigger className="h-12 border-2 border-black rounded-none focus:ring-black">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none">
                    <SelectItem value="once">Once (One-time reminder)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 font-light">
                  Choose how often you want to receive this reminder
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 border-2 border-black rounded-none font-bold uppercase text-xs tracking-wider"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-black hover:bg-gray-900 text-white rounded-none font-bold uppercase tracking-wider"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Reminder'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
