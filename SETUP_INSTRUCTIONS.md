# Reminder Application - Setup Instructions

## 📋 Overview
This is a full-stack reminder application built with Next.js, MongoDB, and Resend for email notifications.

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React
- Tailwind CSS
- shadcn/ui components
- Lucide React (icons)

**Backend:**
- Next.js API Routes
- MongoDB (Database)
- Resend (Email service)
- node-cron (Scheduled tasks)

## 📦 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community)

## 🚀 Installation Steps

### 1. Extract the Project
```bash
# Extract the zip file
unzip reminder-app.zip
cd reminder-app
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# OR using yarn
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=reminder_app

# Next.js Base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# CORS Origins
CORS_ORIGINS=*

# Resend API Key (Get from https://resend.com)
RESEND_API_KEY=your_resend_api_key_here

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key and paste it in `.env` file

**Important:** In test mode, Resend only sends emails to your registered email address. To send to any email, you need to verify a domain.

### 5. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URL` in `.env` file

### 6. Run the Application

**Development Mode:**
```bash
npm run dev
# OR
yarn dev
```

The application will start at `http://localhost:3000`

**Production Build:**
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
reminder-app/
├── app/
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js          # All API endpoints
│   ├── dashboard/
│   │   └── page.js                # Dashboard page
│   ├── create-reminder/
│   │   └── page.js                # Create reminder form
│   ├── edit-reminder/
│   │   └── [id]/
│   │       └── page.js            # Edit reminder form
│   ├── register/
│   │   └── page.js                # Registration page
│   ├── page.js                    # Login page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── email-template.jsx         # Email template
├── lib/
│   ├── mongodb.js                 # MongoDB connection
│   ├── auth.js                    # Authentication utilities
│   ├── resend.js                  # Resend client
│   └── cron.js                    # Cron job for reminders
├── .env                           # Environment variables
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
└── next.config.js                 # Next.js configuration
```

## 🔑 Key Features

1. **User Authentication**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - Login and registration

2. **Reminder Management**
   - Create, read, update, delete reminders
   - Set event date and reminder date
   - Frequency options: Once, Daily, Weekly, Monthly

3. **Email Notifications**
   - Automatic email reminders via Resend
   - Cron job runs every hour
   - Recurring reminders support

4. **Dashboard**
   - View all reminders
   - Statistics (Total, Active, Sent)
   - Edit and delete reminders

## 🔧 Configuration

### Cron Job Schedule
The reminder check runs every hour by default. To change frequency, edit `/app/lib/cron.js`:

```javascript
// Current: Runs every hour
cron.schedule('0 * * * *', async () => { ... });

// Run every 30 minutes
cron.schedule('*/30 * * * *', async () => { ... });

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => { ... });
```

### Email Configuration
Update the `from` email in `/app/lib/cron.js`:

```javascript
from: 'Reminder App <onboarding@resend.dev>',
// Change to your verified domain
from: 'Reminder App <noreply@yourdomain.com>',
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
sudo systemctl start mongodb
# OR
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user profile

### Reminders
- `GET /api/reminders` - Get all reminders (requires auth)
- `POST /api/reminders` - Create reminder (requires auth)
- `PUT /api/reminders/:id` - Update reminder (requires auth)
- `DELETE /api/reminders/:id` - Delete reminder (requires auth)
- `GET /api/reminders/check` - Manually trigger reminder check

## 🚀 Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms
- **Netlify**: Similar to Vercel
- **Railway**: Supports MongoDB
- **Render**: Full-stack deployment
- **DigitalOcean**: VPS deployment

**Important:** For production, use MongoDB Atlas (cloud) instead of local MongoDB.

## 🎨 Design System

**Colors:**
- Primary Purple: `#6757b6` (Al-Arabia theme)
- Background: `#f5f5f5`
- Cards: `#FFFFFF`
- Orange: Active reminders
- Green: Sent reminders

**Components:**
- shadcn/ui library
- Tailwind CSS utilities
- Rounded corners (modern design)
- Soft shadows

## 📧 Support

For issues or questions:
1. Check environment variables
2. Ensure MongoDB is running
3. Verify Resend API key is valid
4. Check browser console for errors

## 📄 License

This project is open source and available for personal and commercial use.

---

**Happy Coding! 🎉**
