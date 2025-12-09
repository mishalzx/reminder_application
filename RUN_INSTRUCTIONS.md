# How to Run Your Reminder Application

## 🎯 Backend + Frontend (All-in-One)

This is a Next.js application where **backend and frontend run together**.

### Current Environment (Already Running):
- Frontend: https://notify-task.preview.emergentagent.com
- Backend API: https://notify-task.preview.emergentagent.com/api
- MongoDB: Running on localhost:27017

---

## 🏃 Running Locally (After Download)

### Step 1: Prerequisites
Install these first:
- Node.js (v18+): https://nodejs.org/
- MongoDB: https://www.mongodb.com/try/download/community
- npm or yarn package manager

### Step 2: Install Dependencies
```bash
cd reminder-app
npm install
# OR
yarn install
```

### Step 3: Set Up Environment Variables
Create `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=reminder_app

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# CORS
CORS_ORIGINS=*

# Resend Email API (get from resend.com)
RESEND_API_KEY=re_your_api_key_here

# JWT Secret (any random string)
JWT_SECRET=your_super_secret_key_here
```

### Step 4: Start MongoDB
**Option A: Local MongoDB**
```bash
# macOS/Linux
sudo systemctl start mongodb
# OR
mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update MONGO_URL in .env

### Step 5: Run the Application
```bash
# Development Mode (Hot Reload)
npm run dev
# OR
yarn dev

# Production Mode
npm run build
npm start
```

### Step 6: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- Dashboard: http://localhost:3000/dashboard

---

## 📡 API Endpoints (Backend Routes)

All backend APIs are at: http://localhost:3000/api

### Authentication:
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get user profile

### Reminders:
- GET /api/reminders - Get all reminders
- POST /api/reminders - Create reminder
- PUT /api/reminders/{id} - Update reminder
- DELETE /api/reminders/{id} - Delete reminder
- GET /api/reminders/check - Trigger email check

---

## 🧪 Testing the Backend

### Test with curl:
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get reminders (replace TOKEN with actual token)
curl http://localhost:3000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Browser:
1. Open http://localhost:3000
2. Register an account
3. Login
4. Create a reminder
5. Check dashboard

---

## 📊 Check if Services are Running

### Check Next.js:
```bash
curl http://localhost:3000
# Should return HTML
```

### Check MongoDB:
```bash
mongosh
# OR
mongo
# Should connect to MongoDB shell
```

### Check Backend API:
```bash
curl http://localhost:3000/api/auth/me
# Should return 401 Unauthorized (means API is working)
```

---

## 🔧 Troubleshooting

### Port 3000 Already in Use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# OR
npx kill-port 3000
```

### MongoDB Not Running:
```bash
# Check MongoDB status
sudo systemctl status mongodb
# OR
ps aux | grep mongod
```

### Module Not Found:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading:
```bash
# Make sure .env file exists
ls -la .env

# Check if variables are set
node -e "require('dotenv').config(); console.log(process.env.MONGO_URL)"
```

---

## 📁 Backend Files Location

```
app/
├── api/
│   └── [[...path]]/
│       └── route.js          ← ALL BACKEND LOGIC HERE
├── lib/
│   ├── mongodb.js            ← Database connection
│   ├── auth.js               ← Authentication
│   ├── resend.js             ← Email service
│   └── cron.js               ← Scheduled tasks
```

---

## 🎯 How It Works

1. **Next.js handles both frontend and backend**
2. **Frontend pages** are in `/app/*.js`
3. **Backend APIs** are in `/app/api/[[...path]]/route.js`
4. **All routes** go through Next.js server
5. **Cron job** runs automatically when server starts
6. **MongoDB** stores all data
7. **Resend** sends emails

---

## 🚀 Production Deployment

### Vercel (Recommended):
```bash
npm install -g vercel
vercel
```

### Environment Variables for Production:
- Set all .env variables in hosting platform
- Use MongoDB Atlas for database
- Verify domain with Resend

---

## 📞 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Check MongoDB
mongosh

# View logs
tail -f .next/trace

# Restart everything
npm run dev
```

**That's it! Your backend runs automatically with the frontend! 🎉**
