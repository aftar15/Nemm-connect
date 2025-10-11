# NeMM Convention Connect

A Progressive Web App (PWA) for managing the NeMM-wide Convention - streamlining event management, centralizing communication, and creating a seamless experience for all participants.

## 🚀 Features

- **Role-Based Authentication** - Secure access for Admins, Chapter Leaders, and Attendees
- **Chapter-Based Registration** - Streamlined participant management
- **Real-Time Live Feed** - Instant schedule updates and announcements
- **Automated Tribe Assignment** - Random and even distribution across 12 tribes
- **Results Board** - Live tournament brackets and scores
- **QR Code Attendance** - Fast and accurate event check-ins
- **Information Hub** - Tribe display, directory, and venue information
- **PWA Support** - Offline access and installable on any device

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn/UI** - Beautiful, accessible component library
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge Functions

### Deployment
- **Vercel** - Frontend hosting with CI/CD
- **Supabase Cloud** - Backend infrastructure

## 📁 Project Structure

```
nemm-connect/
├── types/                      # Shared TypeScript type definitions
│   ├── user.types.ts
│   ├── event.types.ts
│   ├── tribe.types.ts
│   └── database.types.ts
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication pages
│   │   │   └── login/
│   │   ├── (app)/              # Main authenticated app
│   │   │   ├── dashboard/      # Live Feed
│   │   │   ├── results/        # Results Board
│   │   │   ├── my-tribe/       # Tribe information
│   │   │   ├── directory/      # Committee directory
│   │   │   └── check-in/       # QR scanner
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── registration/
│   │   │   └── attendance/
│   │   ├── chapter-leader/     # Chapter Leader dashboard
│   │   │   └── roster/
│   │   └── api/auth/callback/  # Auth callback
│   │
│   ├── components/
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── features/           # Feature-specific components
│   │   │   ├── live-feed/
│   │   │   ├── results/
│   │   │   └── attendance/
│   │   └── auth/               # Authentication components
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server client
│   │   └── utils.ts            # Utility functions
│   │
│   └── stores/                 # Zustand state management
│       ├── user.store.ts
│       └── announcements.store.ts
│
├── supabase/
│   ├── migrations/             # Database migrations
│   │   └── 20251009_initial_schema.sql
│   └── functions/              # Edge Functions
│       └── assign-tribes/
│
├── public/
│   └── manifest.json           # PWA manifest
│
└── Configuration Files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── components.json
    ├── .prettierrc
    └── env.example
```

## 🏃 Getting Started

### Prerequisites

- **Node.js 20+** and npm/yarn
- **Docker** (for running Supabase locally)
- **Supabase CLI** - `npm install -g supabase`

### Installation

1. **Clone the repository**
   ```bash
   cd nemm-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start local Supabase** (optional, for local development)
   ```bash
   supabase start
   ```
   
   This will output your local Supabase URL and keys. Update `.env.local` with these values.

5. **Run database migrations**
   ```bash
   supabase db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following main tables:

- **chapters** - Chapter information
- **tribes** - 12 Tribes of Israel (pre-seeded)
- **users** - User profiles with role-based access
- **schedule_events** - Event schedule
- **announcements** - Live feed announcements
- **event_registrations** - Participant event sign-ups
- **attendance** - QR code check-ins
- **competition_events** - Competition/tournament information
- **matches** - Tournament brackets and scores

All tables include Row Level Security (RLS) policies for secure access control.

## 🔒 User Roles

1. **Admin** - Full system access, manages announcements, tribe assignment, QR generation
2. **Chapter Leader** - Manages their chapter's roster and event registrations
3. **Committee Head** - Submits scores for competitions
4. **Attendee** - Views schedule, announcements, tribe info, and checks in to events

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations: `supabase db push --linked`
3. Deploy edge functions: `supabase functions deploy assign-tribes`

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🧪 Testing

Testing setup will be added in future updates using:
- **Vitest** for unit/component tests
- **Playwright** for E2E tests

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:

- `project-overview.md` - Vision, goals, and success metrics
- `features.md` - Feature specifications
- `requirements.md` - Functional and technical requirements
- `tech-stack.md` - Technology choices and rationale
- `implementation.md` - Code standards and examples
- `project-structure.md` - Architecture details
- `user-flow.md` - User journey documentation

## 🤝 Contributing

This is a focused project for the NeMM Convention. For any issues or suggestions, please contact the development team.

## 📄 License

This project is developed for the NeMM-wide Convention.

## 🙏 Acknowledgments

Built with modern web technologies to serve the NeMM community and enhance the convention experience.

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025
