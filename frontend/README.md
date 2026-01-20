# Nothing but adventures Frontend

Modern Next.js frontend for the Nothing but adventures travel platform.

## 🚀 **Technology Stack**

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## 🏗️ **Project Structure**

```
frontend/
├── src/
│   ├── app/              # App Router pages
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable UI components
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
├── .env.example         # Environment variables template
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ **Development**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # App available at http://localhost:3000
   ```

## 📝 **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔧 **Configuration**

### **Environment Variables**

- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_APP_URL`: Frontend application URL

### **Features Ready for Development**

- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ ESLint configuration
- ✅ Next.js 14 App Router
- ✅ API integration ready
- ✅ Image optimization configured

## 🎨 **UI Development Notes**

This frontend is ready for implementing the Nothing but adventures travel platform UI based on the Figma designs. The structure supports:

- Tour browsing and search
- Country exploration
- User authentication
- Booking system
- Review management
- User dashboard
- Admin panel

## 📱 **Responsive Design**

The application is configured with Tailwind CSS for responsive design across:

- Mobile devices
- Tablets
- Desktop screens
- Large displays

---

**Ready for UI implementation based on Figma designs!**

# or

pnpm dev

# or

bun dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```
