import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, verifyPassword, generateToken, getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { checkAndSendReminders, startReminderCron } from '@/lib/cron';

// Start cron job when server starts
if (typeof window === 'undefined') {
  startReminderCron();
}

export async function GET(request) {
  const { pathname } = new URL(request.url);

  // Get reminders
  if (pathname === '/api/reminders') {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const db = await getDb();
      const reminders = await db.collection('reminders')
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ reminders });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
    }
  }

  // Check reminders manually (for testing)
  if (pathname === '/api/reminders/check') {
    try {
      await checkAndSendReminders();
      return NextResponse.json({ message: 'Reminders checked and sent' });
    } catch (error) {
      console.error('Error checking reminders:', error);
      return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 });
    }
  }

  // Get user profile
  if (pathname === '/api/auth/me') {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const db = await getDb();
      const userData = await db.collection('users').findOne(
        { id: user.userId },
        { projection: { password: 0 } }
      );

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user: userData });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request) {
  const { pathname } = new URL(request.url);

  // Register
  if (pathname === '/api/auth/register') {
    try {
      const body = await request.json();
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email and password are required' },
          { status: 400 }
        );
      }

      const db = await getDb();
      
      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        );
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const userId = uuidv4();
      const user = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      };

      await db.collection('users').insertOne(user);

      // Generate token
      const token = generateToken(userId, email);

      return NextResponse.json({
        message: 'User registered successfully',
        token,
        user: { id: userId, name, email }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }
  }

  // Login
  if (pathname === '/api/auth/login') {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const db = await getDb();
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      );
    }
  }

  // Create reminder
  if (pathname === '/api/reminders') {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { name, description, date, email, reminderDate, frequency } = body;

      if (!name || !description || !date || !email || !reminderDate || !frequency) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        );
      }

      const db = await getDb();
      const reminderId = uuidv4();
      
      console.log('Received date strings from frontend:', { date, reminderDate });
      
      // Parse dates - the format is YYYY-MM-DDTHH:mm from date+time inputs
      // We want to store the EXACT datetime values without any timezone conversion
      const parseLocalDateTime = (dateTimeString) => {
        if (!dateTimeString) return new Date();
        
        // The string comes in format: YYYY-MM-DDTHH:mm (e.g., "2025-04-12T12:06")
        // Parse it manually to avoid timezone issues
        const match = dateTimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
        if (!match) {
          console.error('Invalid date format:', dateTimeString);
          return new Date(dateTimeString); // Fallback
        }
        
        const [_, year, month, day, hour, minute] = match;
        
        // Create date in UTC with these exact values
        // This ensures the time stored is exactly what the user entered
        const utcDate = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          0,
          0
        ));
        
        console.log('Parsed date:', {
          input: dateTimeString,
          components: { year, month, day, hour, minute },
          parsed: utcDate,
          isoString: utcDate.toISOString()
        });
        
        return utcDate;
      };
      
      const parsedDate = parseLocalDateTime(date);
      const parsedReminderDate = parseLocalDateTime(reminderDate);
      
      const reminder = {
        id: reminderId,
        userId: user.userId,
        name,
        description,
        date: parsedDate,
        email,
        reminderDate: parsedReminderDate,
        frequency, // 'once', 'daily', 'weekly', 'monthly'
        status: 'active',
        createdAt: new Date()
      };
      
      console.log('Reminder object to be stored:', reminder);

      await db.collection('reminders').insertOne(reminder);

      return NextResponse.json({
        message: 'Reminder created successfully',
        reminder
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to create reminder' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(request) {
  const { pathname } = new URL(request.url);
  
  // Update reminder
  if (pathname.startsWith('/api/reminders/')) {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const reminderId = pathname.split('/').pop();
      const body = await request.json();
      const { name, description, date, email, reminderDate, frequency, status } = body;

      const db = await getDb();
      
      // Check if reminder belongs to user
      const reminder = await db.collection('reminders').findOne({ id: reminderId, userId: user.userId });
      if (!reminder) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }

      // Helper function to parse local datetime
      const parseLocalDateTime = (dateTimeString) => {
        if (!dateTimeString) return null;
        
        // The string comes in format: YYYY-MM-DDTHH:mm (e.g., "2025-04-12T12:06")
        // Parse it manually to avoid timezone issues
        const match = dateTimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
        if (!match) {
          console.error('Invalid date format:', dateTimeString);
          return new Date(dateTimeString); // Fallback
        }
        
        const [_, year, month, day, hour, minute] = match;
        
        // Create date in UTC with these exact values
        const utcDate = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          0,
          0
        ));
        
        return utcDate;
      };
      
      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (date) updateData.date = parseLocalDateTime(date);
      if (email) updateData.email = email;
      if (reminderDate) updateData.reminderDate = parseLocalDateTime(reminderDate);
      if (frequency) updateData.frequency = frequency;
      if (status) updateData.status = status;
      updateData.updatedAt = new Date();

      await db.collection('reminders').updateOne(
        { id: reminderId },
        { $set: updateData }
      );

      const updatedReminder = await db.collection('reminders').findOne({ id: reminderId });

      return NextResponse.json({
        message: 'Reminder updated successfully',
        reminder: updatedReminder
      });
    } catch (error) {
      console.error('Error updating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to update reminder' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url);
  
  // Delete reminder
  if (pathname.startsWith('/api/reminders/')) {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const reminderId = pathname.split('/').pop();
      const db = await getDb();
      
      // Check if reminder belongs to user
      const reminder = await db.collection('reminders').findOne({ id: reminderId, userId: user.userId });
      if (!reminder) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }

      await db.collection('reminders').deleteOne({ id: reminderId });

      return NextResponse.json({
        message: 'Reminder deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return NextResponse.json(
        { error: 'Failed to delete reminder' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}