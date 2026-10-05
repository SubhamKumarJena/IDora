// ============================================================
// FILE: src/lib/demoData.js
// PURPOSE: Provides sample/fake data for Demo Mode.
//
// WHAT IS DEMO MODE?
// When Supabase credentials are not configured (no .env file),
// the application runs in "Demo Mode". In this mode:
// - All data shown is FAKE sample data (not from a real database)
// - Login works with predefined demo credentials
// - Submitting forms shows success messages but data is NOT saved
// - This allows the project to be previewed without backend setup
//
// DEMO CREDENTIALS:
// Student Login:  student@demo.com / demo123
// Admin Login:    admin@demo.com   / admin123
// ============================================================

// ============================================================
// DEMO USER ACCOUNTS
// These simulate what would normally come from Supabase Auth.
// ============================================================
export const DEMO_USERS = {
  // Student demo account
  student: {
    id: "demo-student-001",
    email: "student@demo.com",
    password: "demo123",
    role: "student",
  },

  // Admin demo account
  admin: {
    id: "demo-admin-001",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
  },
};

// ============================================================
// DEMO STUDENT PROFILE
// This is the student's profile data (stored in the "students" table).
// ============================================================
export const DEMO_STUDENT_PROFILE = {
  id: "profile-student-001",
  auth_user_id: "demo-student-001",
  full_name: "Arjun Sharma",
  registration_number: "21CS001",
  email: "student@demo.com",
  department: "Computer Science & Engineering",
  semester: "3",
  phone: "9876543210",
  created_at: "2024-07-15T10:30:00Z",
};

// ============================================================
// DEMO REQUESTS
// Sample ID card requests with different statuses for demonstration.
// ============================================================
export const DEMO_REQUESTS = [
  {
    id: "req-001",
    request_number: "IDR-2024-001",
    student_id: "profile-student-001",
    request_type: "new",
    description: "First-time ID card application for new admission.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "completed",
    admin_remarks: "ID card is ready. Please collect from the administrative office between 10 AM - 4 PM.",
    submitted_at: "2024-08-01T09:00:00Z",
    updated_at: "2024-08-10T14:30:00Z",
    // Joined student data (for admin view)
    students: {
      full_name: "Arjun Sharma",
      registration_number: "21CS001",
      department: "Computer Science & Engineering",
      email: "student@demo.com",
      phone: "9876543210",
    },
  },
  {
    id: "req-002",
    request_number: "IDR-2024-002",
    student_id: "profile-student-001",
    request_type: "lost",
    description: "Lost my ID card during college fest. Need a replacement urgently.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "approved",
    admin_remarks: "Request approved. Your replacement ID is being prepared.",
    submitted_at: "2024-09-05T11:15:00Z",
    updated_at: "2024-09-07T16:00:00Z",
    students: {
      full_name: "Arjun Sharma",
      registration_number: "21CS001",
      department: "Computer Science & Engineering",
      email: "student@demo.com",
      phone: "9876543210",
    },
  },
  {
    id: "req-003",
    request_number: "IDR-2024-003",
    student_id: "profile-student-001",
    request_type: "correction",
    description: "Name is misspelled on current ID card.",
    correction_field: "Full Name",
    existing_information: "Arjun Sharma" ,
    corrected_information: "Arjun Kumar Sharma",
    document_url: null,
    photo_url: null,
    status: "under_review",
    admin_remarks: "Verifying documents. Will update shortly.",
    submitted_at: "2024-09-20T10:00:00Z",
    updated_at: "2024-09-21T09:30:00Z",
    students: {
      full_name: "Arjun Sharma",
      registration_number: "21CS001",
      department: "Computer Science & Engineering",
      email: "student@demo.com",
      phone: "9876543210",
    },
  },
  {
    id: "req-004",
    request_number: "IDR-2024-004",
    student_id: "profile-student-001",
    request_type: "damaged",
    description: "ID card got wet and is no longer readable/scannable.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "submitted",
    admin_remarks: "",
    submitted_at: "2024-09-28T14:45:00Z",
    updated_at: "2024-09-28T14:45:00Z",
    students: {
      full_name: "Arjun Sharma",
      registration_number: "21CS001",
      department: "Computer Science & Engineering",
      email: "student@demo.com",
      phone: "9876543210",
    },
  },
  // Additional requests from other students (visible only in admin view)
  {
    id: "req-005",
    request_number: "IDR-2024-005",
    student_id: "profile-student-002",
    request_type: "new",
    description: "New admission ID card request.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "approved",
    admin_remarks: "Approved. ID card being printed.",
    submitted_at: "2024-09-10T08:30:00Z",
    updated_at: "2024-09-12T11:00:00Z",
    students: {
      full_name: "Priya Patel",
      registration_number: "21EC045",
      department: "Electronics & Communication Engineering",
      email: "priya.patel@college.edu",
      phone: "9123456789",
    },
  },
  {
    id: "req-006",
    request_number: "IDR-2024-006",
    student_id: "profile-student-003",
    request_type: "lost",
    description: "ID card lost during travel.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "rejected",
    admin_remarks: "Please submit FIR copy for lost card replacement. Resubmit after obtaining FIR.",
    submitted_at: "2024-09-15T13:00:00Z",
    updated_at: "2024-09-16T10:00:00Z",
    students: {
      full_name: "Rahul Mehta",
      registration_number: "21ME023",
      department: "Mechanical Engineering",
      email: "rahul.mehta@college.edu",
      phone: "9234567890",
    },
  },
  {
    id: "req-007",
    request_number: "IDR-2024-007",
    student_id: "profile-student-004",
    request_type: "correction",
    description: "Wrong date of birth on ID.",
    correction_field: "Date of Birth",
    existing_information: "15/08/2003",
    corrected_information: "15/08/2004",
    document_url: null,
    photo_url: null,
    status: "submitted",
    admin_remarks: "",
    submitted_at: "2024-09-25T16:00:00Z",
    updated_at: "2024-09-25T16:00:00Z",
    students: {
      full_name: "Sneha Reddy",
      registration_number: "21CS067",
      department: "Computer Science & Engineering",
      email: "sneha.reddy@college.edu",
      phone: "9345678901",
    },
  },
  {
    id: "req-008",
    request_number: "IDR-2024-008",
    student_id: "profile-student-005",
    request_type: "damaged",
    description: "Card broken into two pieces.",
    correction_field: null,
    existing_information: null,
    corrected_information: null,
    document_url: null,
    photo_url: null,
    status: "ready",
    admin_remarks: "Replacement card is ready for collection at the admin office.",
    submitted_at: "2024-09-18T10:00:00Z",
    updated_at: "2024-09-22T14:00:00Z",
    students: {
      full_name: "Vikram Singh",
      registration_number: "21CE034",
      department: "Civil Engineering",
      email: "vikram.singh@college.edu",
      phone: "9456789012",
    },
  },
];

// ============================================================
// DEMO STATUS HISTORY
// Shows the timeline of status changes for a request.
// ============================================================
export const DEMO_STATUS_HISTORY = {
  "req-001": [
    {
      id: "hist-001-1",
      request_id: "req-001",
      previous_status: null,
      new_status: "submitted",
      remarks: "Request submitted by student.",
      updated_by: "student",
      created_at: "2024-08-01T09:00:00Z",
    },
    {
      id: "hist-001-2",
      request_id: "req-001",
      previous_status: "submitted",
      new_status: "under_review",
      remarks: "Request received. Verifying student details.",
      updated_by: "admin",
      created_at: "2024-08-02T10:00:00Z",
    },
    {
      id: "hist-001-3",
      request_id: "req-001",
      previous_status: "under_review",
      new_status: "approved",
      remarks: "All details verified. ID card approved for printing.",
      updated_by: "admin",
      created_at: "2024-08-05T14:00:00Z",
    },
    {
      id: "hist-001-4",
      request_id: "req-001",
      previous_status: "approved",
      new_status: "completed",
      remarks: "ID card is ready. Please collect from administrative office.",
      updated_by: "admin",
      created_at: "2024-08-10T14:30:00Z",
    },
  ],
  "req-002": [
    {
      id: "hist-002-1",
      request_id: "req-002",
      previous_status: null,
      new_status: "submitted",
      remarks: "Request submitted by student.",
      updated_by: "student",
      created_at: "2024-09-05T11:15:00Z",
    },
    {
      id: "hist-002-2",
      request_id: "req-002",
      previous_status: "submitted",
      new_status: "under_review",
      remarks: "Verifying lost card report.",
      updated_by: "admin",
      created_at: "2024-09-06T09:00:00Z",
    },
    {
      id: "hist-002-3",
      request_id: "req-002",
      previous_status: "under_review",
      new_status: "approved",
      remarks: "Request approved. Your replacement ID is being prepared.",
      updated_by: "admin",
      created_at: "2024-09-07T16:00:00Z",
    },
  ],
};

// ============================================================
// DEMO STATISTICS
// Summary numbers shown on dashboards.
// ============================================================
export function getDemoStudentStats() {
  // Calculate stats from the demo requests that belong to our demo student
  const studentRequests = DEMO_REQUESTS.filter(
    (r) => r.student_id === "profile-student-001"
  );

  return {
    total: studentRequests.length,
    pending: studentRequests.filter((r) => r.status === "submitted").length,
    under_review: studentRequests.filter((r) => r.status === "under_review").length,
    approved: studentRequests.filter((r) => r.status === "approved").length,
    completed: studentRequests.filter((r) => r.status === "completed").length,
    rejected: studentRequests.filter((r) => r.status === "rejected").length,
  };
}

// Calculate admin dashboard statistics from all demo requests
export function getDemoAdminStats() {
  return {
    total: DEMO_REQUESTS.length,
    submitted: DEMO_REQUESTS.filter((r) => r.status === "submitted").length,
    under_review: DEMO_REQUESTS.filter((r) => r.status === "under_review").length,
    approved: DEMO_REQUESTS.filter((r) => r.status === "approved").length,
    rejected: DEMO_REQUESTS.filter((r) => r.status === "rejected").length,
    ready: DEMO_REQUESTS.filter((r) => r.status === "ready").length,
    completed: DEMO_REQUESTS.filter((r) => r.status === "completed").length,
  };
}

// ============================================================
// REQUEST TYPE LABELS
// Human-readable names for each request type code.
// ============================================================
export const REQUEST_TYPE_LABELS = {
  new:       "New ID Card",
  lost:      "Lost ID Replacement",
  damaged:   "Damaged ID Replacement",
  correction: "Information Correction",
};

// ============================================================
// STATUS LABELS AND COLORS
// Used consistently across the entire application.
// ============================================================
export const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    badgeClass: "badge-submitted",
    color: "#1d4ed8",
    step: 1,
  },
  under_review: {
    label: "Under Review",
    badgeClass: "badge-under-review",
    color: "#d97706",
    step: 2,
  },
  approved: {
    label: "Approved",
    badgeClass: "badge-approved",
    color: "#059669",
    step: 3,
  },
  rejected: {
    label: "Rejected",
    badgeClass: "badge-rejected",
    color: "#dc2626",
    step: -1, // -1 means rejected (special case)
  },
  ready: {
    label: "Ready for Collection",
    badgeClass: "badge-ready",
    color: "#7c3aed",
    step: 4,
  },
  completed: {
    label: "Completed",
    badgeClass: "badge-completed",
    color: "#059669",
    step: 5,
  },
};

// ============================================================
// DEPARTMENTS LIST
// Used in registration and request forms.
// ============================================================
export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Industrial Engineering",
];

// ============================================================
// SEMESTERS LIST
// Used in registration and request forms.
// ============================================================
export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

// ============================================================
// GENERATE UNIQUE REQUEST NUMBER
// Creates a unique ID like "IDR-2024-009" for each new request.
// ============================================================
export function generateRequestNumber() {
  // Get the current year (e.g., 2024)
  const year = new Date().getFullYear();

  // Generate a random 3-digit number for uniqueness
  const random = Math.floor(Math.random() * 900) + 100;

  return `IDR-${year}-${random}`;
}

// ============================================================
// FORMAT DATE HELPER
// Converts ISO date string to a readable format like "Jan 15, 2024"
// ============================================================
export function formatDate(isoString) {
  if (!isoString) return "N/A";

  return new Date(isoString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format date with time: "Jan 15, 2024, 10:30 AM"
export function formatDateTime(isoString) {
  if (!isoString) return "N/A";

  return new Date(isoString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
