export type BottleneckStatus = 
  | 'Pending' 
  | 'In progress' 
  | 'Completed';

export const STATUS_STAGES: BottleneckStatus[] = [
  'Pending',
  'In progress',
  'Completed'
];

export const STATUS_PERCENT_MAP: Record<BottleneckStatus, number> = {
  'Pending': 0,
  'In progress': 50,
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
  | 'Post-op Care Briefing'
  | string;

export interface BottleneckComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorEmail?: string;
  message: string;
  createdAt: string;
}

export interface Bottleneck {
  id: string;
  unitId?: string;
  title: string;
  category: BottleneckCategory;
  department?: string;
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
  comments?: BottleneckComment[];
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
  cmo?: string;
  unitHead?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  department?: string;
  description?: string;
  createdAt?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  headContact?: string;
  createdAt?: string;
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
  pending: number;
  inProgress: number;
  completed: number;
  // Aliases for backwards compatibility
  acknowledge: number;
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
  pending: number;
  inProgress: number;
  completed: number;
  // Aliases for backwards compatibility
  acknowledge: number;
  acknowledged: number;
  assignedWork: number;
  verifying: number;
  notStarted: number;
  orgAvgPercent: number;
}

// Module Portal selection
export type PortalView = 'portal' | '5s' | 'bottleneck';

// Tab navigation definitions for role workspaces in the left sidebar
export type UnitHeadTab = 'dashboard' | 'bottlenecks' | 'completed' | 'analytics' | 'profile';
export type OpsTeamTab = 'dashboard' | 'units' | 'bottlenecks' | 'completed' | 'evidence' | 'categories' | 'compliance' | 'activity';
export type SuperAdminTab = 'dashboard' | 'units' | 'bottlenecks' | 'completed' | 'evidence' | 'categories' | 'users' | 'database';
