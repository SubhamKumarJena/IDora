# 🎓 IDora – Smart Campus ID Portal

> **A Comprehensive, Production-Ready Academic Web Application for University Identity Lifecycle Management.**  
> *Engineered for BTech Computer Science & Engineering Academic Demonstrations, Viva Examinations, and Campus Digital Automation.*

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Features & Module Breakdown](#-key-features--module-breakdown)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Technology Stack & Architectural Decisions](#-technology-stack--architectural-decisions)
5. [Database Design & Security Model (RLS)](#-database-design--security-model-rls)
6. [Quick Start & Dual-Mode Execution](#-quick-start--dual-mode-execution)
7. [Comprehensive Viva Examination Q&A (Academic Defense)](#-comprehensive-viva-examination-qa-academic-defense)
8. [Presentation & Demonstration Slide Deck Outline](#-presentation--demonstration-slide-deck-outline)

---

## 🌟 Executive Summary & Problem Statement

### The Problem in Higher Education Operations
In traditional campus ecosystems, issuing and updating student ID cards involves:
* 🚶 **Physical Queuing**: Students must stand in line outside academic counters for replacement and correction slips.
* 📄 **Paper-based Manual Audits**: Requests are recorded in paper registers with high risk of clerical errors, loss, and unverified data.
* ❓ **Opaque Status Tracking**: Students have zero visibility into whether their application is awaiting HOD sign-off, undergoing verification, or ready at the dispatch counter.
* ⏳ **Administrative Bottlenecks**: Desk officers lack a centralized queue, analytics dashboard, or real-time document inspection tooling.

### The IDora Solution
**IDora** modernizes campus identity administration into an end-to-end, role-based digital portal:
1. **Self-Service Student Portal**: Issuance of **New ID Cards**, **Lost ID Replacements**, **Damaged Card Replacements**, and **Information Corrections** (Name, DOB, Blood Group, Contact, Department) with file upload capabilities.
2. **Real-Time 5-Stage Visual Workflow Pipeline**: `Submitted` ➔ `Under Review` ➔ `Approved` ➔ `Ready for Pickup` ➔ `Completed` (with explicit `Rejected` handling).
3. **Downloadable & Printable Acknowledgement Slips**: Official receipts with dynamic barcodes, application metadata, and verification instructions.
4. **Administrative Command Center**: High-level KPI metrics, Recharts visual analytics (Status Donut & Type Volume Charts), multi-criteria filtering, in-place workflow status changers, and instant CSV report exports.
5. **Zero-Configuration Dual-Mode Execution**: Works instantly out-of-the-box in **Demo Mode** (mock credentials, in-memory state tracking) or full production with **Supabase PostgreSQL** database engine and Row-Level Security (RLS).

---

## 🚀 Key Features & Module Breakdown

```
                     ┌────────────────────────────────────────────────────────┐
                     │                 IDORA SMART PORTAL                     │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                   ┌─────────────────────────────┴────────────────────────────┐
                   ▼                                                          ▼
    ┌──────────────────────────────┐                          ┌──────────────────────────────┐
    │     STUDENT SELF-SERVICE     │                          │     ADMIN COMMAND CENTER     │
    ├──────────────────────────────┤                          ├──────────────────────────────┤
    │ • 4 Application Categories   │                          │ • Real-time KPI Analytics    │
    │ • Real-Time 5-Step Pipeline  │                          │ • Donut & Bar Recharts Visual│
    │ • Interactive Receipt / Slip │                          │ • Master Request Data Table  │
    │ • Dynamic Live Search        │                          │ • Document/Photo Inspector   │
    │ • Profile & Emergency Info   │                          │ • PVC Specimen Card Preview  │
    │ • Campus Help & FAQ Center   │                          │ • 1-Click Status Transitions │
    └──────────────────────────────┘                          └──────────────────────────────┘
```

### 1. Student Portal (`/dashboard/*`)
* **Live Action Queue & Stats**: Shows active applications, completed cards, and immediate status alerts.
* **Smart Application Wizard (`/dashboard/new-request`)**: 
  - Dynamic form fields that intelligently adapt based on category (e.g. Lost date & location for Lost IDs, Old vs New values for Corrections).
  - Photo preview and document attachment mock-uploader.
* **Interactive Status Tracker (`/dashboard/track`)**:
  - Live search by Request ID (`IDR-2025-XXXX`) or Name.
  - 5-step visual pipeline with active step glow, checkmarks, and timestamps.
  - Printable official student acknowledgement slip.
* **Historical Archive (`/dashboard/history`)**: Filterable timeline of all past card transactions.
* **Academic Profile Dossier (`/dashboard/profile`)**: Readout of registration number, department, semester, blood group, and emergency contact details.
* **Knowledge & Support Hub (`/dashboard/help`)**: Standard operating procedures, processing timelines, counter operating hours, and fee policies.

### 2. Administrative Suite (`/admin/*`)
* **Executive Analytics (`/admin`)**:
  - 4 KPI Metric Cards (Total Applications, Awaiting Action, In-Print/Pickup, Fulfilled).
  - Status Distribution Donut Chart (`submitted`, `under_review`, `approved`, etc.).
  - Request Type Volume Bar Chart (`new`, `lost`, `damaged`, `correction`).
  - Urgent Immediate Action Queue with 1-click navigation.
* **Master Request Manager (`/admin/requests`)**:
  - Multi-dimensional filtering (Live text search, Status tabs with dynamic counts, Department dropdown, Request type selector).
  - Inline status transition dropdown for high-velocity counter processing.
  - Instant CSV export with automated browser download.
* **Single-Request Inspection Dossier (`/admin/requests/:id`)**:
  - Student academic dossier & contact details.
  - Photo and document evidence inspector.
  - **Live PVC Smart ID Specimen Preview**: Renders a realistic college identity card with QR code, chip badge, and student snapshot.
  - Complete chronological audit log with officer remarks and timestamps.
  - 1-Click decision buttons (Approve, Ready for Collection, Mark Completed, Reject with mandatory reason).

---

## 🏗 System Architecture & Data Flow

```
[ Browser / Client (React 19 + Tailwind v4) ]
       │
       ├── Global ThemeContext (Dark / Light Mode)
       ├── Global AuthContext (Session, User Role, Demo Fallback)
       │
       ▼
[ ProtectedRoute / React Router v7 ]
       │
       ├── Public Routes   ➜ Landing Page (`/`), Login (`/login`), Register (`/register`)
       ├── Student Routes  ➜ StudentLayout ➜ Dashboard, New Request, Track, History, Profile
       └── Admin Routes    ➜ AdminLayout   ➜ Overview, All Requests, Request Inspection
               │
               ▼
   [ lib/supabase.js (Abstraction Layer) ]
               │
      ┌────────┴───────────────────────────┐
      ▼ (isDemoMode: true)                 ▼ (isDemoMode: false)
[ Local Memory & localStorage ]      [ Supabase Cloud (PostgreSQL 15) ]
  • DEMO_STUDENT / DEMO_ADMIN          • auth.users (Authentication)
  • DEMO_REQUESTS Mock Dataset         • public.profiles (RLS Enabled)
  • Instant Reactive State             • public.id_requests (RLS Enabled)
                                       • public.status_history (Audit Trigger)
```

---

## 💻 Technology Stack & Architectural Decisions

| Layer | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Runtime & Build** | **Node.js + Vite 8** | Sub-millisecond Hot Module Replacement (HMR) and ultra-fast ES module bundling for seamless developer experience. |
| **Frontend Framework** | **React 19** | Component-driven declarative UI architecture, modular state management, custom hooks, and high-performance DOM reconciliation. |
| **Routing** | **React Router v7** | Client-side Single Page Application (SPA) navigation, nested layout routing via `<Outlet />`, dynamic URL params (`:id`), and role-based route protection guards. |
| **Styling & Design System**| **Tailwind CSS v4 & CSS Variables** | Utility-first responsive design, zero runtime CSS overhead, accessible typography, and smooth CSS token theme transitions (Dark/Light). |
| **Visual Analytics** | **Recharts** | Declarative SVG charting library with responsive container wrappers for real-time administrative analytics. |
| **Icons & Notifications** | **Lucide React & React Hot Toast** | Lightweight scalable vector icons and non-blocking, accessible visual feedback. |
| **Backend & DB** | **Supabase (PostgreSQL 15)** | Relational database engine, Row-Level Security (RLS), auto-increment sequences, and PL/pgSQL audit triggers. |

---

## 🗄 Database Design & Security Model (RLS)

### Entity Relationship Model

```
       ┌───────────────────────────┐
       │     auth.users (Auth)     │
       └─────────────┬─────────────┘
                     │ 1:1
                     ▼
       ┌───────────────────────────┐
       │      public.profiles      │
       ├───────────────────────────┤
       │ id (UUID, PK, FK)         │
       │ role (student | admin)    │
       │ full_name, reg_number     │
       │ department, semester      │
       │ email, phone, blood_group │
       └─────────────┬─────────────┘
                     │ 1:N
                     ▼
       ┌───────────────────────────┐
       │    public.id_requests     │
       ├───────────────────────────┤
       │ id (UUID, PK)             │
       │ request_number (Unique)   │◀── Auto-generated by PL/pgSQL Trigger ('IDR-YYYY-XXXX')
       │ student_id (UUID, FK)     │
       │ request_type (Enum)       │
       │ status (Enum)             │
       │ description, photo_url    │
       │ admin_remarks             │
       │ reviewed_by (UUID, FK)    │
       └─────────────┬─────────────┘
                     │ 1:N
                     ▼
       ┌───────────────────────────┐
       │   public.status_history   │
       ├───────────────────────────┤
       │ id (UUID, PK)             │
       │ request_id (UUID, FK)     │
       │ status (Enum)             │
       │ remarks, created_by       │
       │ created_at (Timestamp)    │
       └───────────────────────────┘
```

### PostgreSQL Schema Highlights (`supabase/schema.sql`)
1. **Automated Request Number Generator**:
   ```sql
   CREATE SEQUENCE IF NOT EXISTS request_number_seq START WITH 1001;

   CREATE OR REPLACE FUNCTION generate_request_number()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
       NEW.request_number := 'IDR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('request_number_seq')::TEXT, 4, '0');
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```
2. **Automated Audit Logging Trigger**:
   ```sql
   CREATE OR REPLACE FUNCTION log_status_change()
   RETURNS TRIGGER AS $$
   BEGIN
     IF (TG_OP = 'INSERT') THEN
       INSERT INTO public.status_history (request_id, status, remarks, created_by)
       VALUES (NEW.id, NEW.status, 'Application submitted by student', NEW.student_id);
     ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
       INSERT INTO public.status_history (request_id, status, remarks, created_by)
       VALUES (NEW.id, NEW.status, COALESCE(NEW.admin_remarks, 'Status updated'), NEW.reviewed_by);
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```
3. **Row-Level Security (RLS) Policies**:
   - `id_requests`: Students can only read and create their own records (`student_id = auth.uid()`).
   - `id_requests`: Only users with `role = 'admin'` in `profiles` can update status and remarks.

---

## ⚡ Quick Start & Dual-Mode Execution

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** or **yarn**

### 1. Installation & Local Launch
```bash
# 1. Clone or navigate to the project directory
cd IDora

# 2. Install all dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The application will launch at `http://localhost:5173`.

### 2. Zero-Configuration Demo Mode (Default)
If no Supabase environment variables are provided, **IDora activates Demo Mode automatically**:
* **Student Demo Account**:
  - **Email**: `student@demo.com`
  - **Password**: `demo123` (or click **"Use Student Demo"** on `/login`)
* **Admin Demo Account**:
  - **Email**: `admin@demo.com`
  - **Password**: `admin123` (or click **"Use Admin Demo"** on `/login`)

### 3. Production Supabase Configuration (Optional)
To connect to your cloud PostgreSQL database:
1. Create a project on [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase/schema.sql`. Execute the script.
3. Rename `.env.example` to `.env.local` and fill in your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
   ```
4. Restart the development server (`npm run dev`). IDora will automatically switch to Live Supabase Mode!

---

## 🎓 Comprehensive Viva Examination Q&A (Academic Defense)

This section prepares students for standard, intermediate, and advanced BTech CSE Viva questions.

### Section 1: Core React & Frontend Concepts

#### Q1: What is the Virtual DOM and how does React optimize UI rendering in IDora?
> **Answer**: The Virtual DOM (VDOM) is an in-memory lightweight JavaScript representation of the real DOM tree. When state changes in IDora (such as when a student types in the search bar or submits a form), React creates a new Virtual DOM tree, calculates the minimal differences between the new tree and the previous snapshot using its **reconciliation (diffing) algorithm**, and updates only the altered nodes in the real browser DOM. This prevents expensive full-page DOM repaints and ensures fluid 60fps performance.

#### Q2: What is the difference between State and Props in React? Give examples from IDora.
> **Answer**:
> * **State**: Mutable data managed internally within a component that changes over time and triggers re-renders when updated via setter functions.  
>   * *Example*: `const [searchQuery, setSearchQuery] = useState("")` in `TrackRequests.jsx` holds the user's active filter input.
> * **Props (Properties)**: Immutable read-only data passed from a parent component down to a child component.  
>   * *Example*: `<StatusBadge status={req.status} />` passes the `status` string property down to `StatusBadge.jsx` for rendering.

#### Q3: Why is React Context API used instead of Prop Drilling for Authentication and Themes?
> **Answer**: "Prop drilling" refers to the cumbersome process of passing props down through multiple layers of intermediate components that do not need the data themselves. In IDora, authentication state (`user`, `role`, `isDemoMode`) and theme state (`isDark`, `toggleTheme`) are needed by almost every component (Navbar, Sidebar, Dashboard, ProtectedRoute). By utilizing `AuthContext` and `ThemeContext`, components anywhere in the tree can directly subscribe to global state via `useAuth()` and `useTheme()` using the `useContext` hook.

#### Q4: How does `ProtectedRoute.jsx` enforce role-based access control (RBAC)?
> **Answer**: `ProtectedRoute` is a higher-order component that inspects `user` and `role` from `AuthContext`:
> 1. If `loading` is true, it displays a full-screen loading spinner.
> 2. If no authenticated `user` is detected, it redirects to `/login` using React Router's `<Navigate to="/login" replace />`.
> 3. If a `requiredRole` is specified (e.g. `admin`) and the user's role is `student`, it redirects to `/dashboard` with an unauthorized alert.
> 4. If all checks pass, it renders the requested child routes via `<Outlet />` or `children`.

---

### Section 2: Routing, Forms & Asynchronous Data

#### Q5: How does React Router v7 manage Single Page Application (SPA) navigation?
> **Answer**: In an SPA, clicking a link does not request a new HTML document from a remote web server. Instead, `BrowserRouter` listens to the browser's HTML5 History API (`pushState`, `replaceState`, and `popstate` events). When a user clicks `<NavLink to="/dashboard/track">`, React Router intercepts the URL change, unmounts the previous page component, and mounts the matching route component dynamically within the DOM, providing instantaneous page transitions.

#### Q6: What is the difference between Controlled and Uncontrolled Components in React forms?
> **Answer**:
> * **Controlled Components**: The input's value is bound directly to React state, and changes are handled via `onChange` handlers (e.g. `<input value={formData.department} onChange={handleChange} />`). React is the single source of truth. IDora uses controlled components across all application forms for immediate validation and reactive UI updates.
> * **Uncontrolled Components**: The DOM manages the form state internally, and values are queried on demand using React Refs (`useRef()`).

#### Q7: What are `useMemo` and `useEffect` used for in `AdminDashboard.jsx` and `AdminRequests.jsx`?
> **Answer**:
> * `useEffect`: Runs side-effects (such as asynchronous API calls or subscribing to events) after component rendering. In `AdminDashboard.jsx`, it fetches the initial request queue on component mount (`loadData()`).
> * `useMemo`: Memoizes (caches) the result of an expensive calculation to avoid recalculating it on every re-render unless its dependencies change. In `AdminRequests.jsx`, `filteredRequests` is wrapped in `useMemo` so that filtering hundreds of student records by search query, department, and status only re-runs when `requests`, `statusFilter`, `deptFilter`, or `searchQuery` actually changes.

---

### Section 3: Database, PostgreSQL & Backend Architecture

#### Q8: What is Row-Level Security (RLS) in PostgreSQL and why is it superior to application-only security?
> **Answer**: Traditional web applications rely solely on backend API logic (`if user.id == req.student_id`) to filter records. If an API endpoint is misconfigured or bypassed, data leaks occur. **Row-Level Security (RLS)** embeds security policies directly inside the database engine. In PostgreSQL, when a query runs:
> ```sql
> CREATE POLICY "Students can view own requests"
>   ON public.id_requests FOR SELECT
>   USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
> ```
> PostgreSQL evaluates `auth.uid()` at the database kernel level for every single row. Even if a malicious user inspects network traffic and crafts a raw query for another student's request ID, PostgreSQL returns zero rows.

#### Q9: What is a Database Trigger and how does IDora use triggers for audit logging?
> **Answer**: A trigger is a stored procedure in PostgreSQL that executes automatically whenever a specified event (such as `INSERT`, `UPDATE`, or `DELETE`) occurs on a table. In IDora, the trigger `trigger_log_status_change` fires whenever an administrative officer updates an ID request. It automatically extracts `NEW.status`, `NEW.admin_remarks`, and `NEW.reviewed_by` and writes an immutable row into `status_history`. This guarantees a tamper-proof audit trail for university compliance.

#### Q10: How does IDora ensure unique, readable request identification numbers?
> **Answer**: Rather than exposing raw UUIDs (e.g. `e3b0c442-98fc-1c14-9afb-4c8996fb9242`) to students at physical counters, IDora uses a PostgreSQL Sequence (`request_number_seq`) combined with a `BEFORE INSERT` trigger. The function formats the ID as:
> `IDR-` + Current Year (`YYYY`) + `-` + 4-digit zero-padded sequence number (e.g. `IDR-2025-1001`).

---

## 📊 Presentation & Demonstration Slide Deck Outline

Use this 8-slide structure for your college project review / PowerPoint presentation:

* **Slide 1: Title & Team Information**
  - Project Title: *IDora – Smart Campus ID Portal*
  - Subtitle: *Modern University Identity Lifecycle Management System*
  - Team Members: Name, Registration Number, Department, Semester, Academic Guide.
* **Slide 2: Problem Definition & Industry Motivation**
  - Limitations of physical queues and paper registers in colleges.
  - Lack of real-time application tracking for students.
  - Administrative overhead in handling lost, damaged, and correction requests.
* **Slide 3: Proposed Solution & Core Innovation**
  - Centralized digital self-service portal for 4 request categories.
  - 5-stage transparent visual workflow pipeline.
  - Real-time administrative analytics with in-place desk controls.
  - Dual-mode architecture (Instant Demo + Cloud PostgreSQL).
* **Slide 4: Technology Architecture & Stack**
  - Frontend: React 19, Vite 8, React Router v7, Tailwind CSS v4, Lucide Icons.
  - Data Visualization: Recharts (Donut & Bar Analytics).
  - Backend & Security: Supabase PostgreSQL 15, Row-Level Security (RLS), PL/pgSQL Triggers.
* **Slide 5: Database Schema & Entity Relationships**
  - Explanation of `profiles`, `id_requests`, and `status_history`.
  - Database triggers for sequence generation (`IDR-2025-XXXX`) and automated audit logging.
* **Slide 6: Live Application Demonstration (Flows)**
  - *Student Flow*: Log in ➔ Apply for Lost ID ➔ Live Search & Pipeline Tracker ➔ View/Print Official Receipt Slip.
  - *Admin Flow*: Log in ➔ View KPI Dashboard & Analytics ➔ Search & Filter ➔ Inspect PVC Specimen ➔ Approve & Transition Status ➔ Export CSV.
* **Slide 7: Security, Reliability & RLS Policies**
  - Role-based route guards (`ProtectedRoute`).
  - Kernel-level database row authorization via Supabase RLS.
  - Audit trail integrity.
* **Slide 8: Future Enhancements & Conclusion**
  - RFID / NFC physical encoding counter integration.
  - Automated WhatsApp/SMS dispatch notifications.
  - AI facial recognition photo quality verification.
  - Thank You & Open for Q&A.

---

## 👥 Contributors & Academic Acknowledgements

Developed as a standard BTech Computer Science & Engineering Academic Project.  
Engineered with modular, educational, clean-code standards and complete documentation.

*Licensed under the MIT License.*
