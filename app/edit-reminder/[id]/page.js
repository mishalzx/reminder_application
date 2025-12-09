'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Bell, Calendar, Mail } from 'lucide-react';

const PURPLE = '#6757b6';

export default function EditReminderPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    email: '',
    reminderDate: '',
    reminderTime: '',
    frequencies: []
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reminders');
      const data = await response.json();
      const reminder = data.reminders.find(r => r.id === params.id);
      if (!reminder) throw new Error('Reminder not found');

      const formatDateTimeForInputs = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { date: '', time: '' };
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
        frequencies: reminder.frequencies || [reminder.frequency] || []
      });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      if (formData.frequencies.length === 0) {
        toast({ title: 'Error', description: 'Please select at least one reminder frequency', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const dateTime = `${formData.date}T${formData.time}`;
      const reminderDateTime = `${formData.reminderDate}T${formData.reminderTime}`;
      
      const payload = {
        name: formData.name,
        description: formData.description,
        date: dateTime,
        email: formData.email,
        reminderDate: reminderDateTime,
        frequencies: formData.frequencies
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
      if (!response.ok) throw new Error(data.error || 'Failed to update reminder');

      toast({ title: 'Success!', description: 'Reminder updated successfully' });
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PURPLE }}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-light">Loading reminder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: PURPLE }} />
            </button>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: PURPLE }}>
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: PURPLE }}>Edit Reminder</h1>
              <p className="text-sm text-gray-500">Update your reminder details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b px-8 py-6">
            <h2 className="text-xl font-bold" style={{ color: PURPLE }}>Reminder Details</h2>
            <p className="text-sm text-gray-600 mt-1">Update the information below</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium" style={{ color: PURPLE }}>Reminder Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Team Meeting, Doctor Appointment"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium" style={{ color: PURPLE }}>Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about this reminder..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  rows={4}
                  className="resize-none rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Event Date and Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center" style={{ color: PURPLE }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Event Date & Time * (DD/MM/YYYY)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                    className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    title="DD/MM/YYYY"
                  />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    required
                    className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    title="HH:MM (24-hour format)"
                  />
                </div>
              </div>

              {/* Reminder Date and Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center" style={{ color: PURPLE }}>
                  <Bell className="h-4 w-4 mr-2" />
                  Reminder Date & Time * (DD/MM/YYYY)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => handleChange('reminderDate', e.target.value)}
                    required
                    className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    title="DD/MM/YYYY"
                  />
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => handleChange('reminderTime', e.target.value)}
                    required
                    className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    title="HH:MM (24-hour format)"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center" style={{ color: PURPLE }}>
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
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">The reminder will be sent to this email address</p>
              </div>

              {/* Frequency - Multi Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: PURPLE }}>Reminder Frequency * (Select one or more)</Label>
                <div className="space-y-3 p-4 border-2 rounded-lg" style={{ borderColor: PURPLE }}>
                  {['once', 'daily', 'weekly', 'monthly'].map((freq) => (
                    <div key={freq} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`freq-${freq}`}
                        checked={formData.frequencies.includes(freq)}
                        onChange={(e) => {
                          const newFreqs = e.target.checked
                            ? [...formData.frequencies, freq]
                            : formData.frequencies.filter(f => f !== freq);
                          handleChange('frequencies', newFreqs);
                        }}
                        className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                        style={{ accentColor: PURPLE }}
                      />
                      <label htmlFor={`freq-${freq}`} className="text-sm font-medium cursor-pointer flex-1">
                        {freq.charAt(0).toUpperCase() + freq.slice(1)} - 
                        {freq === 'once' && ' One-time reminder only'}
                        {freq === 'daily' && ' Every day'}
                        {freq === 'weekly' && ' Every week'}
                        {freq === 'monthly' && ' Every month'}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">You can select multiple frequencies</p>
              </div>

              {/* Buttons */}
              <div className="pt-6 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 h-11 rounded-lg border-2"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: PURPLE }}
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