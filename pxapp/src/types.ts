export type BottleneckStatus = 
  | 'Acknowledge' 
  | 'In progress' 
  | 'Completed';

export const STATUS_STAGES: BottleneckStatus[] = [
  'Acknowledge',
  'In progress',
  'Completed'
];

export const STATUS_PERCENT_MAP: Record<BottleneckStatus, number> = {
  'Acknowledge': 30,
  'In progress': 70,
  'Completed': 100
};

export type BottleneckCategory = 
  | 'OPD Wait Time'
  | 'Private Room Capacity'
  | 'Real-time Patient Tracking'
  | 'Dilation & Buzzer Alert System'
  | 'Lab Turnaround'
  | 'Surgical Redo Audits'
  | 'Registration Delays'
  | 'Counselling Wait Time'
  | 'Discharge Process'
  | 'Pharmacy Counter Delays'
  | 'Billing & Insurance Clearance'
  | 'Optometry & Triage Queue'
  | 'Pre-op Holding Area Flow'
  | 'Diagnostics Scheduling'
  | 'Post-op Care Briefing';

export interface Bottleneck {
  id: string;
  unitId?: string;
  title: string;
  category: BottleneckCategory;
  status: BottleneckStatus;
  percentComplete: number; // 0 to 100
  owner: string;
  lastUpdated: string; // ISO date string or formatted date
  impactLevel?: 'High' | 'Medium' | 'Low';
  targetDate?: string;
  notes?: string;
  remarks?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}

export interface HospitalUnit {
  id: string;
  name: string;
  city: string;
  state: string;
  bottlenecks: Bottleneck[];
  isAssessed: boolean;
  establishedYear?: number;
  bedCapacity?: number;
  contactHead?: string;
}

export type UserRole = 'Unit Head' | 'Operations Team' | 'Super Admin' | 'Super Admin (View Only)';

export interface User {
  id: string;
  name: string;
  email: string;
  empId?: string;
  role: UserRole;
  unitId?: string; // only for Unit Head
  unitName?: string;
  avatarInitials: string;
  designation?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AuditLog {
  id: number;
  unitId?: string;
  unitName?: string;
  bottleneckId?: string;
  bottleneckTitle?: string;
  action: string;
  details: any;
  userRole: string;
  createdAt: string;
}

export interface DbHealthStatus {
  status: 'healthy' | 'error' | 'connecting';
  database: string;
  latencyMs?: number;
  unitsCount?: number;
  bottlenecksCount?: number;
  auditLogsCount?: number;
  usersCount?: number;
  timestamp?: string;
  error?: string;
}

export interface UnitStats {
  total: number;
  acknowledge: number;
  inProgress: number;
  completed: number;
  // Aliases for compatibility
  pending: number;
  acknowledged: number;
  assignedWork: number;
  verifying: number;
  notStarted: number;
  avgPercent: number;
}

export interface OrgStats {
  totalUnits: number;
  assessedUnits: number;
  pendingUnits: number;
  totalBottlenecks: number;
  acknowledge: number;
  inProgress: number;
  completed: number;
  // Aliases for compatibility
  pending: number;
  acknowledged: number;
  assignedWork: number;
  verifying: number;
  notStarted: number;
  orgAvgPercent: number;
}

// Tab navigation definitions for role workspaces
export type UnitHeadTab = 'bottlenecks' | 'analytics' | 'profile';
export type OpsTeamTab = 'dashboard' | 'evidence' | 'categories' | 'compliance' | 'activity';
export type SuperAdminTab = 'dashboard' | 'evidence' | 'operations' | 'analytics' | 'users' | 'database';

