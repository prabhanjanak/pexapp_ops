export type FiveSRole = 
  | 'auditor' 
  | 'incharge' 
  | 'zonal' 
  | 'unithead' 
  | 'superadmin' 
  | 'president';

export interface FiveSUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: FiveSRole;
  roleLabel: string;
  unit: string; // e.g. 'CBE', 'Bangalore', or 'All 14 Units'
  zone?: string; // e.g. 'Zone 1'
  department?: string; // e.g. 'Doctor consultation rooms'
  allowedUnits?: string[]; // for auditor or admins
  allowedZones?: string[];
  allowedDepartments?: string[];
  designation: string;
  phone?: string;
  avatarInitials: string;
}

export interface FiveSCheckpoint {
  id: string; // 'q1' to 'q36'
  slNo: number;
  section: '1S – Sort' | '2S – Set in Order' | '3S – Shine' | '4S – Standardize' | '5S – Sustain';
  area: string;
  point: string;
  evidence: string;
}

export interface FiveSAudit {
  id: string;
  auditNumber: string; // e.g. 'AUD-2026-001'
  unit: string;
  zone: string;
  department: string;
  auditorId: string;
  auditorName: string;
  auditorDesignation: string;
  auditDate: string; // YYYY-MM-DD
  month: string; // 'Jan', 'Feb', etc.
  year: string; // '2026'
  scores: Record<string, number>; // checkpointId -> 0, 1, 2, 3
  comments: Record<string, string>; // checkpointId -> comment
  beforePhotos: Record<string, string>; // checkpointId -> photoUrl
  totalScore: number;
  maxScore: number;
  compliancePercent: number;
  status: 'Draft' | 'Submitted';
  submittedAt?: string;
}

export interface FiveSNonConformity {
  id: string; // 'NC-001'
  auditId?: string;
  unit: string;
  zone: string;
  department: string;
  checkpointId: string;
  checkpointNumber: number;
  section: string;
  area: string;
  checkpointText: string;
  score: number; // 0 (Critical) or 1 (Major)
  auditorComment: string;
  beforePhoto?: string;
  afterPhoto?: string;
  correctiveAction?: string;
  status: 'Pending' | 'In Progress' | 'Submitted for Verification' | 'Closed';
  raisedDate: string;
  closedDate?: string;
  daysToClose?: number;
  targetDays?: number;
  assignedInCharge?: string;
  followUpNotes?: {
    id: string;
    author: string;
    role: string;
    date: string;
    text: string;
  }[];
}

export interface FiveSUnitConfig {
  code: string;
  name: string;
  city: string;
  state: string;
  establishedYear: number;
  bedCapacity: number;
  unitHeadName: string;
  unitHeadEmail: string;
  zones: Record<string, string[]>; // Zone Name -> Array of Department Names
}

export type FiveSReportType = 
  | 'summary'
  | 'question'
  | 'nc'
  | 'change'
  | 'coverage'
  | 'weakest'
  | 'ranking'
  | 'heatmap'
  | 'auditors'
  | 'comparison';
