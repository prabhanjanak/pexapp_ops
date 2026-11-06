export type BottleneckStatus = 
  | 'Raised by MHQ'
  | 'Pending Acknowledgement'
  | 'Acknowledged'
  | 'Assigned to Employee'
  | 'In progress'
  | 'Resolved by Unit'
  | 'Requires MHQ Intervention'
  | 'Resolved by MHQ'
  | 'Completed'
  | 'Closed'
  | 'Not Started'
  | 'Pending';

export const STATUS_STAGES: BottleneckStatus[] = [
  'Raised by MHQ',
  'Pending Acknowledgement',
  'Acknowledged',
  'Assigned to Employee',
  'In progress',
  'Requires MHQ Intervention',
  'Resolved by Unit',
  'Resolved by MHQ',
  'Completed'
];

export const STATUS_PERCENT_MAP: Record<string, number> = {
  'Raised by MHQ': 10,
  'Pending Acknowledgement': 15,
  'Acknowledged': 25,
  'Assigned to Employee': 40,
  'In progress': 60,
  'Requires MHQ Intervention': 50,
  'Resolved by Unit': 90,
  'Resolved by MHQ': 100,
  'Completed': 100,
  'Closed': 100,
  'Not Started': 0,
  'Pending': 20
};

export interface UnitEmployee {
  id: string;
  name: string;
  email: string;
  unitId: string;
  department: string;
  designation?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface BottleneckHistoryItem {
  id: string;
  updatedBy: string;
  updatedRole?: string;
  field?: string;
  previousValue: string;
  updatedValue: string;
  timestamp: string;
}

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

export interface BottleneckTask {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  completedRole?: string;
  createdBy?: string;
  createdRole?: string;
  dueDate?: string;
}

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
  tasks?: BottleneckTask[];
  raisedBy?: string;
  raisedByRole?: string;
  raisedDate?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeDept?: string;
  assignedEmployeeEmail?: string;
  assignedBy?: string;
  assignedAt?: string;
  requiresMhqIntervention?: boolean;
  mhqInterventionBy?: string;
  mhqInterventionAt?: string;
  mhqDepartment?: string;
  mhqInterventionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  history?: BottleneckHistoryItem[];
}

export interface HospitalUnit {
  id: string;
  code?: string;
  imageUrl?: string;
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
  unitHeadEmail?: string;
  unitHeadEmpId?: string;
  unitHeadDesignation?: string;
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

export type UserRole = 
  | 'President' 
  | 'Super Admin' 
  | 'IT Admin' 
  | 'Operations Team' 
  | 'Unit Head' 
  | 'Zonal Incharge' 
  | 'Department Incharge' 
  | 'Auditor' 
  | 'Super Admin (View Only)';

export type AppAccessType = 'both' | 'bottleneck' | 'fives';

export interface User {
  id: string;
  name: string;
  email: string;
  empId?: string;
  password?: string;
  role: UserRole;
  unitId?: string; // for Unit Head, Zonal, Dept, Auditor
  unitName?: string;
  zoneId?: string; // for Zonal Incharge or Dept Incharge (e.g. 'Zone 1')
  department?: string; // for Department Incharge (e.g. 'Doctor consultation rooms')
  appAccess?: AppAccessType; // 'both' | 'bottleneck' | 'fives'
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
export type PortalView = 'portal' | '5s' | 'bottleneck' | 'staff';

// Tab navigation definitions for role workspaces in the left sidebar
export type UnitHeadTab = 'dashboard' | 'bottlenecks' | 'completed' | 'analytics' | 'profile';
export type OpsTeamTab = 'dashboard' | 'units' | 'bottlenecks' | 'completed' | 'evidence' | 'categories' | 'compliance' | 'activity';
export type SuperAdminTab = 'dashboard' | 'units' | 'bottlenecks' | 'completed' | 'evidence' | 'categories' | 'activity' | 'database';
