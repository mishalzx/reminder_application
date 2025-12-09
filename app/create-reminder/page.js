'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Bell, Calendar, Mail } from 'lucide-react';

export default function CreateReminderPage() {
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
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const dateTime = `${formData.date}T${formData.time}`;
      const reminderDateTime = `${formData.reminderDate}T${formData.reminderTime}`;
      
      console.log('=== FRONTEND: Before sending to API ===');
      console.log('Form data:', formData);
      console.log('Combined dateTime:', dateTime);
      console.log('Combined reminderDateTime:', reminderDateTime);
      console.log('Browser timezone offset (minutes):', new Date().getTimezoneOffset());
      
      // Validate at least one frequency is selected
      if (formData.frequencies.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select at least one reminder frequency',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        date: dateTime,
        email: formData.email,
        reminderDate: reminderDateTime,
        frequencies: formData.frequencies
      };

      console.log('Payload being sent:', payload);

      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reminder');
      }

      toast({
        title: 'Success!',
        description: 'Reminder created successfully',
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
              <ArrowLeft className="h-5 w-5" style={{ color: '#6757b6' }} />
            </button>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6757b6' }}>
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#6757b6' }}>Create Reminder</h1>
              <p className="text-sm text-gray-500">Set up a new reminder notification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b px-8 py-6">
            <h2 className="text-xl font-bold" style={{ color: '#6757b6' }}>Reminder Details</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the information below</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#6757b6' }}>
                  Reminder Name *
                </Label>
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
                  Event Date & Time * (DD/MM/YYYY)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                    title="DD/MM/YYYY"
                  />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                    title="HH:MM (24-hour format)"
                  />
                </div>
                <p className="text-xs text-gray-500 font-light">Select date (day/month/year) and time (24-hour format)</p>
              </div>

              {/* Reminder Date and Time */}
              <div className="space-y-3">
                <Label className="text-black font-bold uppercase text-xs tracking-wider flex items-center">
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
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                    title="DD/MM/YYYY"
                  />
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => handleChange('reminderTime', e.target.value)}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-black"
                    title="HH:MM (24-hour format)"
                  />
                </div>
                <p className="text-xs text-gray-500 font-light">When should the reminder be sent?</p>
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

              {/* Frequency - Multi Select */}
              <div className="space-y-3">
                <Label className="text-sm font-medium" style={{ color: '#6757b6' }}>
                  Reminder Frequency * (Select one or more)
                </Label>
                <div className="space-y-3 p-4 border-2 rounded-lg" style={{ borderColor: '#6757b6' }}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="freq-once"
                      checked={formData.frequencies.includes('once')}
                      onChange={(e) => {
                        const newFreqs = e.target.checked
                          ? [...formData.frequencies, 'once']
                          : formData.frequencies.filter(f => f !== 'once');
                        handleChange('frequencies', newFreqs);
                      }}
                      className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: '#6757b6' }}
                    />
                    <label htmlFor="freq-once" className="text-sm font-medium cursor-pointer flex-1">
                      Once - One-time reminder only
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="freq-daily"
                      checked={formData.frequencies.includes('daily')}
                      onChange={(e) => {
                        const newFreqs = e.target.checked
                          ? [...formData.frequencies, 'daily']
                          : formData.frequencies.filter(f => f !== 'daily');
                        handleChange('frequencies', newFreqs);
                      }}
                      className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: '#6757b6' }}
                    />
                    <label htmlFor="freq-daily" className="text-sm font-medium cursor-pointer flex-1">
                      Daily - Every day
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="freq-weekly"
                      checked={formData.frequencies.includes('weekly')}
                      onChange={(e) => {
                        const newFreqs = e.target.checked
                          ? [...formData.frequencies, 'weekly']
                          : formData.frequencies.filter(f => f !== 'weekly');
                        handleChange('frequencies', newFreqs);
                      }}
                      className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: '#6757b6' }}
                    />
                    <label htmlFor="freq-weekly" className="text-sm font-medium cursor-pointer flex-1">
                      Weekly - Every week
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="freq-monthly"
                      checked={formData.frequencies.includes('monthly')}
                      onChange={(e) => {
                        const newFreqs = e.target.checked
                          ? [...formData.frequencies, 'monthly']
                          : formData.frequencies.filter(f => f !== 'monthly');
                        handleChange('frequencies', newFreqs);
                      }}
                      className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: '#6757b6' }}
                    />
                    <label htmlFor="freq-monthly" className="text-sm font-medium cursor-pointer flex-1">
                      Monthly - Every month
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  You can select multiple frequencies. For example: Daily + Weekly will send reminders every day AND once per week.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-none font-bold uppercase tracking-wider"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Reminder'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white border-2 border-black p-6">
          <div className="flex items-start space-x-4">
            <Bell className="h-6 w-6 text-black mt-1" />
            <div>
              <h3 className="font-bold text-black mb-2 uppercase tracking-wider">How Reminders Work</h3>
              <ul className="text-sm text-gray-600 space-y-1 font-light">
                <li>• Reminders are checked every hour automatically</li>
                <li>• You&apos;ll receive an email when the reminder date is reached</li>
                <li>• Recurring reminders will continue until you delete them</li>
                <li>• You can manage all reminders from your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}