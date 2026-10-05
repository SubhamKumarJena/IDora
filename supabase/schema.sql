-- ============================================================
-- FILE: supabase/schema.sql
-- PROJECT: IDora – Smart Campus ID Portal
-- DATABASE: PostgreSQL (Supabase Engine)
--
-- DESCRIPTION:
-- Complete production schema including Tables, Relations,
-- Row-Level Security (RLS) Policies, Stored Procedures,
-- Audit Log Triggers, Sequence-based Request Number Generators,
-- and Initial Demonstration Seed Data.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE request_type_enum AS ENUM (
  'new',
  'lost',
  'damaged',
  'correction'
);

CREATE TYPE request_status_enum AS ENUM (
  'submitted',
  'under_review',
  'approved',
  'ready_for_collection',
  'completed',
  'rejected'
);

CREATE TYPE user_role_enum AS ENUM (
  'student',
  'admin'
);

-- ============================================================
-- 3. TABLES DEFINITION
-- ============================================================

-- ── TABLE: PROFILES (Extends Supabase auth.users) ─────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL DEFAULT 'student',
  full_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) UNIQUE,
  department VARCHAR(150),
  semester INT CHECK (semester BETWEEN 1 AND 8),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  blood_group VARCHAR(10),
  emergency_contact VARCHAR(20),
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLE: ID_REQUESTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.id_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type request_type_enum NOT NULL,
  status request_status_enum NOT NULL DEFAULT 'submitted',

  -- Student Snapshot Data
  student_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) NOT NULL,
  department VARCHAR(150) NOT NULL,
  semester INT,

  -- Request Body & Reason
  description TEXT,
  photo_url TEXT,
  document_url TEXT,

  -- Specific fields for "correction" requests
  correction_field VARCHAR(100),
  existing_information TEXT,
  corrected_information TEXT,

  -- Administrative Decision & Review
  admin_remarks TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLE: STATUS_HISTORY (Audit Log) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.id_requests(id) ON DELETE CASCADE,
  status request_status_enum NOT NULL,
  remarks TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. SEQUENCES & AUTO-GENERATED REQUEST NUMBERS
-- ============================================================

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

CREATE TRIGGER trigger_set_request_number
BEFORE INSERT ON public.id_requests
FOR EACH ROW
EXECUTE FUNCTION generate_request_number();

-- ============================================================
-- 5. AUDIT LOGGING TRIGGER (Auto status_history on update)
-- ============================================================

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into status_history whenever status changes or on initial insert
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

CREATE TRIGGER trigger_log_status_change
AFTER INSERT OR UPDATE ON public.id_requests
FOR EACH ROW
EXECUTE FUNCTION log_status_change();

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- ── PROFILES POLICIES ─────────────────────────────────────────
-- 1. Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Users can update their own contact details
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── ID_REQUESTS POLICIES ──────────────────────────────────────
-- 1. Students can view only their own requests; Admins can view all
CREATE POLICY "Students can view own requests"
  ON public.id_requests FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Students can insert requests for themselves
CREATE POLICY "Students can create requests"
  ON public.id_requests FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- 3. Only Admins can update status and remarks
CREATE POLICY "Admins can update requests"
  ON public.id_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── STATUS_HISTORY POLICIES ───────────────────────────────────
-- 1. Students can view history for their requests; Admins can view all
CREATE POLICY "Users can view relevant status history"
  ON public.status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.id_requests
      WHERE id_requests.id = status_history.request_id
      AND (id_requests.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================================
-- 7. DEMONSTRATION SEED DATA (For local or manual testing)
-- ============================================================

-- Sample Profile Entries (Mock auth user UUIDs for demonstration)
INSERT INTO public.profiles (id, role, full_name, registration_number, department, semester, email, phone, blood_group, emergency_contact, address)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'student', 'Arjun Kumar Sharma', '21CS001', 'Computer Science and Engineering', 6, 'student@demo.com', '9876543210', 'O+', '9876543211', 'Room 304, Boys Hostel B, Campus North'),
  ('22222222-2222-2222-2222-222222222222', 'admin', 'Campus ID Administrator', 'ADM-001', 'Academic Affairs Office', NULL, 'admin@demo.com', '9876543299', 'A+', '9876543200', 'Administrative Block, Ground Floor, Counter 3')
ON CONFLICT (id) DO NOTHING;

-- Sample ID Requests
INSERT INTO public.id_requests (id, request_number, student_id, request_type, status, student_name, registration_number, department, semester, description, submitted_at)
VALUES
  ('33333333-3333-3333-3333-333333333331', 'IDR-2025-001', '11111111-1111-1111-1111-111111111111', 'new', 'ready_for_collection', 'Arjun Kumar Sharma', '21CS001', 'Computer Science and Engineering', 6, 'First year regular student ID card issuance.', NOW() - INTERVAL '3 days'),
  ('33333333-3333-3333-3333-333333333332', 'IDR-2025-002', '11111111-1111-1111-1111-111111111111', 'lost', 'submitted', 'Arjun Kumar Sharma', '21CS001', 'Computer Science and Engineering', 6, 'ID card misplaced near Central Library reading hall.', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;
