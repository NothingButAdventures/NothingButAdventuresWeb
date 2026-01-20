# Nothing but adventures Full-Stack Application

A comprehensive travel exploring and tour hosting platform built with modern technologies.

## 🏗️ **Project Structure**

```
Nothing but adventures/
├── backend/                 # Node.js + Express.js API
│   ├── config/             # Database & service configs
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── logs/              # Application logs
│   ├── package.json       # Backend dependencies
│   └── server.js          # Backend entry point
├── frontend/               # Next.js + TypeScript UI
│   ├── src/               # Source code
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/          # Utilities & configs
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── next.config.js    # Next.js configuration
├── package.json          # Root package.json for scripts
└── README.md            # This file
```

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Supabase account (for image storage)

### **Installation**

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd "Nothing but adventures"
   npm install
   npm run install:all
   ```

2. **Setup environment variables:**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configurations
   ```

3. **Start development servers:**

   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:backend    # Backend on http://localhost:5000
   npm run dev:frontend   # Frontend on http://localhost:3000
   ```

## 🔧 **Available Scripts**

### **Development**

```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
```

### **Production**

```bash
npm run build           # Build both applications
npm run start           # Start both in production mode
```

### **Installation**

```bash
npm run install:all     # Install dependencies for both
npm run install:backend # Install backend dependencies
npm run install:frontend # Install frontend dependencies
```

### **Testing & Linting**

```bash
npm run test            # Run tests for both
npm run lint            # Lint both applications
```

## 🛠️ **Technology Stack**

### **Backend**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Image Storage**: Supabase
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

### **Frontend**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Development**: Hot reload, Fast refresh

## 📊 **Features**

### **Backend API**

- ✅ User authentication & authorization
- ✅ Tour management system
- ✅ Country and destination data
- ✅ Booking system with payment tracking
- ✅ Review and rating system
- ✅ Image upload to Supabase
- ✅ Comprehensive error handling
- ✅ API filtering, sorting, pagination

### **Frontend (Ready for Development)**

- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ ESLint configuration
- ✅ Development environment setup

## 🔐 **Environment Configuration**

### **Backend Environment Variables**

Create `backend/.env` with:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nothingbutadventures
JWT_SECRET=your-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
CLIENT_URL=http://localhost:3000
```

## 📝 **Development Workflow**

1. **Backend Development:**

   ```bash
   cd backend
   npm run dev
   # API available at http://localhost:5000
   # Health check: GET http://localhost:5000/health
   ```

2. **Frontend Development:**

   ```bash
   cd frontend
   npm run dev
   # App available at http://localhost:3000
   ```

3. **Full-Stack Development:**
   ```bash
   # From root directory
   npm run dev
   # Both servers start concurrently
   ```

## 📚 **API Documentation**

The backend provides RESTful APIs for:

- **Authentication**: `/api/v1/auth/*`
- **Tours**: `/api/v1/tours/*`
- **Countries**: `/api/v1/countries/*`
- **Bookings**: `/api/v1/bookings/*`
- **Reviews**: `/api/v1/reviews/*`
- **Users**: `/api/v1/users/*`

For detailed API documentation, see `backend/README.md`.

## 🚀 **Deployment**

### **Backend Deployment**

1. Set production environment variables
2. Configure MongoDB Atlas whitelist
3. Set up Supabase storage buckets
4. Deploy to your preferred platform (Vercel, Railway, etc.)

### **Frontend Deployment**

1. Configure API endpoint in environment variables
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or similar platform

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in respective directories

---

**Built with ❤️ for the future of travel**
