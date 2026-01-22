import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import html2pdf from 'html2pdf.js';

const AdminDocs: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('documentation-content');
      if (!element) return;

      const options = {
        margin: [15, 15, 15, 15],
        filename: 'the-forge-app-documentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">App Documentation</h1>
            <p className="text-sm text-muted-foreground">Complete technical reference for The Forge App</p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Documentation Content */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div id="documentation-content" className="p-8 space-y-8 bg-white text-black print:bg-white">
            {/* Title Page */}
            <div className="text-center pb-8 border-b border-gray-200">
              <h1 className="text-4xl font-bold mb-4">The Forge App</h1>
              <h2 className="text-xl text-gray-600 mb-2">Technical Documentation</h2>
              <p className="text-gray-500">Version 1.0 | Generated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table of Contents */}
            <section className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li><a href="#overview" className="hover:text-primary">Project Overview</a></li>
                <li><a href="#tech-stack" className="hover:text-primary">Technology Stack</a></li>
                <li><a href="#architecture" className="hover:text-primary">System Architecture</a></li>
                <li><a href="#database" className="hover:text-primary">Database Schema</a></li>
                <li><a href="#authentication" className="hover:text-primary">Authentication & Authorization</a></li>
                <li><a href="#features" className="hover:text-primary">Core Features</a></li>
                <li><a href="#edge-functions" className="hover:text-primary">Edge Functions</a></li>
                <li><a href="#design-system" className="hover:text-primary">UI/UX Design System</a></li>
                <li><a href="#development" className="hover:text-primary">Development Guide</a></li>
              </ol>
            </section>

            {/* 1. Project Overview */}
            <section id="overview" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">1. Project Overview</h2>
              <p className="mb-4 text-gray-700">
                The Forge App is a cohort-based learning platform designed for filmmaking education programs.
                It serves as a comprehensive mobile-first web application for students participating in
                intensive filmmaking bootcamps.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Cohort Types</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li><strong>FORGE</strong> - Core filmmaking program (10-day intensive)</li>
                <li><strong>FORGE_WRITING</strong> - Screenwriting focused program</li>
                <li><strong>FORGE_CREATORS</strong> - Content creator program</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Target Users</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Students enrolled in FORGE programs</li>
                <li>Program mentors and instructors</li>
                <li>Administrative staff</li>
              </ul>
            </section>

            {/* 2. Technology Stack */}
            <section id="tech-stack" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">2. Technology Stack</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Frontend</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>React 18.3.1</li>
                    <li>TypeScript</li>
                    <li>Vite (Build Tool)</li>
                    <li>Tailwind CSS</li>
                    <li>React Router DOM 6.30</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">UI Components</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>shadcn/ui</li>
                    <li>Radix UI Primitives</li>
                    <li>Lucide Icons</li>
                    <li>Framer Motion (implicit)</li>
                    <li>Embla Carousel</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">State Management</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>React Query (@tanstack/react-query)</li>
                    <li>React Context API</li>
                    <li>React Hook Form</li>
                    <li>Zod (Validation)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Backend</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Lovable Cloud (Supabase)</li>
                    <li>PostgreSQL Database</li>
                    <li>Edge Functions (Deno)</li>
                    <li>Row Level Security</li>
                    <li>Real-time Subscriptions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. System Architecture */}
            <section id="architecture" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">3. System Architecture</h2>
              
              <h3 className="text-lg font-semibold mb-3">Component Hierarchy</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-6">
                <pre>{`App
├── AuthProvider (Authentication Context)
│   └── ThemeProvider (Dark/Light Mode)
│       └── QueryClientProvider (React Query)
│           └── BrowserRouter
│               ├── Public Routes
│               │   ├── /auth (Login/Signup)
│               │   ├── /forgot-password
│               │   ├── /reset-password
│               │   └── /portfolio/:slug (Public Portfolios)
│               │
│               ├── Protected Routes (AppLayout)
│               │   ├── / (Home Dashboard)
│               │   ├── /community (Chat & Groups)
│               │   ├── /learn (Course Library)
│               │   ├── /events (Event Calendar)
│               │   ├── /roadmap/* (Journey System)
│               │   ├── /perks (Exclusive Perks)
│               │   ├── /updates (Announcements)
│               │   └── /profile (User Profile)
│               │
│               └── Admin Routes (AdminLayout)
│                   ├── /admin (Dashboard)
│                   ├── /admin/users
│                   ├── /admin/editions
│                   ├── /admin/events
│                   ├── /admin/learn
│                   └── ... (14 admin sections)`}</pre>
              </div>

              <h3 className="text-lg font-semibold mb-3">Data Flow</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <pre>{`┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│  React Query │────▶│  Supabase   │
│  Components │◀────│   (Cache)    │◀────│   Client    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐                         ┌─────────────┐
│   Context   │                         │  PostgreSQL │
│   (Auth,    │                         │  Database   │
│   Theme)    │                         │  + RLS      │
└─────────────┘                         └─────────────┘`}</pre>
              </div>
            </section>

            {/* 4. Database Schema */}
            <section id="database" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">4. Database Schema</h2>
              <p className="mb-4 text-gray-700">The database consists of 44 tables organized into logical groups:</p>

              <h3 className="text-lg font-semibold mb-2">User Management (7 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">profiles</td><td className="border border-gray-300 px-3 py-2">User profile data, settings, cohort assignment</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_roles</td><td className="border border-gray-300 px-3 py-2">Role assignments (admin, moderator, user)</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_works</td><td className="border border-gray-300 px-3 py-2">Portfolio work items</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_course_progress</td><td className="border border-gray-300 px-3 py-2">Learning progress tracking</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_video_progress</td><td className="border border-gray-300 px-3 py-2">Video watch progress</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_badges</td><td className="border border-gray-300 px-3 py-2">Achievement badges</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">editions</td><td className="border border-gray-300 px-3 py-2">Cohort editions (FORGE 25, etc.)</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Content & Learning (8 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">learn_content</td><td className="border border-gray-300 px-3 py-2">Courses and learning modules</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">learn_videos</td><td className="border border-gray-300 px-3 py-2">Video content for courses</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">mentors</td><td className="border border-gray-300 px-3 py-2">Instructor profiles</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">mentor_videos</td><td className="border border-gray-300 px-3 py-2">Mentor video content</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">alumni_testimonials</td><td className="border border-gray-300 px-3 py-2">Student testimonial videos</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">community_highlights</td><td className="border border-gray-300 px-3 py-2">Featured community moments</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">badges</td><td className="border border-gray-300 px-3 py-2">Achievement badge definitions</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">perks</td><td className="border border-gray-300 px-3 py-2">Exclusive member perks</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Events & Registrations (4 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">events</td><td className="border border-gray-300 px-3 py-2">Event listings</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">event_types</td><td className="border border-gray-300 px-3 py-2">Event categories</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">event_registrations</td><td className="border border-gray-300 px-3 py-2">User event signups</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">past_programs</td><td className="border border-gray-300 px-3 py-2">Historical program records</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Community (4 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">community_messages</td><td className="border border-gray-300 px-3 py-2">Chat messages</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">city_groups</td><td className="border border-gray-300 px-3 py-2">Location-based groups</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">cohort_groups</td><td className="border border-gray-300 px-3 py-2">Cohort-based groups</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">user_presence</td><td className="border border-gray-300 px-3 py-2">Online status tracking</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Roadmap & Journey (10 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_days</td><td className="border border-gray-300 px-3 py-2">Daily schedule items</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_prep_items</td><td className="border border-gray-300 px-3 py-2">Preparation checklist</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_rules</td><td className="border border-gray-300 px-3 py-2">Program rules/guidelines</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_galleries</td><td className="border border-gray-300 px-3 py-2">Photo galleries</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_sidebar_moments</td><td className="border border-gray-300 px-3 py-2">Sidebar carousel items</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_sidebar_stay</td><td className="border border-gray-300 px-3 py-2">Accommodation info</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">roadmap_sidebar_student_work</td><td className="border border-gray-300 px-3 py-2">Student work samples</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">student_films</td><td className="border border-gray-300 px-3 py-2">Student film projects</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">forge_equipment</td><td className="border border-gray-300 px-3 py-2">Equipment inventory</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">nightly_rituals</td><td className="border border-gray-300 px-3 py-2">Evening activity schedule</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Forms & Responses (7 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">ky_forms</td><td className="border border-gray-300 px-3 py-2">Dynamic form definitions</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">ky_form_fields</td><td className="border border-gray-300 px-3 py-2">Form field configurations</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">ky_form_responses</td><td className="border border-gray-300 px-3 py-2">Generic form responses</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">kyf_responses</td><td className="border border-gray-300 px-3 py-2">FORGE form responses</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">kyw_responses</td><td className="border border-gray-300 px-3 py-2">FORGE_WRITING responses</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">kyc_responses</td><td className="border border-gray-300 px-3 py-2">FORGE_CREATORS responses</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">ky_form_field_responses</td><td className="border border-gray-300 px-3 py-2">Individual field responses</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">System & Configuration (4 tables)</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Table</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">notifications</td><td className="border border-gray-300 px-3 py-2">System notifications</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">auto_updates</td><td className="border border-gray-300 px-3 py-2">Automated update entries</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">hero_banners</td><td className="border border-gray-300 px-3 py-2">Homepage banners</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">equipment_categories</td><td className="border border-gray-300 px-3 py-2">Equipment groupings</td></tr>
                </tbody>
              </table>
            </section>

            {/* 5. Authentication & Authorization */}
            <section id="authentication" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">5. Authentication & Authorization</h2>
              
              <h3 className="text-lg font-semibold mb-2">Authentication Flow</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                <pre>{`┌─────────┐     ┌──────────────┐     ┌─────────────┐
│  User   │────▶│  Auth Page   │────▶│  Supabase   │
│         │     │  (Email/PW)  │     │    Auth     │
└─────────┘     └──────────────┘     └─────────────┘
                       │                     │
                       ▼                     ▼
               ┌──────────────┐     ┌─────────────┐
               │   Profile    │◀────│   Session   │
               │    Setup     │     │   Created   │
               └──────────────┘     └─────────────┘
                       │
                       ▼
               ┌──────────────┐
               │  Home Page   │
               │  (Protected) │
               └──────────────┘`}</pre>
              </div>

              <h3 className="text-lg font-semibold mb-2">Role-Based Access Control</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Role</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Access Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">user</td><td className="border border-gray-300 px-3 py-2">Standard app access, own profile/data only</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">moderator</td><td className="border border-gray-300 px-3 py-2">User access + community moderation</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">admin</td><td className="border border-gray-300 px-3 py-2">Full access including admin panel</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Payment Tiers</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Access</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">CONFIRMED_15K</td><td className="border border-gray-300 px-3 py-2">Basic access (deposit paid)</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">BALANCE_PAID</td><td className="border border-gray-300 px-3 py-2">Full access (complete payment)</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Protected Route Implementation</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <pre>{`// ProtectedRoute - Requires authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// ProfileSetupCheck - Ensures profile is complete
const ProfileSetupCheck = ({ children }) => {
  const { profile } = useAuth();
  if (!profile.profile_setup_completed) {
    return <Navigate to="/profile-setup" />;
  }
  return children;
};

// AdminRoute - Requires admin role
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAdminCheck();
  if (!isAdmin) return <Navigate to="/" />;
  return children;
};`}</pre>
              </div>
            </section>

            {/* 6. Core Features */}
            <section id="features" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">6. Core Features</h2>
              
              <h3 className="text-lg font-semibold mb-2">Home Dashboard</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Countdown timer to program start</li>
                <li>Onboarding checklist progress</li>
                <li>Quick access navigation</li>
                <li>Mentor carousel</li>
                <li>Notification center</li>
                <li>Hero banners</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Roadmap System (6 sub-pages)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li><strong>Journey</strong> - Day-by-day program schedule with timeline</li>
                <li><strong>Prep</strong> - Pre-program preparation checklist</li>
                <li><strong>Equipment</strong> - Gear inventory and specifications</li>
                <li><strong>Rules</strong> - Program guidelines and policies</li>
                <li><strong>Gallery</strong> - Photo galleries from past cohorts</li>
                <li><strong>Films</strong> - Student film showcase</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Learn Platform</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Course library with categories</li>
                <li>Video lessons with progress tracking</li>
                <li>Secure video player (prevents downloads)</li>
                <li>Continue watching carousel</li>
                <li>Instructor spotlights</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Real-time chat (Postgres Changes)</li>
                <li>City-based groups</li>
                <li>Cohort groups</li>
                <li>Member directory</li>
                <li>Presence indicators</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Profile & Portfolio</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Profile editing with image cropper</li>
                <li>Work portfolio management</li>
                <li>Public shareable portfolio link</li>
                <li>Achievement badges</li>
                <li>Printable profile view</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Admin Panel (14 sections)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Dashboard - Overview metrics</li>
                <li>Users - Member management</li>
                <li>Editions - Cohort management</li>
                <li>KY Forms - Form builder</li>
                <li>Roadmap - Journey editor</li>
                <li>Roadmap Sidebar - Sidebar content</li>
                <li>Equipment - Gear management</li>
                <li>Nightly Rituals - Evening schedule</li>
                <li>Events - Event management</li>
                <li>Learn - Course management</li>
                <li>Mentors - Instructor profiles</li>
                <li>Alumni Testimonials - Video testimonials</li>
                <li>Community Highlights - Featured content</li>
                <li>Auto Updates - Automated announcements</li>
              </ul>
            </section>

            {/* 7. Edge Functions */}
            <section id="edge-functions" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">7. Edge Functions</h2>
              <p className="mb-4 text-gray-700">Server-side functions running on Deno runtime:</p>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Function</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Auth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">bootstrap-admin</td>
                    <td className="border border-gray-300 px-3 py-2">Creates initial admin user during setup</td>
                    <td className="border border-gray-300 px-3 py-2">Service Role</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">create-user</td>
                    <td className="border border-gray-300 px-3 py-2">Admin endpoint to create new users</td>
                    <td className="border border-gray-300 px-3 py-2">Admin Only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">delete-user</td>
                    <td className="border border-gray-300 px-3 py-2">Deletes user with cascade cleanup</td>
                    <td className="border border-gray-300 px-3 py-2">Admin Only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">bulk-delete-users</td>
                    <td className="border border-gray-300 px-3 py-2">Batch deletion of multiple users</td>
                    <td className="border border-gray-300 px-3 py-2">Admin Only</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">setup-test-data</td>
                    <td className="border border-gray-300 px-3 py-2">Seeds database with test data</td>
                    <td className="border border-gray-300 px-3 py-2">Service Role</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 8. Design System */}
            <section id="design-system" className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">8. UI/UX Design System</h2>
              
              <h3 className="text-lg font-semibold mb-2">Typography</h3>
              <p className="mb-4 text-gray-700">
                Primary font: <strong>OpenSauceOne</strong> (all weights from Light to Black)
              </p>

              <h3 className="text-lg font-semibold mb-2">Color Palette</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Token</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Value (Light)</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">--primary</td><td className="border border-gray-300 px-3 py-2">#FFBC3B (Yellow)</td><td className="border border-gray-300 px-3 py-2">CTAs, highlights</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">--background</td><td className="border border-gray-300 px-3 py-2">#0A0A0A</td><td className="border border-gray-300 px-3 py-2">Page background</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">--foreground</td><td className="border border-gray-300 px-3 py-2">#FFFFFF</td><td className="border border-gray-300 px-3 py-2">Primary text</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">--muted</td><td className="border border-gray-300 px-3 py-2">#1C1C1E</td><td className="border border-gray-300 px-3 py-2">Secondary backgrounds</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">--accent</td><td className="border border-gray-300 px-3 py-2">#FFD700</td><td className="border border-gray-300 px-3 py-2">Accents, badges</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Glass Effects</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li><code>bg-card/50 backdrop-blur-sm</code> - Standard glass card</li>
                <li><code>bg-primary/20</code> - Highlight glass</li>
                <li><code>border-border/50</code> - Subtle borders</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Animation Classes</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><code>animate-shimmer</code> - Loading skeleton effect</li>
                <li><code>animate-bounce-subtle</code> - Gentle bounce</li>
                <li><code>animate-stack-pop-out</code> - Card stack animation</li>
                <li><code>animate-confetti-fall</code> - Celebration effect</li>
              </ul>
            </section>

            {/* 9. Development Guide */}
            <section id="development" className="pb-6">
              <h2 className="text-2xl font-bold mb-4">9. Development Guide</h2>
              
              <h3 className="text-lg font-semibold mb-2">Folder Structure</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                <pre>{`src/
├── assets/          # Static assets (logos, icons)
├── components/
│   ├── admin/       # Admin-specific components
│   ├── community/   # Chat and community features
│   ├── events/      # Event-related components
│   ├── home/        # Homepage components
│   ├── kyform/      # Form components
│   ├── layout/      # App shell (nav, sidebar)
│   ├── learn/       # Learning platform
│   ├── onboarding/  # Onboarding flow
│   ├── profile/     # Profile components
│   ├── roadmap/     # Roadmap features
│   ├── shared/      # Reusable components
│   └── ui/          # shadcn/ui components
├── contexts/        # React Context providers
├── data/            # Static data files
├── hooks/           # Custom React hooks
├── integrations/    # External service clients
├── lib/             # Utility functions
├── pages/           # Route components
│   ├── admin/       # Admin pages
│   └── roadmap/     # Roadmap sub-pages
└── types/           # TypeScript declarations`}</pre>
              </div>

              <h3 className="text-lg font-semibold mb-2">Key Custom Hooks</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Hook</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useAuth</td><td className="border border-gray-300 px-3 py-2">Authentication state and methods</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useAdminCheck</td><td className="border border-gray-300 px-3 py-2">Admin role verification</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useProfileData</td><td className="border border-gray-300 px-3 py-2">Profile data fetching</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useRoadmapData</td><td className="border border-gray-300 px-3 py-2">Roadmap content loading</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useEventRegistration</td><td className="border border-gray-300 px-3 py-2">Event signup handling</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useUserWorks</td><td className="border border-gray-300 px-3 py-2">Portfolio management</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useNightlyRitual</td><td className="border border-gray-300 px-3 py-2">Nightly ritual data</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useOnboardingChecklist</td><td className="border border-gray-300 px-3 py-2">Onboarding progress</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">usePublicPortfolio</td><td className="border border-gray-300 px-3 py-2">Public portfolio fetching</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">useMobile</td><td className="border border-gray-300 px-3 py-2">Responsive breakpoint detection</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
              <table className="w-full mb-4 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Variable</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">VITE_SUPABASE_URL</td><td className="border border-gray-300 px-3 py-2">Supabase project URL</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</td><td className="border border-gray-300 px-3 py-2">Supabase anon key</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2 font-mono">VITE_SUPABASE_PROJECT_ID</td><td className="border border-gray-300 px-3 py-2">Project identifier</td></tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mb-2">Coding Conventions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Use TypeScript strict mode</li>
                <li>Functional components with hooks</li>
                <li>React Query for server state</li>
                <li>Tailwind CSS for styling (semantic tokens)</li>
                <li>shadcn/ui for UI primitives</li>
                <li>Zod for runtime validation</li>
                <li>React Hook Form for forms</li>
              </ul>
            </section>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200 text-gray-500 text-sm">
              <p>The Forge App Documentation</p>
              <p>Generated on {new Date().toLocaleDateString()} | Version 1.0</p>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AdminDocs;
