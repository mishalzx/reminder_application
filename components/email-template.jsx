import * as React from 'react';

export function ReminderEmailTemplate({ name, description, date }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#4F46E5', padding: '20px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: 'white', margin: 0 }}>🔔 Reminder Alert</h1>
      </div>
      <div style={{ backgroundColor: '#f9fafb', padding: '30px', borderRadius: '0 0 8px 8px' }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>{name}</h2>
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>{description}</p>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginTop: '20px' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Reminder Date:</p>
          <p style={{ margin: '5px 0 0 0', color: '#1f2937', fontSize: '18px', fontWeight: 'bold' }}>{date}</p>
        </div>
        <p style={{ marginTop: '30px', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          This is an automated reminder from your Reminder App.<br />
          You are receiving this because you set up a reminder.
        </p>
      </div>
    </div>
  );
}