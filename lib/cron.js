import cron from 'node-cron';
import { getDb } from './mongodb';
import { resend } from './resend';
import { ReminderEmailTemplate } from '@/components/email-template';

let cronJob = null;

export function startReminderCron() {
  if (cronJob) {
    console.log('Cron job already running');
    return;
  }

  // Run every hour
  cronJob = cron.schedule('0 * * * *', async () => {
    console.log('Checking for reminders to send...');
    await checkAndSendReminders();
  });

  console.log('Reminder cron job started - runs every hour');
}

export function stopReminderCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('Reminder cron job stopped');
  }
}

export async function checkAndSendReminders() {
  try {
    const db = await getDb();
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH

    // Find reminders that need to be sent
    const reminders = await db.collection('reminders')
      .find({
        reminderDate: { $lte: now },
        status: 'active'
      })
      .toArray();

    console.log(`Found ${reminders.length} reminders to process`);

    for (const reminder of reminders) {
      try {
        // Create HTML email content
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4F46E5; padding: 20px; border-radius: 8px 8px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .content h2 { color: #1f2937; margin-top: 0; }
                .content p { color: #4b5563; font-size: 16px; line-height: 1.6; }
                .date-box { background-color: white; padding: 15px; border-radius: 6px; margin-top: 20px; }
                .date-box p { margin: 0; color: #6b7280; font-size: 14px; }
                .date-box .date-value { margin: 5px 0 0 0; color: #1f2937; font-size: 18px; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔔 Reminder Alert</h1>
              </div>
              <div class="content">
                <h2>${reminder.name}</h2>
                <p>${reminder.description}</p>
                <div class="date-box">
                  <p>Reminder Date:</p>
                  <p class="date-value">${new Date(reminder.date).toLocaleDateString()}</p>
                </div>
                <div class="footer">
                  This is an automated reminder from your Reminder App.<br>
                  You are receiving this because you set up a reminder.
                </div>
              </div>
            </body>
          </html>
        `;
        
        // Send email
        const { data, error } = await resend.emails.send({
          from: 'Reminder App <onboarding@resend.dev>',
          to: reminder.email,
          subject: `Reminder: ${reminder.name}`,
          html: emailHtml
        });

        if (error) {
          console.error('Failed to send email for reminder:', reminder.id, error);
          if (error.message && error.message.includes('testing emails')) {
            console.log('⚠️  RESEND IS IN TEST MODE: Emails can only be sent to mishalmmmuhammed@gmail.com');
            console.log('   To send to other emails, verify a domain at resend.com/domains');
          }
          continue;
        }

        console.log('✅ Email sent successfully for reminder:', reminder.id, 'to:', reminder.email);

        // Update reminder based on frequency
        if (reminder.frequency === 'once') {
          await db.collection('reminders').updateOne(
            { id: reminder.id },
            { $set: { status: 'sent', sentAt: now } }
          );
        } else {
          // Calculate next reminder date
          const nextDate = calculateNextReminderDate(reminder.reminderDate, reminder.frequency);
          await db.collection('reminders').updateOne(
            { id: reminder.id },
            { 
              $set: { 
                reminderDate: nextDate,
                lastSentAt: now
              }
            }
          );
        }
      } catch (err) {
        console.error('Error processing reminder:', reminder.id, err);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

function calculateNextReminderDate(currentDate, frequency) {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return date;
  }
  
  return date;
}