'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Bell } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: 'Success!',
        description: 'Account created successfully',
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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#6757b6' }}>
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-2/3 flex-col justify-center px-16 py-12" style={{ backgroundColor: '#6757b6' }}>
        <div className="max-w-2xl">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-16 w-16 bg-white rounded-sm flex items-center justify-center">
              <Bell className="h-8 w-8" style={{ color: '#6757b6' }} />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">REMINDER</h1>
          </div>

    

          <div className="space-y-8">
            <div className="border-l-2 border-white pl-6">
              <h3 className="font-bold text-white mb-2 text-lg uppercase tracking-wider">Schedule Reminders</h3>
              <p className="text-white/70 text-sm font-light">Create reminders with custom dates and descriptions</p>
            </div>
            <div className="border-l-2 border-white pl-6">
              <h3 className="font-bold text-white mb-2 text-lg uppercase tracking-wider">Email Notifications</h3>
              <p className="text-white/70 text-sm font-light">Receive email alerts on your reminder dates</p>
            </div>
            <div className="border-l-2 border-white pl-6">
              <h3 className="font-bold text-white mb-2 text-lg uppercase tracking-wider">Track Everything</h3>
              <p className="text-white/70 text-sm font-light">View all your reminders in one place</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/3 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold uppercase tracking-wide" style={{ color: '#6757b6' }}>Welcome</h2>
            <p className="text-gray-600 text-sm font-light">Login or create an account to get started</p>
          </div>

          <div className="flex mb-10 border-b-2" style={{ borderColor: '#6757b6' }}>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all text-gray-400 hover:text-gray-600"
            >
              Login
            </button>
            <button
              className="flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2"
              style={{ color: '#6757b6', borderColor: '#6757b6' }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold uppercase text-xs tracking-wider" style={{ color: '#6757b6' }}>Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 border-2 rounded-none" style={{ borderColor: '#6757b6' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold uppercase text-xs tracking-wider" style={{ color: '#6757b6' }}>Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-2 rounded-none" style={{ borderColor: '#6757b6' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold uppercase text-xs tracking-wider" style={{ color: '#6757b6' }}>Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 border-2 rounded-none" style={{ borderColor: '#6757b6' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold uppercase text-xs tracking-wider" style={{ color: '#6757b6' }}>Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-12 border-2 rounded-none" style={{ borderColor: '#6757b6' }} />
            </div>
            <Button type="submit" className="w-full h-12 text-white rounded-none font-bold uppercase tracking-wider transition-all hover:opacity-90" style={{ backgroundColor: '#6757b6' }} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}