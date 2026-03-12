# 🚀 R.K Gowsikan Portfolio — Backend

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Backend server |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB ODM |
| JWT | Admin session tokens |
| Nodemailer + Gmail | OTP email delivery |
| Cloudinary | Image storage (gallery + profile) |
| Multer + multer-storage-cloudinary | File upload handling |
| bcryptjs | OTP hashing |
| CORS | Frontend-backend connection |

---

## 📁 Folder Structure

```
backend/
│
├── config/
│   ├── db.js               ← MongoDB Atlas connection
│   ├── mailer.js           ← Gmail SMTP / OTP email sender
│   └── cloudinary.js       ← Cloudinary config (gallery + profile storage)
│
├── middleware/
│   └── auth.js             ← JWT token verification (protects admin routes)
│
├── models/
│   ├── Admin.js            ← Admin email + OTP fields + Cloudinary photo ID
│   ├── Message.js          ← Contact form submissions
│   ├── Gallery.js          ← Gallery image URL + Cloudinary ID + caption
│   ├── Project.js          ← Projects (title, role, icon, tech, desc, impact)
│   ├── Training.js         ← Training (org, topic, desc, badge)
│   └── Internship.js       ← Internship (org, role, desc, projects[])
│
├── routes/
│   ├── authRoutes.js       ← POST /api/auth/send-otp
│   │                          POST /api/auth/verify-otp
│   │                          GET  /api/auth/me
│   │
│   ├── messageRoutes.js    ← POST   /api/messages
│   │                          GET    /api/messages
│   │                          PATCH  /api/messages/:id/read
│   │                          DELETE /api/messages/:id
│   │
│   ├── galleryRoutes.js    ← GET    /api/gallery
│   │                          POST   /api/gallery         (Cloudinary upload)
│   │                          PATCH  /api/gallery/:id     (caption + description)
│   │                          DELETE /api/gallery/:id     (deletes from Cloudinary too)
│   │
│   ├── profileRoutes.js    ← POST /api/profile/photo     (Cloudinary upload)
│   │                          GET  /api/profile/photo
│   │
│   ├── projectRoutes.js    ← GET/POST/PATCH/DELETE /api/projects
│   ├── trainingRoutes.js   ← GET/POST/PATCH/DELETE /api/training
│   └── internshipRoutes.js ← GET/POST/PATCH/DELETE /api/internships
│
├── server.js               ← Express app entry point + auto seed
├── package.json
└── .env                    ← Environment variables (never commit this!)
```

---

## ⚙️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file
```env
# Server
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/portfolio

# JWT
JWT_SECRET=your_long_random_secret_here

# Admin Login
ADMIN_EMAIL=gowsikan2005raju@gmail.com

# Gmail OTP
GMAIL_USER=gowsikan2005raju@gmail.com
GMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx

# Cloudinary Images
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend CORS
FRONTEND_URL=http://127.0.0.1:5500
```

### 3. Start Server
```bash
npm run dev      # development (nodemon auto-restart)
npm start        # production
```

### 4. First Run — Auto Seeds:
```
✅ MongoDB connected
✅ Admin seeded
✅ Projects seeded (3 projects)
✅ Training seeded (1 entry)
✅ Internship seeded (1 entry)
```

---

## 🔐 Admin Login Flow (OTP Only — No Password)

```
1. Admin clicks ⚙️ on portfolio
2. Enters email → clicks "Send OTP"
3. 6-digit OTP sent to Gmail (valid 10 minutes)
4. Admin enters OTP → JWT token issued (valid 8 hours)
5. Admin panel unlocked ✅
```

---

## 🖼️ Image Storage — Cloudinary

```
All images stored permanently on Cloudinary:

portfolio/
├── gallery/    ← All gallery uploads
└── profile/    ← Profile photo

MongoDB only stores the Cloudinary URL — not the image itself.
Images survive server restarts and redeployments. ✅
```

---

## 🗄️ Database — MongoDB Atlas

```
Collections:
├── admins        ← 1 document (admin email + OTP)
├── messages      ← contact form submissions
├── galleries     ← gallery image URLs + captions
├── projects      ← portfolio projects
├── trainings     ← training records
└── internships   ← internship records
```

---

## 🌐 Deployment

| Service | Purpose | Cost |
|---------|---------|------|
| MongoDB Atlas | Database | Free (512MB) |
| Cloudinary | Image storage | Free (25GB) |
| Render | Backend hosting | Free |
| Vercel | Frontend hosting | Free |

### After Deployment — Update `.env` on Render:
```env
MONGO_URI=mongodb+srv://...         ← Atlas connection string
FRONTEND_URL=https://rkg-portfolio.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Update `script.js` Line 1:
```js
const API = 'https://your-backend.onrender.com/api';
```

---

## 👨‍💻 Built By

**C. Martin Priyadharson**
📧 priyadharsoncmartin@gmail.com

Portfolio for: **R.K Gowsikan** — AI Engineer & App Developer
