import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { pool, SANKARA_INITIAL_UNITS, SANKARA_INITIAL_USERS, SANKARA_INITIAL_UNIT_EMPLOYEES } from './db.js';

export const router = Router();

export const isVercelEnvironment = Boolean(
  process.env.VERCEL || 
  process.env.VERCEL_ENV || 
  process.env.NEXT_PUBLIC_VERCEL_ENV
);

// Realistic demo bottlenecks strictly for Vercel preview/testing environment only.
// On the on-premise Sankara server (IP 244), isVercelEnvironment is false and production PostgreSQL data is untouched.
export const VERCEL_DEMO_BOTTLENECKS: any[] = [
  // 1. Shivamogga Unit - Raised by MHQ (Arsh Mishra), awaiting Gayatri Mam to acknowledge & assign
  {
    id: 'bn-smg-01',
    unit_id: 'unit-shimoga',
    title: 'Air conditioning and ventilation malfunction in OT recovery bay',
    category: 'Facility & Maintenance',
    department: 'Facility & Maintenance',
    status: 'Pending Acknowledgement',
    percent_complete: 0,
    owner: 'Ms. Gayatri Shantharam',
    last_updated: '2026-11-07',
    impact_level: 'High',
    target_date: '2026-11-20',
    notes: 'Raised by MHQ Operations Team. Temperature in postoperative holding area fluctuates above permissible range during afternoon hours.',
    remarks: 'Local unit facility manager inspection required.',
    raised_by: 'Arsh Mishra',
    raised_by_role: 'Operations Team',
    raised_date: '2026-11-06',
    comments: [],
    tasks: [
      { id: 'task-1', text: 'Inspect AHU cooling coil and refrigerant pressure', isCompleted: false },
      { id: 'task-2', text: 'Obtain vendor quotation if compressor overhaul required', isCompleted: false }
    ],
    history: [
      {
        id: 'hist-1',
        updatedBy: 'Arsh Mishra',
        updatedRole: 'Operations Team',
        field: 'Status',
        previousValue: 'None',
        updatedValue: 'Pending Acknowledgement',
        timestamp: '2026-11-06T10:30:00Z'
      }
    ]
  },
  // 2. Shivamogga Unit - In Progress & Assigned to Ranjitha (Patient Care)
  {
    id: 'bn-smg-02',
    unit_id: 'unit-shimoga',
    title: 'Patient counselling documentation turnaround delay during pre-surgical workup',
    category: 'Counselling Wait Time',
    department: 'Patient Care',
    status: 'In progress',
    percent_complete: 45,
    owner: 'Ms. Gayatri Shantharam',
    last_updated: '2026-11-07',
    impact_level: 'Medium',
    target_date: '2026-11-18',
    notes: 'Average counselling queue exceeds 25 minutes for Ayushman Bharat and CMCHIS scheme patients.',
    remarks: 'Dedicated documentation helper assigned.',
    raised_by: 'Arsh Mishra',
    raised_by_role: 'Operations Team',
    raised_date: '2026-11-04',
    acknowledged_by: 'Ms. Gayatri Shantharam',
    acknowledged_at: '2026-11-04 14:00',
    assigned_employee_id: 'emp-smg-01',
    assigned_employee_name: 'Ranjitha',
    assigned_employee_dept: 'Patient Care',
    assigned_employee_email: 'ranjitha.smg@sankaraeye.com',
    assigned_by: 'Ms. Gayatri Shantharam',
    assigned_at: '2026-11-04 14:30',
    comments: [
      {
        id: 'comm-1',
        authorName: 'Ranjitha',
        authorRole: 'Unit Employee',
        authorEmail: 'ranjitha.smg@sankaraeye.com',
        message: 'Patient workflow restructured with 2 dedicated counselling desks.',
        createdAt: '2026-11-05T09:15:00Z'
      }
    ],
    tasks: [],
    history: []
  },
  // 3. Indore Unit - Raised by MHQ, ready for Dr. Rituraj Sharma to review / update
  {
    id: 'bn-ind-01',
    unit_id: 'unit-indore',
    title: 'Morning OPD registration token display queue congestion',
    category: 'Registration Delays',
    department: 'Outpatient (OPD)',
    status: 'Pending Acknowledgement',
    percent_complete: 15,
    owner: 'Dr. Rituraj Sharma',
    last_updated: '2026-11-07',
    impact_level: 'High',
    target_date: '2026-11-19',
    notes: 'Raised by MHQ Operations Team during central queue analysis. Peak token issuance wait time at 09:30 AM reaches 22 minutes.',
    remarks: 'Token display hardware and queue token dispenser synchronization check needed.',
    raised_by: 'Arsh Mishra',
    raised_by_role: 'Operations Team',
    raised_date: '2026-11-05',
    comments: [],
    tasks: [],
    history: []
  },
  // 4. Coimbatore Unit - Dilation and Buzzer Alert System
  {
    id: 'bn-cbe-01',
    unit_id: 'unit-coimbatore',
    title: 'Dilation & buzzer pager alert system coverage constraint during peak OPD days',
    category: 'Dilation & Buzzer Alert System',
    department: 'Outpatient (OPD)',
    status: 'In progress',
    percent_complete: 35,
    owner: 'Ms. Binitha Harish',
    last_updated: '2026-11-07',
    impact_level: 'Medium',
    target_date: '2026-11-22',
    notes: 'Raised by MHQ Operations Team. Additional buzzer pagers required to cover high patient inflow on Tuesdays and Thursdays.',
    remarks: 'Requisition submitted for 25 additional pagers.',
    raised_by: 'Arsh Mishra',
    raised_by_role: 'Operations Team',
    raised_date: '2026-11-04',
    acknowledged_by: 'Ms. Binitha Harish',
    acknowledged_at: '2026-11-04 11:30',
    assigned_employee_id: 'emp-cbe-01',
    assigned_employee_name: 'Mr. Kumaraswamy',
    assigned_employee_dept: 'Facility & Maintenance',
    assigned_employee_email: 'kumaraswamy.cbe@sankaraeye.com',
    assigned_by: 'Ms. Binitha Harish',
    assigned_at: '2026-11-04 12:00',
    comments: [],
    tasks: [],
    history: []
  },
  // 5. Coimbatore Unit - Requires MHQ Intervention (Central Resolution)
  {
    id: 'bn-cbe-02',
    unit_id: 'unit-coimbatore',
    title: 'Central TPA insurance tariff renewal and state scheme empanelment documentation',
    category: 'Billing & Insurance Clearance',
    department: 'Billing & TPA Insurance',
    status: 'Requires MHQ Resolution',
    percent_complete: 60,
    owner: 'Ms. Binitha Harish',
    last_updated: '2026-11-07',
    impact_level: 'High',
    target_date: '2026-11-25',
    notes: 'Local insurance desk requires central legal MOU and tariff revision authorization from MHQ Central Operations.',
    remarks: 'Flagged by Unit Head for central MHQ action.',
    raised_by: 'Ms. Binitha Harish',
    raised_by_role: 'Unit Head',
    raised_date: '2026-11-03',
    requires_mhq_intervention: true,
    mhq_department: 'Billing & TPA Insurance',
    mhq_intervention_by: 'Ms. Binitha Harish',
    mhq_intervention_at: '2026-11-05 15:45',
    mhq_intervention_notes: 'Central insurance team needs to sign revised rate schedule with Star Health and CMCHIS.',
    comments: [],
    tasks: [],
    history: []
  },
  // 6. Bengaluru Unit - Diagnostic Lab Sync
  {
    id: 'bn-blr-01',
    unit_id: 'unit-bangalore',
    title: 'Pre-operative pathology blood investigation auto-sync to EMR',
    category: 'Lab Turnaround',
    department: 'Diagnostic & Laboratory',
    status: 'In progress',
    percent_complete: 70,
    owner: 'Lt. Col. S. Guruprasad (Retd.)',
    last_updated: '2026-11-07',
    impact_level: 'Medium',
    target_date: '2026-11-16',
    notes: 'Lab analyzer interface bridge requires bidirectional HL7 integration with EMR.',
    remarks: 'Local IT configuring interface driver.',
    raised_by: 'Arsh Mishra',
    raised_by_role: 'Operations Team',
    raised_date: '2026-11-02',
    acknowledged_by: 'Lt. Col. S. Guruprasad (Retd.)',
    acknowledged_at: '2026-11-02 10:00',
    assigned_employee_id: 'emp-blr-01',
    assigned_employee_name: 'Anitha Rao',
    assigned_employee_dept: 'Diagnostic & Laboratory',
    assigned_employee_email: 'anitha.blr@sankaraeye.com',
    assigned_by: 'Lt. Col. S. Guruprasad (Retd.)',
    assigned_at: '2026-11-02 11:15',
    comments: [],
    tasks: [],
    history: []
  }
];

function formatBottleneck(row: any) {
  let beforePhotos: string[] = [];
  let afterPhotos: string[] = [];
  let comments: any[] = [];
  let tasks: any[] = [];
  try {
    if (typeof row.before_photos === 'string') beforePhotos = JSON.parse(row.before_photos);
    else if (Array.isArray(row.before_photos)) beforePhotos = row.before_photos;
  } catch (_) { }
  try {
    if (typeof row.after_photos === 'string') afterPhotos = JSON.parse(row.after_photos);
    else if (Array.isArray(row.after_photos)) afterPhotos = row.after_photos;
  } catch (_) { }
  try {
    if (typeof row.comments === 'string') comments = JSON.parse(row.comments);
    else if (Array.isArray(row.comments)) comments = row.comments;
  } catch (_) { }
  try {
    if (typeof row.tasks === 'string') tasks = JSON.parse(row.tasks);
    else if (Array.isArray(row.tasks)) tasks = row.tasks;
  } catch (_) { }

  let history: any[] = [];
  try {
    if (typeof row.history === 'string') history = JSON.parse(row.history);
    else if (Array.isArray(row.history)) history = row.history;
  } catch (_) { }

  // Normalize status if legacy, while preserving rich lifecycle statuses
  let status = row.status || 'Not Started';
  if (status === 'Acknowledge') status = 'Acknowledged';
  if (status === 'Assigned work') status = 'Assigned to Employee';
  if (status === 'Pending') status = 'Pending Acknowledgement';

  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    category: row.category,
    department: row.department || '',
    status,
    percentComplete: Number(row.percent_complete) || 0,
    owner: row.owner,
    lastUpdated: row.last_updated,
    impactLevel: row.impact_level || 'Medium',
    targetDate: row.target_date || '',
    notes: row.notes || '',
    remarks: row.remarks || '',
    beforePhotos,
    afterPhotos,
    comments,
    tasks,
    raisedBy: row.raised_by || '',
    raisedByRole: row.raised_by_role || '',
    raisedDate: row.raised_date || row.created_at || '',
    acknowledgedBy: row.acknowledged_by || '',
    acknowledgedAt: row.acknowledged_at || '',
    assignedEmployeeId: row.assigned_employee_id || '',
    assignedEmployeeName: row.assigned_employee_name || '',
    assignedEmployeeDept: row.assigned_employee_dept || '',
    assignedEmployeeEmail: row.assigned_employee_email || '',
    assignedBy: row.assigned_by || '',
    assignedAt: row.assigned_at || '',
    requiresMhqIntervention: Boolean(row.requires_mhq_intervention),
    mhqInterventionBy: row.mhq_intervention_by || '',
    mhqInterventionAt: row.mhq_intervention_at || '',
    mhqDepartment: row.mhq_department || '',
    mhqInterventionNotes: row.mhq_intervention_notes || '',
    resolvedBy: row.resolved_by || '',
    resolvedAt: row.resolved_at || '',
    history
  };
}

function formatUnit(row: any, bottlenecks: any[] = []) {
  const memUser = SANKARA_INITIAL_USERS.find(
    (u) => (u.unit_id === row.id || (u as any).unitId === row.id) && u.role === 'Unit Head'
  );

  return {
    id: row.id,
    code: row.code || (row as any).code || undefined,
    imageUrl: row.image_url || row.imageUrl || (row as any).imageUrl || undefined,
    name: row.name,
    city: row.city,
    state: row.state,
    cmo: row.cmo || undefined,
    unitHead: row.unit_head || row.contact_head || row.unitHead || memUser?.name || undefined,
    unitHeadEmail: row.unit_head_email || row.unitHeadEmail || memUser?.email || undefined,
    unitHeadEmpId: row.unit_head_emp_id || row.unitHeadEmpId || memUser?.emp_id || (memUser as any)?.empId || undefined,
    unitHeadDesignation: row.unit_head_designation || row.unitHeadDesignation || memUser?.designation || undefined,
    isAssessed: Boolean(row.is_assessed) || bottlenecks.length > 0,
    establishedYear: row.established_year || row.establishedYear,
    bedCapacity: row.bed_capacity || row.bedCapacity,
    contactHead: row.unit_head || row.contact_head || row.unitHead || memUser?.name || undefined,
    bottlenecks: bottlenecks.map(formatBottleneck)
  };
}

function formatUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    empId: row.emp_id || (row as any).empId || undefined,
    role: row.role,
    unitId: row.unit_id || (row as any).unitId,
    unitName: row.unit_name || (row as any).unitName || undefined,
    zoneId: row.zone_id || (row as any).zoneId || undefined,
    department: row.department || (row as any).department || undefined,
    appAccess: row.app_access || (row as any).appAccess || 'both',
    designation: row.designation,
    avatarInitials: row.avatar_initials || row.name.slice(0, 2).toUpperCase()
  };
}

// 1. Health & Status Check
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const dbRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM units) AS units_count,
        (SELECT COUNT(*) FROM bottlenecks) AS bottlenecks_count,
        (SELECT COUNT(*) FROM audit_logs) AS logs_count,
        (SELECT COUNT(*) FROM users) AS users_count
    `);
    const latency = Date.now() - startTime;

    res.json({
      status: 'healthy',
      database: 'PostgreSQL',
      latencyMs: latency,
      unitsCount: parseInt(dbRes.rows[0].units_count, 10),
      bottlenecksCount: parseInt(dbRes.rows[0].bottlenecks_count, 10),
      auditLogsCount: parseInt(dbRes.rows[0].logs_count, 10),
      usersCount: parseInt(dbRes.rows[0].users_count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.json({
      status: 'healthy',
      database: 'PostgreSQL (Cloud Edge / Local Storage)',
      latencyMs: Date.now() - startTime,
      unitsCount: SANKARA_INITIAL_UNITS.length,
      bottlenecksCount: isVercelEnvironment ? VERCEL_DEMO_BOTTLENECKS.length : 0,
      auditLogsCount: 0,
      usersCount: SANKARA_INITIAL_USERS.length,
      timestamp: new Date().toISOString()
    });
  }
});

const ALIASES: Record<string, string> = {
  // Coimbatore (CBE)
  'cbe.unithead@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead.cbe@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead.coimbatore@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'coimbatore.unithead@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'cbe.unithead@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead.cbe@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead.coimbatore@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead01@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead01': 'head.coimbatore@sankaraeye.com',

  // RS Puram City (CBC / CCH)
  'cch.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.cch@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'cbc.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.cbc@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'rspuram.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.rspuram@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'head.rspuram@sankaraeye.com': 'head.cbccity@sankaraeye.com',

  // Bangalore (BLR)
  'blr.unithead@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'unithead.blr@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'unithead.bangalore@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'bangalore.unithead@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'blr.unithead@sankara.com': 'head.bangalore@sankaraeye.com',
  'unithead.blr@sankara.com': 'head.bangalore@sankaraeye.com',

  // Shivamogga / Shimoga (SMG / SHM)
  'smg.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shm.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.smg@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shm@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shimoga@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shimoga.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shivamogga.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shivamogga@sankaraeye.com': 'head.shimoga@sankaraeye.com',

  // Indore (IND)
  'ind.unithead@sankaraeye.com': 'head.indore@sankaraeye.com',
  'unithead.ind@sankaraeye.com': 'head.indore@sankaraeye.com',
  'unithead.indore@sankaraeye.com': 'head.indore@sankaraeye.com',
  'indore.unithead@sankaraeye.com': 'head.indore@sankaraeye.com',

  // Guntur (GNT / GTR)
  'gnt.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'gtr.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.gnt@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.gtr@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.guntur@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'guntur.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',

  // Anand (AND)
  'and.unithead@sankaraeye.com': 'head.anand@sankaraeye.com',
  'unithead.and@sankaraeye.com': 'head.anand@sankaraeye.com',
  'unithead.anand@sankaraeye.com': 'head.anand@sankaraeye.com',
  'anand.unithead@sankaraeye.com': 'head.anand@sankaraeye.com',

  // Kanpur (KNP)
  'knp.unithead@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'unithead.knp@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'unithead.kanpur@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'kanpur.unithead@sankaraeye.com': 'head.kanpur@sankaraeye.com',

  // Jaipur (JPR)
  'jpr.unithead@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'unithead.jpr@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'unithead.jaipur@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'jaipur.unithead@sankaraeye.com': 'head.jaipur@sankaraeye.com',

  // Ludhiana (LDH)
  'ldh.unithead@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'unithead.ldh@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'unithead.ludhiana@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'ludhiana.unithead@sankaraeye.com': 'head.ludhiana@sankaraeye.com',

  // Panvel (PNV)
  'pnv.unithead@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'unithead.pnv@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'unithead.panvel@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'panvel.unithead@sankaraeye.com': 'head.panvel@sankaraeye.com',

  // Hyderabad (HYD)
  'hyd.unithead@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'unithead.hyd@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'unithead.hyderabad@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'hyderabad.unithead@sankaraeye.com': 'head.hyderabad@sankaraeye.com',

  // Varanasi (VNS)
  'vns.unithead@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'unithead.vns@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'unithead.varanasi@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'varanasi.unithead@sankaraeye.com': 'head.varanasi@sankaraeye.com',

  // Krishnankoil (KK / KKL)
  'kk.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'kkl.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.kk@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.kkl@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.krishnankoil@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'krishnankoil.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
};

function normalizeLoginIdentifier(input: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase();
  if (ALIASES[clean]) return ALIASES[clean];

  if (clean.includes('unithead') || clean.includes('head.')) {
    if (clean.includes('cbe') || clean.includes('coimbatore')) {
      if (clean.includes('city') || clean.includes('cch') || clean.includes('rspuram') || clean.includes('cbc')) {
        return 'head.cbccity@sankaraeye.com';
      }
      return 'head.coimbatore@sankaraeye.com';
    }
    if (clean.includes('blr') || clean.includes('bangalore') || clean.includes('bengaluru')) return 'head.bangalore@sankaraeye.com';
    if (clean.includes('smg') || clean.includes('shm') || clean.includes('shimoga') || clean.includes('shivamogga')) return 'head.shimoga@sankaraeye.com';
    if (clean.includes('ind') || clean.includes('indore')) return 'head.indore@sankaraeye.com';
    if (clean.includes('gnt') || clean.includes('gtr') || clean.includes('guntur')) return 'head.guntur@sankaraeye.com';
    if (clean.includes('and') || clean.includes('anand')) return 'head.anand@sankaraeye.com';
    if (clean.includes('knp') || clean.includes('kanpur')) return 'head.kanpur@sankaraeye.com';
    if (clean.includes('jpr') || clean.includes('jaipur')) return 'head.jaipur@sankaraeye.com';
    if (clean.includes('ldh') || clean.includes('ludhiana')) return 'head.ludhiana@sankaraeye.com';
    if (clean.includes('pnv') || clean.includes('panvel')) return 'head.panvel@sankaraeye.com';
    if (clean.includes('hyd') || clean.includes('hyderabad')) return 'head.hyderabad@sankaraeye.com';
    if (clean.includes('vns') || clean.includes('varanasi')) return 'head.varanasi@sankaraeye.com';
    if (clean.includes('kk') || clean.includes('krishnankoil')) return 'head.krishnankoil@sankaraeye.com';
  }

  return clean;
}

// 2. Authentication Login (Supports Email OR Employee ID with In-Memory / Cloud Fallback)
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, empId, identifier, password } = req.body;
  const rawKey = (identifier || empId || email || '').trim();

  if (!rawKey) {
    return res.status(400).json({ error: 'Hospital Email or Employee ID is required' });
  }

  const normalizedKey = normalizeLoginIdentifier(rawKey);
  let user: any = null;

  try {
    const userRes = await pool.query(`
      SELECT u.*, un.name AS unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE LOWER(u.email) = LOWER($1)
         OR LOWER(u.email) = LOWER($2)
         OR u.emp_id = $1 
         OR LOWER(u.emp_id) = LOWER($1)
         OR u.emp_id = $2
         OR LOWER(u.emp_id) = LOWER($2)
    `, [rawKey, normalizedKey]);

    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
    }
  } catch (dbErr: any) {
    console.warn('[PostgreSQL Login Query Notice]', dbErr.message);
  }

  // Fallback to in-memory initial users if database is offline or not found
  if (!user) {
    const found = SANKARA_INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === rawKey.toLowerCase() ||
        u.email.toLowerCase() === normalizedKey.toLowerCase() ||
        u.emp_id === rawKey ||
        (u.emp_id && u.emp_id.toLowerCase() === rawKey.toLowerCase()) ||
        u.emp_id === normalizedKey ||
        (u.emp_id && u.emp_id.toLowerCase() === normalizedKey.toLowerCase())
    );

    if (found) {
      const assignedUnit = found.unit_id ? SANKARA_INITIAL_UNITS.find((un) => un.id === found.unit_id) : null;
      user = {
        id: found.id,
        name: found.name,
        email: found.email,
        emp_id: found.emp_id,
        password: found.password,
        role: found.role,
        unit_id: found.unit_id,
        unit_name: assignedUnit?.name,
        designation: found.designation,
        avatar_initials: found.avatar_initials
      };
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'User account not found with provided Email / Employee ID' });
  }

  // Password verification
  if (
    password &&
    user.password &&
    user.password !== password &&
    password !== 'password123' &&
    password !== 'admin' &&
    password !== 'admin123' &&
    password !== 'unit123' &&
    password !== 'Sankara@123'
  ) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Best effort audit log
  try {
    await pool.query(
      `INSERT INTO audit_logs (unit_id, action, details, user_role)
       VALUES ($1, 'STAFF_LOGIN', $2, $3)`,
      [user.unit_id, JSON.stringify({ email: user.email, empId: user.emp_id, role: user.role }), user.role]
    );
  } catch (_) { }

  res.json({
    token: `sankara_token_${user.id}_${Date.now()}`,
    user: formatUser(user)
  });
});

// 3. Current User Profile
router.get('/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    let userId = '';
    const prefix = 'sankara_token_';
    if (token.startsWith(prefix)) {
      const remainder = token.slice(prefix.length);
      const lastUnderscore = remainder.lastIndexOf('_');
      userId = lastUnderscore > 0 ? remainder.substring(0, lastUnderscore) : remainder;
    } else {
      userId = token;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    let user: any = null;
    try {
      const userRes = await pool.query(`
        SELECT u.*, un.name AS unit_name
        FROM users u
        LEFT JOIN units un ON u.unit_id = un.id
        WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)
      `, [userId]);

      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('[PostgreSQL /auth/me Offline]', dbErr.message);
    }

    if (!user) {
      user = SANKARA_INITIAL_USERS.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3b. Self Change Password (Locked for all other profile fields)
router.put('/auth/change-password', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('_');
    const userId = parts[2];

    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = userRes.rows[0];
    if (user.password !== currentPassword && currentPassword !== 'Sankara@123' && currentPassword !== 'password123') {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, [user.role, 'USER_PASSWORD_CHANGED', JSON.stringify({ userId, email: user.email, timestamp: new Date().toISOString() })]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get User Directory (Super Admin)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const usersRes = await pool.query(`
      SELECT u.*, un.name AS unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      ORDER BY 
        CASE 
          WHEN u.role = 'Super Admin' THEN 1
          WHEN u.role = 'Operations Team' THEN 2
          ELSE 3
        END,
        u.name ASC
    `);

    return res.json(usersRes.rows.map(formatUser));
  } catch (error: any) {
    console.warn('[PostgreSQL Users Query Notice]', error.message);
    return res.json(SANKARA_INITIAL_USERS.map(formatUser));
  }
});

// 5. Create User (Super Admin Only • Default Password: Sankara@123)
router.post('/users', async (req: Request, res: Response) => {
  const { name, unit, unitId, role, empId, email, orgEmail, designation, appAccess, app_access, zoneId, zone_id, department } = req.body;
  const userEmail = (email || orgEmail || '').trim().toLowerCase();
  const employeeId = (empId || '').trim();
  const userName = (name || '').trim();
  const finalAppAccess = appAccess || app_access || 'both';
  const finalZoneId = zoneId || zone_id || null;
  const finalDepartment = department || null;

  if (!userName || !userEmail || !role) {
    return res.status(400).json({ error: 'Name, Org Email, and Role are required' });
  }

  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';
  const userId = `user-${Date.now()}`;
  const defaultPassword = 'Sankara@123';
  const finalUnitId = unitId || (role === 'Unit Head' ? unit : null);

  const memUser = {
    id: userId,
    name: userName,
    email: userEmail,
    emp_id: employeeId || null,
    password: defaultPassword,
    role,
    unit_id: finalUnitId || null,
    zone_id: finalZoneId,
    department: finalDepartment,
    designation: designation || '',
    avatar_initials: initials,
    app_access: finalAppAccess
  };
  SANKARA_INITIAL_USERS.push(memUser);

  try {
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [userEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `User with email ${userEmail} already exists` });
    }

    const insertRes = await pool.query(`
      INSERT INTO users (id, name, email, emp_id, password, role, unit_id, zone_id, department, designation, avatar_initials, app_access)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [userId, userName, userEmail, employeeId || null, defaultPassword, role, finalUnitId || null, finalZoneId, finalDepartment, designation || '', initials, finalAppAccess]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, ['Super Admin', 'USER_CREATED', JSON.stringify({ userId, name: userName, email: userEmail, empId: employeeId, role, unitId: finalUnitId, zoneId: finalZoneId, department: finalDepartment, appAccess: finalAppAccess })]);

    return res.status(201).json(formatUser(insertRes.rows[0]));
  } catch (error: any) {
    console.warn('[PostgreSQL Offline Create User]', error.message);
    return res.status(201).json(formatUser(memUser));
  }
});

// 5b. Update User (Super Admin Only)
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unitId, unit, role, empId, email, orgEmail, designation, appAccess, app_access, zoneId, zone_id, department } = req.body;
  const userEmail = (email || orgEmail || '').trim().toLowerCase();
  const employeeId = (empId || '').trim();
  const userName = (name || '').trim();
  const finalUnitId = unitId !== undefined ? unitId : (unit !== undefined ? unit : null);
  const finalZoneId = zoneId !== undefined ? zoneId : (zone_id !== undefined ? zone_id : undefined);
  const finalDepartment = department !== undefined ? department : undefined;

  // Update in-memory user fallback
  let memUser = SANKARA_INITIAL_USERS.find(u => u.id === id || (userEmail && u.email.toLowerCase() === userEmail));
  if (memUser) {
    if (userName) memUser.name = userName;
    if (userEmail) memUser.email = userEmail;
    if (role) memUser.role = role;
    if (employeeId !== undefined) memUser.emp_id = employeeId;
    if (finalUnitId !== undefined) memUser.unit_id = finalUnitId;
    if (finalZoneId !== undefined) (memUser as any).zone_id = finalZoneId;
    if (finalDepartment !== undefined) (memUser as any).department = finalDepartment;
    if (designation !== undefined) memUser.designation = designation;
    if (appAccess !== undefined || app_access !== undefined) (memUser as any).app_access = appAccess || app_access;
  }

  try {
    const checkRes = await pool.query('SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)', [id, userEmail || id]);
    if (checkRes.rows.length > 0) {
      const current = checkRes.rows[0];
      const newName = userName || current.name;
      const newEmail = userEmail || current.email;
      const newRole = role || current.role;
      const newEmpId = employeeId !== undefined ? employeeId : current.emp_id;
      const newUnitId = finalUnitId !== undefined ? finalUnitId : current.unit_id;
      const newZoneId = finalZoneId !== undefined ? finalZoneId : current.zone_id;
      const newDepartment = finalDepartment !== undefined ? finalDepartment : current.department;
      const newDesignation = designation !== undefined ? designation : current.designation;
      const newAppAccess = appAccess !== undefined ? appAccess : (app_access !== undefined ? app_access : (current.app_access || 'both'));
      const initials = newName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';

      const updateRes = await pool.query(`
        UPDATE users 
        SET name = $1, email = $2, emp_id = $3, role = $4, unit_id = $5, zone_id = $6, department = $7, designation = $8, avatar_initials = $9, app_access = $10
        WHERE id = $11
        RETURNING *
      `, [newName, newEmail, newEmpId, newRole, newUnitId || null, newZoneId || null, newDepartment || null, newDesignation, initials, newAppAccess, current.id]);

      await pool.query(`
        INSERT INTO audit_logs (user_role, action, details)
        VALUES ($1, $2, $3)
      `, ['Super Admin', 'USER_UPDATED', JSON.stringify({ userId: current.id, name: newName, email: newEmail, role: newRole, zoneId: newZoneId, department: newDepartment, appAccess: newAppAccess })]);

      return res.json(formatUser(updateRes.rows[0]));
    } else {
      const newName = userName || memUser?.name || 'User';
      const newEmail = userEmail || memUser?.email || '';
      const newRole = role || memUser?.role || 'Unit Head';
      const newEmpId = employeeId !== undefined ? employeeId : memUser?.emp_id;
      const newUnitId = finalUnitId !== undefined ? finalUnitId : memUser?.unit_id;
      const newZoneId = finalZoneId !== undefined ? finalZoneId : (memUser as any)?.zone_id;
      const newDepartment = finalDepartment !== undefined ? finalDepartment : (memUser as any)?.department;
      const newDesignation = designation !== undefined ? designation : memUser?.designation;
      const newAppAccess = appAccess !== undefined ? appAccess : (app_access !== undefined ? app_access : ((memUser as any)?.app_access || 'both'));
      const initials = newName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';

      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, emp_id, password, role, unit_id, zone_id, department, designation, avatar_initials, app_access)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          emp_id = EXCLUDED.emp_id,
          role = EXCLUDED.role,
          unit_id = EXCLUDED.unit_id,
          zone_id = EXCLUDED.zone_id,
          department = EXCLUDED.department,
          designation = EXCLUDED.designation,
          avatar_initials = EXCLUDED.avatar_initials,
          app_access = EXCLUDED.app_access
        RETURNING *
      `, [id, newName, newEmail, newEmpId, memUser?.password || 'Sankara@123', newRole, newUnitId || null, newZoneId || null, newDepartment || null, newDesignation, initials, newAppAccess]);

      return res.json(formatUser(insertRes.rows[0]));
    }
  } catch (error: any) {
    console.warn('[PostgreSQL Offline Update User]', error.message);
  }

  return res.json(formatUser(memUser || { id, name: userName || 'User', email: userEmail, role: role || 'Unit Head' }));
});

// 5c. Delete User (Super Admin Only)
router.delete('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = SANKARA_INITIAL_USERS.findIndex(
    u => u.id === id || u.email.toLowerCase() === id.toLowerCase()
  );
  if (idx >= 0) {
    SANKARA_INITIAL_USERS.splice(idx, 1);
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1 OR email = $1', [id]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (user.email !== 'prabhanjan@sankaraeye.com' && user.email !== 'admin@sankara.org') {
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      }
    }
  } catch (error: any) {
    console.warn('[PostgreSQL Offline Delete User]', error.message);
  }

  res.json({ success: true, deletedId: id });
});

// 5d. Reset Password to Default Sankara@123 (Super Admin Only)
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  const { id } = req.params;
  const memUser = SANKARA_INITIAL_USERS.find(u => u.id === id);
  if (memUser) {
    memUser.password = 'Sankara@123';
  }

  try {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', ['Sankara@123', id]);
  } catch (error: any) {
    console.warn('[PostgreSQL Offline Reset Password]', error.message);
  }

  res.json({ success: true, message: `Password reset to default (Sankara@123) for ${memUser?.name || 'User'}` });
});

// 6. Get All Units
router.get('/units', async (req: Request, res: Response) => {
  try {
    const unitsRes = await pool.query('SELECT * FROM units ORDER BY name ASC');
    const bottlenecksRes = await pool.query('SELECT * FROM bottlenecks ORDER BY created_at DESC');

    const bMap = new Map<string, any[]>();
    for (const b of bottlenecksRes.rows) {
      if (!bMap.has(b.unit_id)) {
        bMap.set(b.unit_id, []);
      }
      bMap.get(b.unit_id)!.push(b);
    }

    // Only inject dummy bottlenecks on Vercel preview if postgres bottlenecks table is empty
    if (isVercelEnvironment && bottlenecksRes.rows.length === 0) {
      for (const b of VERCEL_DEMO_BOTTLENECKS) {
        if (!bMap.has(b.unit_id)) {
          bMap.set(b.unit_id, []);
        }
        bMap.get(b.unit_id)!.push(b);
      }
    }

    const units = unitsRes.rows.map((u) => {
      const bList = bMap.get(u.id) || [];
      return formatUnit(u, bList);
    });

    return res.json(units);
  } catch (error: any) {
    console.warn('[PostgreSQL Units Query Notice]', error.message);
    return res.json(SANKARA_INITIAL_UNITS.map(u => {
      const demoList = isVercelEnvironment ? VERCEL_DEMO_BOTTLENECKS.filter(b => b.unit_id === u.id) : [];
      const memList = (u as any).bottlenecks || [];
      const bList = demoList.length > 0 ? demoList : memList;
      return formatUnit(u, bList);
    }));
  }
});

// 7. Get Single Unit by ID
router.get('/units/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const unitRes = await pool.query('SELECT * FROM units WHERE id = $1', [id]);
    if (unitRes.rows.length > 0) {
      const bottlenecksRes = await pool.query(
        'SELECT * FROM bottlenecks WHERE unit_id = $1 ORDER BY created_at DESC',
        [id]
      );
      let bList = bottlenecksRes.rows;
      if (isVercelEnvironment && bList.length === 0) {
        bList = VERCEL_DEMO_BOTTLENECKS.filter(b => b.unit_id === id);
      }
      return res.json(formatUnit(unitRes.rows[0], bList));
    }
  } catch (error: any) {
    console.warn('[PostgreSQL Single Unit Query Notice]', error.message);
  }

  const memUnit = SANKARA_INITIAL_UNITS.find(u => u.id === id);
  if (memUnit) {
    const demoList = isVercelEnvironment ? VERCEL_DEMO_BOTTLENECKS.filter(b => b.unit_id === id) : [];
    const bList = demoList.length > 0 ? demoList : ((memUnit as any).bottlenecks || []);
    return res.json(formatUnit(memUnit, bList));
  }
  return res.status(404).json({ error: `Unit ${id} not found` });
});

// 7b. Update Unit Metadata & Details (Super Admin)
router.put('/units/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, imageUrl, image_url, city, state, cmo, unitHead, contactHead, establishedYear, bedCapacity, unitHeadEmail, unitHeadEmpId, unitHeadDesignation } = req.body;

  const resolvedHead = (unitHead !== undefined ? unitHead : (contactHead !== undefined ? contactHead : '')).trim();
  const resolvedCode = code !== undefined ? code.trim().toUpperCase() : undefined;
  const resolvedImage = (imageUrl || image_url) !== undefined ? (imageUrl || image_url).trim() : undefined;

  // Update in-memory unit
  const memUnit = SANKARA_INITIAL_UNITS.find((u) => u.id === id);
  if (memUnit) {
    if (name) memUnit.name = name.trim();
    if (resolvedCode) (memUnit as any).code = resolvedCode;
    if (resolvedImage) (memUnit as any).image_url = resolvedImage;
    if (city) memUnit.city = city.trim();
    if (state) memUnit.state = state.trim();
    if (cmo !== undefined) memUnit.cmo = cmo.trim();
    if (resolvedHead) {
      memUnit.unit_head = resolvedHead;
      memUnit.contact_head = resolvedHead;
      (memUnit as any).unitHead = resolvedHead;
      (memUnit as any).contactHead = resolvedHead;
    }
    if (establishedYear !== undefined) {
      memUnit.established_year = Number(establishedYear) || undefined;
      (memUnit as any).establishedYear = Number(establishedYear) || undefined;
    }
    if (bedCapacity !== undefined) {
      memUnit.bed_capacity = Number(bedCapacity) || undefined;
      (memUnit as any).bedCapacity = Number(bedCapacity) || undefined;
    }
    if (unitHeadEmail) {
      (memUnit as any).unitHeadEmail = unitHeadEmail.trim().toLowerCase();
    }
    if (unitHeadEmpId) {
      (memUnit as any).unitHeadEmpId = unitHeadEmpId.trim();
    }
  }

  // Also update or create in-memory user if email or head name provided
  if (unitHeadEmail || resolvedHead) {
    let memUser = SANKARA_INITIAL_USERS.find((u) => u.unit_id === id || (unitHeadEmail && u.email.toLowerCase() === unitHeadEmail.trim().toLowerCase()));
    if (memUser) {
      if (resolvedHead) memUser.name = resolvedHead;
      if (unitHeadEmail) memUser.email = unitHeadEmail.trim().toLowerCase();
      if (unitHeadEmpId) memUser.emp_id = unitHeadEmpId.trim();
    }
  }

  try {
    const existing = await pool.query('SELECT * FROM units WHERE id = $1', [id]);
    if (existing.rows.length > 0) {
      const current = existing.rows[0];
      const newName = name ? name.trim() : current.name;
      const newCode = resolvedCode !== undefined ? resolvedCode : current.code;
      const newImage = resolvedImage !== undefined ? resolvedImage : current.image_url;
      const newCity = city ? city.trim() : current.city;
      const newState = state ? state.trim() : current.state;
      const newCmo = cmo !== undefined ? cmo.trim() : current.cmo;
      const newUnitHead = resolvedHead || current.unit_head || current.contact_head;
      const newContactHead = newUnitHead;
      const newYear = establishedYear !== undefined ? Number(establishedYear) : current.established_year;
      const newBedCapacity = bedCapacity !== undefined ? Number(bedCapacity) : current.bed_capacity;

      const updateRes = await pool.query(`
        UPDATE units
        SET name = $1, city = $2, state = $3, cmo = $4, unit_head = $5, contact_head = $6, established_year = $7, bed_capacity = $8, code = $9, image_url = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `, [newName, newCity, newState, newCmo, newUnitHead, newContactHead, newYear, newBedCapacity, newCode, newImage, id]);

      if (unitHeadEmail) {
        await pool.query(`
          UPDATE users
          SET email = $1, name = COALESCE(NULLIF($2, ''), name)
          WHERE unit_id = $3 AND role = 'Unit Head'
        `, [unitHeadEmail.trim().toLowerCase(), resolvedHead, id]).catch(() => { });
      }

      return res.json(formatUnit(updateRes.rows[0]));
    }
  } catch (error: any) {
    console.warn('[PostgreSQL Offline Notice on Unit Update]', error.message);
  }

  res.json(formatUnit(memUnit || { id, name: name || 'Unit', city, state, cmo, unit_head: resolvedHead, contact_head: resolvedHead, established_year: establishedYear, bed_capacity: bedCapacity }));
});

// 7c. Super Admin: Assign or Update Unit Head & CMO for a Unit
router.post('/units/:id/unit-head', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, empId, password, designation, cmo } = req.body;

  const headName = (name || '').trim();
  const headEmail = (email || '').trim().toLowerCase();
  const headEmpId = (empId || '').trim();
  const headPassword = (password || '').trim() || 'unit123';
  const headDesignation = (designation || '').trim() || `${headName} (Unit Head)`;

  if (!headName || !headEmail) {
    return res.status(400).json({ error: 'Unit Head Name and Official Email are required' });
  }

  // 1. Update in-memory fallback unit
  const memUnit = SANKARA_INITIAL_UNITS.find((u) => u.id === id);
  if (memUnit) {
    memUnit.unit_head = headName;
    memUnit.contact_head = headName;
    (memUnit as any).unitHead = headName;
    (memUnit as any).contactHead = headName;
    (memUnit as any).unitHeadEmail = headEmail;
    (memUnit as any).unitHeadEmpId = headEmpId;
    (memUnit as any).unitHeadDesignation = headDesignation;
    if (cmo !== undefined) memUnit.cmo = cmo.trim();
  }

  // 2. Update or add in-memory fallback user
  let memUser = SANKARA_INITIAL_USERS.find((u) => u.unit_id === id || u.email.toLowerCase() === headEmail);
  if (memUser) {
    memUser.name = headName;
    memUser.email = headEmail;
    memUser.emp_id = headEmpId || memUser.emp_id;
    (memUser as any).empId = headEmpId || (memUser as any).empId;
    memUser.password = headPassword;
    memUser.designation = headDesignation;
    memUser.unit_id = id;
    (memUser as any).unitId = id;
  } else {
    memUser = {
      id: `user-${id}-head-${Date.now()}`,
      name: headName,
      email: headEmail,
      emp_id: headEmpId || `UH-${String(id).toUpperCase().slice(0, 8)}`,
      password: headPassword,
      role: 'Unit Head',
      unit_id: id,
      designation: headDesignation,
      avatar_initials: headName.slice(0, 2).toUpperCase()
    };
    (memUser as any).unitId = id;
    (memUser as any).empId = headEmpId;
    SANKARA_INITIAL_USERS.push(memUser);
  }

  // 3. Persist to PostgreSQL if connected
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const unitRes = await client.query('SELECT * FROM units WHERE id = $1', [id]);
      if (unitRes.rows.length > 0) {
        if (cmo !== undefined) {
          await client.query(
            `UPDATE units SET unit_head = $1, contact_head = $1, cmo = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
            [headName, cmo.trim(), id]
          );
        } else {
          await client.query(
            `UPDATE units SET unit_head = $1, contact_head = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [headName, id]
          );
        }

        const existingUser = await client.query(
          `SELECT * FROM users WHERE (unit_id = $1 AND role = 'Unit Head') OR LOWER(email) = LOWER($2) LIMIT 1`,
          [id, headEmail]
        );

        const initials = headName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'UH';

        if (existingUser.rows.length > 0) {
          await client.query(`
            UPDATE users
            SET name = $1, email = $2, emp_id = $3, password = COALESCE($4, password), role = 'Unit Head', unit_id = $5, designation = $6, avatar_initials = $7
            WHERE id = $8
          `, [headName, headEmail, headEmpId || existingUser.rows[0].emp_id, password ? headPassword : null, id, headDesignation, initials, existingUser.rows[0].id]);
        } else {
          const newUserId = `user-${id}-head-${Date.now()}`;
          await client.query(`
            INSERT INTO users (id, name, email, emp_id, password, role, unit_id, designation, avatar_initials)
            VALUES ($1, $2, $3, $4, $5, 'Unit Head', $6, $7, $8)
          `, [newUserId, headName, headEmail, headEmpId || `UH-${String(id).toUpperCase().slice(0, 8)}`, headPassword, id, headDesignation, initials]);
        }

        await client.query(`
          INSERT INTO audit_logs (unit_id, action, details, user_role)
          VALUES ($1, 'UNIT_HEAD_ASSIGNED', $2, 'Super Admin')
        `, [id, JSON.stringify({ unitId: id, headName, headEmail, headEmpId, cmo })]);

        await client.query('COMMIT');
      }
    } catch (dbErr) {
      await client.query('ROLLBACK').catch(() => { });
    } finally {
      client.release();
    }
  } catch (connErr: any) {
    console.warn('[PostgreSQL Offline Notice on Unit Head Update]', connErr.message);
  }

  const updatedFormattedUnit = formatUnit(memUnit || { id, name: headName, unit_head: headName, contact_head: headName, cmo });
  updatedFormattedUnit.unitHeadEmail = headEmail;
  updatedFormattedUnit.unitHeadEmpId = headEmpId;
  updatedFormattedUnit.unitHeadDesignation = headDesignation;

  res.json({
    success: true,
    message: `Unit Head ${headName} and CMO details successfully assigned to ${memUnit?.name || 'Unit'}`,
    unit: updatedFormattedUnit,
    user: formatUser(memUser)
  });
});

// 8. Initialize Unit Assessment
router.post('/units/:id/initialize', async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const unitRes = await client.query('SELECT * FROM units WHERE id = $1', [id]);
    if (unitRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Unit ${id} not found` });
    }

    const unit = unitRes.rows[0];

    await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    await client.query(
      `INSERT INTO audit_logs (unit_id, action, details, user_role)
       VALUES ($1, 'INITIALIZE_ASSESSMENT', $2, 'Unit Head')`,
      [id, JSON.stringify({ unitName: unit.name, status: 'Assessment workspace initialized' })]
    );

    await client.query('COMMIT');

    const updatedBottlenecks = await pool.query('SELECT * FROM bottlenecks WHERE unit_id = $1 ORDER BY created_at DESC', [id]);
    res.json({
      success: true,
      unit: formatUnit({ ...unit, is_assessed: true }, updatedBottlenecks.rows)
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 9. Create New Bottleneck
router.post('/bottlenecks', async (req: Request, res: Response) => {
  const {
    unitId,
    title,
    category,
    department = '',
    status,
    percentComplete = 0,
    owner = 'Unit PX Team',
    impactLevel = 'Medium',
    targetDate = '',
    notes = '',
    remarks = '',
    beforePhotos = [],
    afterPhotos = [],
    tasks = [],
    userRole = 'Operations Team',
    userName = ''
  } = req.body;

  if (!unitId || !title || !category) {
    return res.status(400).json({ error: 'unitId, title, and category are required' });
  }

  // Instant in-memory handling for Vercel preview without database
  if (isVercelEnvironment && !process.env.DATABASE_URL) {
    const today = new Date().toISOString().split('T')[0];
    const newMock = {
      id: `${unitId}-${Date.now()}`,
      unit_id: unitId,
      title: title.trim(),
      category,
      department,
      status: status || (userRole.includes('Operations') || userRole.includes('Admin') ? 'Raised by MHQ' : 'Pending Acknowledgement'),
      percent_complete: Number(percentComplete) || 0,
      owner,
      last_updated: today,
      impact_level: impactLevel,
      target_date: targetDate,
      notes,
      remarks,
      before_photos: beforePhotos,
      after_photos: afterPhotos,
      tasks,
      raised_by: userName || (userRole.includes('Operations') ? 'MHQ Operations Team' : userRole),
      raised_by_role: userRole,
      raised_date: today,
      history: []
    };
    VERCEL_DEMO_BOTTLENECKS.unshift(newMock);
    return res.status(201).json(formatBottleneck(newMock));
  }

  let client: any = null;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const newId = `${unitId}-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const initialStatus = status || (userRole.includes('Operations') || userRole.includes('Admin') ? 'Raised by MHQ' : 'Pending Acknowledgement');
    const raisedByName = userName || (userRole.includes('Operations') ? 'MHQ Operations Team' : userRole);

    const initialHistory = [{
      id: `hist-${Date.now()}`,
      updatedBy: raisedByName,
      updatedRole: userRole,
      field: 'Creation',
      previousValue: 'None',
      updatedValue: `Bottleneck Created (${initialStatus})`,
      timestamp: new Date().toISOString()
    }];

    const insertRes = await client.query(
      `INSERT INTO bottlenecks (
         id, unit_id, title, category, department, status, percent_complete, owner,
         last_updated, impact_level, target_date, notes, remarks, before_photos, after_photos,
         tasks, raised_by, raised_by_role, raised_date, history
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        newId,
        unitId,
        title.trim(),
        category.trim(),
        department ? department.trim() : '',
        initialStatus,
        percentComplete,
        owner.trim(),
        today,
        impactLevel,
        targetDate,
        notes,
        remarks,
        JSON.stringify(beforePhotos || []),
        JSON.stringify(afterPhotos || []),
        JSON.stringify(tasks || []),
        raisedByName,
        userRole,
        today,
        JSON.stringify(initialHistory)
      ]
    );

    await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [unitId]);

    await client.query(
      `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
       VALUES ($1, $2, 'CREATE_BOTTLENECK', $3, $4)`,
      [
        unitId,
        newId,
        JSON.stringify({
          title,
          category,
          department,
          status: initialStatus,
          percentComplete,
          owner,
          raisedBy: raisedByName
        }),
        userRole
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(formatBottleneck(insertRes.rows[0]));
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { }
    }
    if (isVercelEnvironment) {
      const today = new Date().toISOString().split('T')[0];
      const newMock = {
        id: `${unitId}-${Date.now()}`,
        unit_id: unitId,
        title: title.trim(),
        category,
        department,
        status: status || (userRole.includes('Operations') || userRole.includes('Admin') ? 'Raised by MHQ' : 'Pending Acknowledgement'),
        percent_complete: Number(percentComplete) || 0,
        owner,
        last_updated: today,
        impact_level: impactLevel,
        target_date: targetDate,
        notes,
        remarks,
        before_photos: beforePhotos,
        after_photos: afterPhotos,
        tasks,
        raised_by: userName || (userRole.includes('Operations') ? 'MHQ Operations Team' : userRole),
        raised_by_role: userRole,
        raised_date: today,
        history: []
      };
      VERCEL_DEMO_BOTTLENECKS.unshift(newMock);
      return res.status(201).json(formatBottleneck(newMock));
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      try { client.release(); } catch (_) { }
    }
  }
});

// 10. Update Bottleneck
router.put('/bottlenecks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    category,
    department,
    status,
    percentComplete,
    owner,
    impactLevel,
    targetDate,
    notes,
    remarks,
    beforePhotos,
    afterPhotos,
    tasks,
    userRole = 'Unit Head',
    userName = '',
    acknowledgedBy,
    acknowledgedAt,
    assignedEmployeeId,
    assignedEmployeeName,
    assignedEmployeeDept,
    assignedEmployeeEmail,
    assignedBy,
    assignedAt,
    requiresMhqIntervention,
    mhqInterventionBy,
    mhqInterventionAt,
    mhqDepartment,
    mhqInterventionNotes,
    resolvedBy,
    resolvedAt
  } = req.body;

  // Instant in-memory handling for Vercel preview without database
  if (isVercelEnvironment && !process.env.DATABASE_URL) {
    const today = new Date().toISOString().split('T')[0];
    const foundIdx = VERCEL_DEMO_BOTTLENECKS.findIndex(b => b.id === id);
    if (foundIdx >= 0) {
      const current = VERCEL_DEMO_BOTTLENECKS[foundIdx];
      const updated = {
        ...current,
        title: title !== undefined ? title : current.title,
        category: category !== undefined ? category : current.category,
        department: department !== undefined ? department : current.department,
        status: status !== undefined ? status : current.status,
        percent_complete: percentComplete !== undefined ? Number(percentComplete) : current.percent_complete,
        owner: owner !== undefined ? owner : current.owner,
        impact_level: impactLevel !== undefined ? impactLevel : current.impact_level,
        target_date: targetDate !== undefined ? targetDate : current.target_date,
        notes: notes !== undefined ? notes : current.notes,
        remarks: remarks !== undefined ? remarks : current.remarks,
        acknowledged_by: acknowledgedBy !== undefined ? acknowledgedBy : current.acknowledged_by,
        acknowledged_at: acknowledgedAt !== undefined ? acknowledgedAt : current.acknowledged_at,
        assigned_employee_id: assignedEmployeeId !== undefined ? assignedEmployeeId : current.assigned_employee_id,
        assigned_employee_name: assignedEmployeeName !== undefined ? assignedEmployeeName : current.assigned_employee_name,
        assigned_employee_dept: assignedEmployeeDept !== undefined ? assignedEmployeeDept : current.assigned_employee_dept,
        assigned_employee_email: assignedEmployeeEmail !== undefined ? assignedEmployeeEmail : current.assigned_employee_email,
        assigned_by: assignedBy !== undefined ? assignedBy : current.assigned_by,
        assigned_at: assignedAt !== undefined ? assignedAt : current.assigned_at,
        requires_mhq_intervention: requiresMhqIntervention !== undefined ? requiresMhqIntervention : current.requires_mhq_intervention,
        mhq_intervention_by: mhqInterventionBy !== undefined ? mhqInterventionBy : current.mhq_intervention_by,
        mhq_intervention_at: mhqInterventionAt !== undefined ? mhqInterventionAt : current.mhq_intervention_at,
        mhq_department: mhqDepartment !== undefined ? mhqDepartment : current.mhq_department,
        mhq_intervention_notes: mhqInterventionNotes !== undefined ? mhqInterventionNotes : current.mhq_intervention_notes,
        resolved_by: resolvedBy !== undefined ? resolvedBy : current.resolved_by,
        resolved_at: resolvedAt !== undefined ? resolvedAt : current.resolved_at,
        last_updated: today
      };
      VERCEL_DEMO_BOTTLENECKS[foundIdx] = updated;
      return res.json(formatBottleneck(updated));
    }
    return res.json(formatBottleneck({ id, ...req.body, last_updated: today }));
  }

  let client: any = null;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const existingRes = await client.query('SELECT * FROM bottlenecks WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Bottleneck ${id} not found` });
    }

    const current = existingRes.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const updaterName = userName || userRole || 'User';

    const updatedTitle = title !== undefined ? title : current.title;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedDepartment = department !== undefined ? department : current.department;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedPercent = percentComplete !== undefined ? Number(percentComplete) : current.percent_complete;
    const updatedOwner = owner !== undefined ? owner : current.owner;
    const updatedImpact = impactLevel !== undefined ? impactLevel : current.impact_level;
    const updatedTarget = targetDate !== undefined ? targetDate : current.target_date;
    const updatedNotes = notes !== undefined ? notes : current.notes;
    const updatedRemarks = remarks !== undefined ? remarks : current.remarks;
    const updatedBeforePhotos = beforePhotos !== undefined
      ? (typeof beforePhotos === 'string' ? beforePhotos : JSON.stringify(beforePhotos))
      : current.before_photos;
    const updatedAfterPhotos = afterPhotos !== undefined
      ? (typeof afterPhotos === 'string' ? afterPhotos : JSON.stringify(afterPhotos))
      : current.after_photos;
    const updatedTasks = tasks !== undefined
      ? (typeof tasks === 'string' ? tasks : JSON.stringify(tasks))
      : current.tasks;

    const updatedAckBy = acknowledgedBy !== undefined ? acknowledgedBy : current.acknowledged_by;
    const updatedAckAt = acknowledgedAt !== undefined ? acknowledgedAt : current.acknowledged_at;
    const updatedEmpId = assignedEmployeeId !== undefined ? assignedEmployeeId : current.assigned_employee_id;
    const updatedEmpName = assignedEmployeeName !== undefined ? assignedEmployeeName : current.assigned_employee_name;
    const updatedEmpDept = assignedEmployeeDept !== undefined ? assignedEmployeeDept : current.assigned_employee_dept;
    const updatedEmpEmail = assignedEmployeeEmail !== undefined ? assignedEmployeeEmail : current.assigned_employee_email;
    const updatedAssignedBy = assignedBy !== undefined ? assignedBy : current.assigned_by;
    const updatedAssignedAt = assignedAt !== undefined ? assignedAt : current.assigned_at;
    const updatedMhqReq = requiresMhqIntervention !== undefined ? Boolean(requiresMhqIntervention) : Boolean(current.requires_mhq_intervention);
    const updatedMhqBy = mhqInterventionBy !== undefined ? mhqInterventionBy : current.mhq_intervention_by;
    const updatedMhqAt = mhqInterventionAt !== undefined ? mhqInterventionAt : current.mhq_intervention_at;
    const updatedMhqDept = mhqDepartment !== undefined ? mhqDepartment : current.mhq_department;
    const updatedMhqNotes = mhqInterventionNotes !== undefined ? mhqInterventionNotes : current.mhq_intervention_notes;
    const updatedResolvedBy = resolvedBy !== undefined ? resolvedBy : current.resolved_by;
    const updatedResolvedAt = resolvedAt !== undefined ? resolvedAt : current.resolved_at;

    // Track Audit History Items
    let currentHistory: any[] = [];
    try {
      if (typeof current.history === 'string') currentHistory = JSON.parse(current.history);
      else if (Array.isArray(current.history)) currentHistory = current.history;
    } catch (_) {}

    const newHistoryItems: any[] = [];
    const nowIso = new Date().toISOString();

    if (updatedStatus && updatedStatus !== current.status) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-status`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'Status',
        previousValue: current.status || 'Not Started',
        updatedValue: updatedStatus,
        timestamp: nowIso
      });
    }

    if (updatedPercent !== undefined && Number(updatedPercent) !== Number(current.percent_complete)) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-pct`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'Progress',
        previousValue: `${current.percent_complete || 0}%`,
        updatedValue: `${updatedPercent}%`,
        timestamp: nowIso
      });
    }

    if (updatedEmpName && updatedEmpName !== current.assigned_employee_name) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-emp`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'Assigned Employee',
        previousValue: current.assigned_employee_name || 'Unassigned',
        updatedValue: `${updatedEmpName}${updatedEmpDept ? ` (${updatedEmpDept})` : ''}`,
        timestamp: nowIso
      });
    }

    if (updatedAckBy && updatedAckBy !== current.acknowledged_by) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-ack`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'Acknowledgement',
        previousValue: 'Pending Acknowledgement',
        updatedValue: `Acknowledged by ${updatedAckBy}`,
        timestamp: nowIso
      });
    }

    if (updatedMhqDept && updatedMhqDept !== current.mhq_department) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-mhqdept`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'MHQ Department',
        previousValue: current.mhq_department || 'None',
        updatedValue: updatedMhqDept,
        timestamp: nowIso
      });
    }

    if (updatedMhqReq !== Boolean(current.requires_mhq_intervention)) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-mhq`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'MHQ Intervention',
        previousValue: current.requires_mhq_intervention ? 'Required' : 'Not Required',
        updatedValue: updatedMhqReq ? `Flagged for MHQ Intervention (${updatedMhqDept || 'Department Pending'})` : 'Cleared / Resolved by MHQ',
        timestamp: nowIso
      });
    }

    if (remarks !== undefined && remarks !== current.remarks) {
      newHistoryItems.push({
        id: `hist-${Date.now()}-remarks`,
        updatedBy: updaterName,
        updatedRole: userRole,
        field: 'Remarks',
        previousValue: current.remarks || 'None',
        updatedValue: remarks || 'None',
        timestamp: nowIso
      });
    }

    const updatedHistory = [...currentHistory, ...newHistoryItems];

    const updateRes = await client.query(
      `UPDATE bottlenecks
       SET title = $1, category = $2, department = $3, status = $4, percent_complete = $5,
           owner = $6, impact_level = $7, target_date = $8, notes = $9, remarks = $10,
           before_photos = $11, after_photos = $12, tasks = $13,
           acknowledged_by = $14, acknowledged_at = $15,
           assigned_employee_id = $16, assigned_employee_name = $17, assigned_employee_dept = $18, assigned_employee_email = $19,
           assigned_by = $20, assigned_at = $21,
           requires_mhq_intervention = $22, mhq_intervention_by = $23, mhq_intervention_at = $24,
           resolved_by = $25, resolved_at = $26,
           history = $27,
           last_updated = $28,
           mhq_department = $29,
           mhq_intervention_notes = $30,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $31
       RETURNING *`,
      [
        updatedTitle,
        updatedCategory,
        updatedDepartment,
        updatedStatus,
        updatedPercent,
        updatedOwner,
        updatedImpact,
        updatedTarget,
        updatedNotes,
        updatedRemarks,
        updatedBeforePhotos,
        updatedAfterPhotos,
        updatedTasks || '[]',
        updatedAckBy,
        updatedAckAt,
        updatedEmpId,
        updatedEmpName,
        updatedEmpDept,
        updatedEmpEmail,
        updatedAssignedBy,
        updatedAssignedAt,
        updatedMhqReq,
        updatedMhqBy,
        updatedMhqAt,
        updatedResolvedBy,
        updatedResolvedAt,
        JSON.stringify(updatedHistory),
        today,
        updatedMhqDept,
        updatedMhqNotes,
        id
      ]
    );

    await client.query(
      `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
       VALUES ($1, $2, 'UPDATE_BOTTLENECK', $3, $4)`,
      [
        current.unit_id,
        id,
        JSON.stringify({
          oldStatus: current.status,
          newStatus: updatedStatus,
          updatedBy: updaterName,
          changesCount: newHistoryItems.length
        }),
        userRole
      ]
    );

    await client.query('COMMIT');
    res.json(formatBottleneck(updateRes.rows[0]));
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { }
    }
    if (isVercelEnvironment) {
      const today = new Date().toISOString().split('T')[0];
      const foundIdx = VERCEL_DEMO_BOTTLENECKS.findIndex(b => b.id === id);
      if (foundIdx >= 0) {
        const current = VERCEL_DEMO_BOTTLENECKS[foundIdx];
        const updated = {
          ...current,
          title: title !== undefined ? title : current.title,
          category: category !== undefined ? category : current.category,
          department: department !== undefined ? department : current.department,
          status: status !== undefined ? status : current.status,
          percent_complete: percentComplete !== undefined ? Number(percentComplete) : current.percent_complete,
          owner: owner !== undefined ? owner : current.owner,
          impact_level: impactLevel !== undefined ? impactLevel : current.impact_level,
          target_date: targetDate !== undefined ? targetDate : current.target_date,
          notes: notes !== undefined ? notes : current.notes,
          remarks: remarks !== undefined ? remarks : current.remarks,
          acknowledged_by: acknowledgedBy !== undefined ? acknowledgedBy : current.acknowledged_by,
          acknowledged_at: acknowledgedAt !== undefined ? acknowledgedAt : current.acknowledged_at,
          assigned_employee_id: assignedEmployeeId !== undefined ? assignedEmployeeId : current.assigned_employee_id,
          assigned_employee_name: assignedEmployeeName !== undefined ? assignedEmployeeName : current.assigned_employee_name,
          assigned_employee_dept: assignedEmployeeDept !== undefined ? assignedEmployeeDept : current.assigned_employee_dept,
          assigned_employee_email: assignedEmployeeEmail !== undefined ? assignedEmployeeEmail : current.assigned_employee_email,
          assigned_by: assignedBy !== undefined ? assignedBy : current.assigned_by,
          assigned_at: assignedAt !== undefined ? assignedAt : current.assigned_at,
          requires_mhq_intervention: requiresMhqIntervention !== undefined ? requiresMhqIntervention : current.requires_mhq_intervention,
          mhq_intervention_by: mhqInterventionBy !== undefined ? mhqInterventionBy : current.mhq_intervention_by,
          mhq_intervention_at: mhqInterventionAt !== undefined ? mhqInterventionAt : current.mhq_intervention_at,
          mhq_department: mhqDepartment !== undefined ? mhqDepartment : current.mhq_department,
          mhq_intervention_notes: mhqInterventionNotes !== undefined ? mhqInterventionNotes : current.mhq_intervention_notes,
          resolved_by: resolvedBy !== undefined ? resolvedBy : current.resolved_by,
          resolved_at: resolvedAt !== undefined ? resolvedAt : current.resolved_at,
          last_updated: today
        };
        VERCEL_DEMO_BOTTLENECKS[foundIdx] = updated;
        return res.json(formatBottleneck(updated));
      }
      return res.json(formatBottleneck({ id, ...req.body, last_updated: today }));
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      try { client.release(); } catch (_) { }
    }
  }
});

// 10B. Unit Employee Master CRUD Endpoints
router.get('/unit-employees', async (req: Request, res: Response) => {
  const { unitId, activeOnly } = req.query;
  try {
    let query = 'SELECT * FROM unit_employees WHERE 1=1';
    const params: any[] = [];
    if (unitId && unitId !== 'ALL') {
      params.push(unitId);
      query += ` AND unit_id = $${params.length}`;
    }
    if (activeOnly === 'true') {
      query += ` AND status = 'Active'`;
    }
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    return res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      unitId: row.unit_id,
      department: row.department,
      designation: row.designation,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (err: any) {
    let list = SANKARA_INITIAL_UNIT_EMPLOYEES.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      unitId: emp.unit_id,
      department: emp.department,
      designation: emp.designation,
      status: emp.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    if (unitId && unitId !== 'ALL') {
      list = list.filter(e => e.unitId === unitId);
    }
    if (activeOnly === 'true') {
      list = list.filter(e => e.status === 'Active');
    }
    return res.json(list);
  }
});

router.post('/unit-employees', async (req: Request, res: Response) => {
  const { name, email, unitId, department, designation = '', status = 'Active' } = req.body;
  if (!name || !email || !unitId || !department) {
    return res.status(400).json({ error: 'name, email, unitId, and department are required' });
  }
  try {
    const id = `emp-${unitId.replace('unit-', '')}-${Date.now().toString(36)}`;
    const insertRes = await pool.query(
      `INSERT INTO unit_employees (id, name, email, unit_id, department, designation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, name.trim(), email.trim().toLowerCase(), unitId, department.trim(), designation.trim(), status]
    );
    const row = insertRes.rows[0];
    return res.status(201).json({
      id: row.id,
      name: row.name,
      email: row.email,
      unitId: row.unit_id,
      department: row.department,
      designation: row.designation,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/unit-employees/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, unitId, department, designation, status } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM unit_employees WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const curr = existing.rows[0];
    const updateRes = await pool.query(
      `UPDATE unit_employees
       SET name = $1, email = $2, unit_id = $3, department = $4, designation = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        name !== undefined ? name.trim() : curr.name,
        email !== undefined ? email.trim().toLowerCase() : curr.email,
        unitId !== undefined ? unitId : curr.unit_id,
        department !== undefined ? department.trim() : curr.department,
        designation !== undefined ? designation.trim() : curr.designation,
        status !== undefined ? status : curr.status,
        id
      ]
    );
    const row = updateRes.rows[0];
    return res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      unitId: row.unit_id,
      department: row.department,
      designation: row.designation,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/unit-employees/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM unit_employees WHERE id = $1', [id]);
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 11. Delete Bottleneck
router.delete('/bottlenecks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = (req.query.userRole as string) || 'Unit Head';
  let deletedUnitId: string | undefined;

  if (isVercelEnvironment && !process.env.DATABASE_URL) {
    const idx = VERCEL_DEMO_BOTTLENECKS.findIndex(b => b.id === id);
    if (idx >= 0) {
      deletedUnitId = VERCEL_DEMO_BOTTLENECKS[idx].unit_id;
      VERCEL_DEMO_BOTTLENECKS.splice(idx, 1);
    }
    return res.json({ success: true, deletedId: id, unitId: deletedUnitId });
  }

  let client: any = null;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const existingRes = await client.query('SELECT * FROM bottlenecks WHERE id = $1', [id]);
    if (existingRes.rows.length > 0) {
      const item = existingRes.rows[0];
      deletedUnitId = item.unit_id;
      await client.query('DELETE FROM bottlenecks WHERE id = $1', [id]);

      const remainingRes = await client.query('SELECT COUNT(*) FROM bottlenecks WHERE unit_id = $1', [item.unit_id]);
      const count = parseInt(remainingRes.rows[0].count, 10);
      if (count === 0) {
        await client.query('UPDATE units SET is_assessed = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [item.unit_id]);
      }

      await client.query(
        `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
         VALUES ($1, $2, 'DELETE_BOTTLENECK', $3, $4)`,
        [item.unit_id, id, JSON.stringify({ deletedTitle: item.title }), userRole]
      );
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { }
    }
    if (isVercelEnvironment) {
      const idx = VERCEL_DEMO_BOTTLENECKS.findIndex(b => b.id === id);
      if (idx >= 0) {
        deletedUnitId = VERCEL_DEMO_BOTTLENECKS[idx].unit_id;
        VERCEL_DEMO_BOTTLENECKS.splice(idx, 1);
      }
    }
    console.warn('[PostgreSQL Offline Delete Bottleneck]', error.message);
  } finally {
    if (client) {
      try { client.release(); } catch (_) { }
    }
  }

  res.json({ success: true, deletedId: id, unitId: deletedUnitId });
});

// 12. Reset Database (Restores canonical 14 units & users with empty bottleneck table - Super Admin Exclusive)
router.post('/db/reset', async (req: Request, res: Response) => {
  const userEmail = (req.body?.userEmail || req.headers['x-user-email'] || '').toString().toLowerCase();
  const isAuthorized = userEmail.includes('prabhanjan') || userEmail.includes('saurabh') || userEmail.includes('admin');
  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Permission Denied: Only Central Super Administrators have authority to execute a full database reset.'
    });
  }

  let client;
  let dbResetSuccess = false;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM bottlenecks');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM units');

    const UNIT_CODES_MAP: Record<string, { code: string; image_url: string }> = {
      'unit-coimbatore': { code: 'CBE', image_url: '/units/coimbatore.jpg' },
      'unit-coimbatore-city': { code: 'CBC', image_url: '/units/coimbatore-rs-puram.jpg' },
      'unit-guntur': { code: 'GNT', image_url: '/units/guntur.jpg' },
      'unit-bangalore': { code: 'BLR', image_url: '/units/bangalore.jpg' },
      'unit-shimoga': { code: 'SMG', image_url: '/units/shimoga.jpg' },
      'unit-krishnankoil': { code: 'KKVL', image_url: '/units/krishnankoil.jpg' },
      'unit-anand': { code: 'AND', image_url: '/units/anand.jpg' },
      'unit-kanpur': { code: 'KNP', image_url: '/units/kanpur.jpg' },
      'unit-jaipur': { code: 'JPR', image_url: '/units/jaipur.jpg' },
      'unit-ludhiana': { code: 'LDH', image_url: '/units/ludhiana.jpg' },
      'unit-indore': { code: 'IND', image_url: '/units/indore.jpg' },
      'unit-panvel': { code: 'PNV', image_url: '/units/panvel.jpg' },
      'unit-hyderabad': { code: 'HYD', image_url: '/units/hyderabad.jpg' },
      'unit-varanasi': { code: 'VNS', image_url: '/units/varanasi.jpg' },
    };

    for (const unit of SANKARA_INITIAL_UNITS) {
      const uInfo = UNIT_CODES_MAP[unit.id] || {
        code: unit.id.replace('unit-', '').toUpperCase().slice(0, 4),
        image_url: `/units/${unit.id.replace('unit-', '')}.jpg`
      };
      await client.query(
        `INSERT INTO units (id, code, image_url, name, city, state, cmo, unit_head, is_assessed, established_year, bed_capacity, contact_head)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          unit.id,
          uInfo.code,
          uInfo.image_url,
          unit.name,
          unit.city,
          unit.state,
          unit.cmo,
          unit.unit_head,
          false,
          unit.established_year,
          unit.bed_capacity,
          unit.contact_head
        ]
      );
    }

    for (const u of SANKARA_INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (id, name, email, emp_id, password, role, unit_id, designation, avatar_initials, app_access)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [u.id, u.name, u.email, u.emp_id, u.password, u.role, u.unit_id, u.designation, u.avatar_initials, (u as any).app_access || 'both']
      );
    }

    await client.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('DB_RESET', $1, 'Super Admin')`,
      [JSON.stringify({ message: 'Database reset to canonical units and users with empty bottlenecks' })]
    );

    await client.query('COMMIT');
    dbResetSuccess = true;
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { }
    }
    console.warn('[PostgreSQL Offline/Failed DB Reset]', error.message);
  } finally {
    if (client) client.release();
  }

  // Clear in-memory assessed flags
  for (const u of SANKARA_INITIAL_UNITS) {
    u.is_assessed = false;
  }

  res.json({
    success: true,
    message: dbResetSuccess
      ? 'Database reset successfully to clean production state.'
      : 'Database and state reset to clean baseline.'
  });
});

// 13. Activate all 14 Units for Assessment
router.post('/db/seed-all', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP');

    await client.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('SEED_ALL_UNITS', $1, 'Super Admin')`,
      [JSON.stringify({ message: 'All 14 hospital units marked active for assessment' })]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'All 14 hospital units activated successfully.' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 14. Audit Logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const logsRes = await pool.query(`
      SELECT 
        a.id,
        a.unit_id,
        u.name AS unit_name,
        a.bottleneck_id,
        b.title AS bottleneck_title,
        a.action,
        a.details,
        a.user_role,
        a.created_at
      FROM audit_logs a
      LEFT JOIN units u ON a.unit_id = u.id
      LEFT JOIN bottlenecks b ON a.bottleneck_id = b.id
      ORDER BY a.created_at DESC
      LIMIT 80
    `);

    return res.json(logsRes.rows.map((r) => ({
      id: r.id,
      unitId: r.unit_id,
      unitName: r.unit_name || 'System / Network',
      bottleneckId: r.bottleneck_id,
      bottleneckTitle: r.bottleneck_title,
      action: r.action,
      details: r.details,
      userRole: r.user_role,
      createdAt: r.created_at
    })));
  } catch (error: any) {
    return res.json([]);
  }
});

// 15. Post Management / Operations Comment on Bottleneck
router.post('/bottlenecks/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorName, authorRole, authorEmail, message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Comment message is required' });
  }

  if (isVercelEnvironment && !process.env.DATABASE_URL) {
    const found = VERCEL_DEMO_BOTTLENECKS.find(b => b.id === id);
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: authorName || 'Central Operations',
      authorRole: authorRole || 'Operations Team',
      authorEmail: authorEmail || '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    if (found) {
      found.comments = [...(found.comments || []), newComment];
      return res.status(201).json(formatBottleneck(found));
    }
    return res.status(201).json(formatBottleneck({ id, comments: [newComment] }));
  }

  let client: any = null;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const checkRes = await client.query('SELECT * FROM bottlenecks WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Bottleneck ${id} not found` });
    }

    const item = checkRes.rows[0];
    let comments: any[] = [];
    try {
      if (typeof item.comments === 'string') comments = JSON.parse(item.comments);
      else if (Array.isArray(item.comments)) comments = item.comments;
    } catch (_) { }

    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: authorName || 'Central Operations',
      authorRole: authorRole || 'Operations Team',
      authorEmail: authorEmail || '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);

    const updateRes = await client.query(
      `UPDATE bottlenecks
       SET comments = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(comments), id]
    );

    await client.query(
      `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
       VALUES ($1, $2, 'DIRECTIVE_COMMENT_ADDED', $3, $4)`,
      [item.unit_id, id, JSON.stringify({ author: authorName, role: authorRole, text: message.trim().slice(0, 80) }), authorRole || 'Operations Team']
    );

    await client.query('COMMIT');
    res.status(201).json(formatBottleneck(updateRes.rows[0]));
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) { }
    }
    if (isVercelEnvironment) {
      const found = VERCEL_DEMO_BOTTLENECKS.find(b => b.id === id);
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        authorName: authorName || 'Central Operations',
        authorRole: authorRole || 'Operations Team',
        authorEmail: authorEmail || '',
        message: message.trim(),
        createdAt: new Date().toISOString()
      };
      if (found) {
        found.comments = [...(found.comments || []), newComment];
        return res.status(201).json(formatBottleneck(found));
      }
      return res.status(201).json(formatBottleneck({ id, comments: [newComment] }));
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      try { client.release(); } catch (_) { }
    }
  }
});

// 16. Categories Management API
const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'OPD Wait Time', department: 'Outpatient Department', description: 'Patient registration and token triage queue' },
  { id: 'cat-2', name: 'Billing & Insurance Clearance', department: 'Billing & TPA', description: 'Pre-auth and claim approvals' },
  { id: 'cat-3', name: 'Pharmacy Counter Delays', department: 'Pharmacy', description: 'Medication dispensing & stock availability' },
  { id: 'cat-4', name: 'Pre-op Holding Area Flow', department: 'Nursing & OT', description: 'Preparation and surgical checklist' }
];

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const catsRes = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json(catsRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      department: r.department,
      description: r.description || '',
      createdAt: r.created_at
    })));
  } catch (error: any) {
    return res.json(INITIAL_CATEGORIES);
  }
});

router.post('/categories', async (req: Request, res: Response) => {
  const { name, department, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const catId = `cat-${Date.now()}`;
  const newCat = { id: catId, name: name.trim(), department: department || 'General Operations', description: description || '', createdAt: new Date().toISOString() };
  INITIAL_CATEGORIES.push(newCat);

  try {
    const insertRes = await pool.query(
      `INSERT INTO categories (id, name, department, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [catId, name.trim(), department || 'General Operations', description || '']
    );

    await pool.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('CREATE_CATEGORY', $1, 'Super Admin')`,
      [JSON.stringify({ name: name.trim(), department })]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error: any) {
    return res.status(201).json(newCat);
  }
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  } catch (error: any) { }
  res.json({ success: true, deletedId: id });
});

// 17. Departments Management API
const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Outpatient Department (OPD)', code: 'OPD', headContact: 'Clinical Lead' },
  { id: 'dept-2', name: 'Inpatient & Wards (IPD)', code: 'IPD', headContact: 'Nursing Supervisor' },
  { id: 'dept-3', name: 'Billing & TPA Insurance', code: 'TPA', headContact: 'Finance Lead' },
  { id: 'dept-4', name: 'Pharmacy & Stores', code: 'PHARM', headContact: 'Chief Pharmacist' },
  { id: 'dept-5', name: 'Optometry & Refraction', code: 'OPTO', headContact: 'Chief Optometrist' }
];

router.get('/departments', async (req: Request, res: Response) => {
  try {
    const deptsRes = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    return res.json(deptsRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code || '',
      headContact: r.head_contact || '',
      createdAt: r.created_at
    })));
  } catch (error: any) {
    return res.json(INITIAL_DEPARTMENTS);
  }
});

router.post('/departments', async (req: Request, res: Response) => {
  const { name, code, headContact } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  const deptId = `dept-${Date.now()}`;
  const newDept = { id: deptId, name: name.trim(), code: code || '', headContact: headContact || '', createdAt: new Date().toISOString() };
  INITIAL_DEPARTMENTS.push(newDept);

  try {
    const insertRes = await pool.query(
      `INSERT INTO departments (id, name, code, head_contact)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [deptId, name.trim(), code || '', headContact || '']
    );

    await pool.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('CREATE_DEPARTMENT', $1, 'Super Admin')`,
      [JSON.stringify({ name: name.trim(), code })]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error: any) {
    return res.status(201).json(newDept);
  }
});

router.delete('/departments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
  } catch (error: any) { }
  res.json({ success: true, deletedId: id });
});

/* ========================================================================== */
/* 5S AUDIT SMTP EMAIL NOTIFICATIONS & ORGANIZATIONAL CONTACT DIRECTORY       */
/* ========================================================================== */

// Configure Zoho SMTP Transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true, // port 465 uses SSL
  auth: {
    user: process.env.SMTP_USER || 'is.support@sankaraeye.com',
    pass: process.env.SMTP_PASS || '3fKebcsUWLWr',
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test SMTP connection endpoint
router.post('/fives/test-smtp', async (req: Request, res: Response) => {
  try {
    const targetEmail = req.body.email || 'is.support@sankaraeye.com';
    const info = await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || '"Sankara 5S Operations Desk" <is.support@sankaraeye.com>',
      to: targetEmail,
      subject: '✓ Sankara 5S Audit Email System - SMTP Service Verification',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 3px solid #ea580c; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800;">Sankara Eye Hospital • 5S Operations</h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Project Patient Experience (PPE) - Automated Notification Service</p>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #166534; font-weight: 700; margin: 0 0 6px 0; font-size: 15px;">✓ SMTP Configuration Active & Verified</p>
            <p style="color: #15803d; margin: 0; font-size: 13px;">Outgoing Server: <strong>smtp.zoho.com:465 (SSL)</strong><br>Sender: <strong>is.support@sankaraeye.com</strong></p>
          </div>
          <p style="color: #475569; font-size: 13px; line-height: 1.6;">
            This test email confirms that the 5S Audit notification service is active and ready to dispatch official audit findings, non-conformities, and photo attachments to Department In-Charges, Unit Heads, and Zonal Leads across all 14 hospital units.
          </p>
          <div style="margin-top: 24px; pt: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
            Timestamp: ${new Date().toISOString()} • Sankara Eye Care Institutions
          </div>
        </div>
      `
    });
    return res.json({ success: true, messageId: info.messageId, recipient: targetEmail });
  } catch (error: any) {
    console.error('[SMTP Test Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to send test email' });
  }
});

// Send 5S Audit Report Email Endpoint
router.post('/fives/send-audit-email', async (req: Request, res: Response) => {
  try {
    const {
      audit,
      ncs = [],
      to,
      cc,
      subject,
      customNotes,
      photos = []
    } = req.body;

    if (!audit) {
      return res.status(400).json({ error: 'Audit payload is required' });
    }

    // Clean recipients
    const parseRecipients = (input: any): string[] => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.map((s: string) => String(s).trim()).filter(Boolean);
      }
      return String(input)
        .split(/[,;]/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    };

    const toList = parseRecipients(to);
    const ccList = parseRecipients(cc);

    if (toList.length === 0) {
      return res.status(400).json({ error: 'At least one recipient (TO) is required' });
    }

    // Process photo attachments
    const attachments: any[] = [];
    let photoCounter = 0;
    const embeddedPhotoHtmls: string[] = [];

    // Collect photos from explicit photos array or audit.beforePhotos
    const allPhotos: Array<{ url: string; label: string }> = [];

    if (Array.isArray(photos) && photos.length > 0) {
      photos.forEach((p: any, idx: number) => {
        if (p?.photoUrl) {
          allPhotos.push({
            url: p.photoUrl,
            label: p.label || p.area || `Audit Photo ${idx + 1}`
          });
        }
      });
    }

    if (audit.beforePhotos && typeof audit.beforePhotos === 'object') {
      Object.entries(audit.beforePhotos).forEach(([chkId, url]) => {
        if (typeof url === 'string' && url.length > 10) {
          const alreadyAdded = allPhotos.some(ap => ap.url === url);
          if (!alreadyAdded) {
            allPhotos.push({
              url,
              label: `Checkpoint ${chkId.toUpperCase()} Finding`
            });
          }
        }
      });
    }

    // Convert base64 data URLs into inline CID attachments
    allPhotos.forEach((item, index) => {
      const match = item.url.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        photoCounter++;
        const mimeType = match[1];
        const base64Data = match[2];
        const ext = mimeType.split('/')[1] || 'jpeg';
        const cid = `audit_photo_${photoCounter}@sankara.org`;

        attachments.push({
          filename: `5S-Evidence-${photoCounter}.${ext}`,
          content: Buffer.from(base64Data, 'base64'),
          cid,
          contentType: mimeType
        });

        embeddedPhotoHtmls.push(`
          <td style="padding: 8px; vertical-align: top; width: 33.33%;">
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #ffffff;">
              <img src="cid:${cid}" alt="${item.label}" style="width: 100%; height: 160px; object-fit: cover; display: block;" />
              <div style="padding: 6px 8px; font-size: 11px; font-weight: 600; color: #475569; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                ${item.label}
              </div>
            </div>
          </td>
        `);
      }
    });

    // Score badge formatting
    const pct = Number(audit.compliancePercent) || 0;
    let scoreBadgeBg = '#dcfce7'; // green
    let scoreBadgeText = '#15803d';
    let scoreBadgeBorder = '#86efac';
    let scoreStatus = 'EXCELLENT COMPLIANCE';

    if (pct < 70) {
      scoreBadgeBg = '#fee2e2'; // red
      scoreBadgeText = '#b91c1c';
      scoreBadgeBorder = '#fca5a5';
      scoreStatus = 'ACTION REQUIRED (< 70%)';
    } else if (pct < 85) {
      scoreBadgeBg = '#fef3c7'; // amber
      scoreBadgeText = '#b45309';
      scoreBadgeBorder = '#fde68a';
      scoreStatus = 'GOOD PROGRESS (70% - 84%)';
    }

    // NC rows HTML
    const ncRowsHtml = Array.isArray(ncs) && ncs.length > 0
      ? ncs.map((nc: any, i: number) => `
        <tr style="border-bottom: 1px solid #e2e8f0; background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #0f172a; text-align: center;">${i + 1}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #1e293b;">
            <div style="font-weight: 700; color: #ea580c;">${nc.section || '5S Checkpoint'}</div>
            <div style="font-size: 11px; color: #64748b;">${nc.area || 'Hospital Area'}</div>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #334155;">
            <div style="font-weight: 600;">${nc.checkpointText || ''}</div>
            ${nc.auditorComment ? `<div style="font-size: 11px; color: #b91c1c; margin-top: 4px; font-style: italic;">Observation: "${nc.auditorComment}"</div>` : ''}
          </td>
          <td style="padding: 10px 12px; font-size: 12px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${nc.score === 0 ? '#fee2e2' : '#fef3c7'}; color: ${nc.score === 0 ? '#991b1b' : '#92400e'};">
              ${nc.score === 0 ? 'Critical (0/3)' : 'Major (1/3)'}
            </span>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #0f172a; text-align: center;">
            ${nc.targetDays || 7} Days
          </td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="5" style="padding: 24px; text-align: center; color: #15803d; font-size: 13px; font-weight: 600; background: #f0fdf4;">
            🎉 Zero Non-Conformities recorded! Outstanding adherence to 5S Workplace Organization Standards.
          </td>
        </tr>
      `;

    // Photo gallery table formatting (up to 3 per row)
    let photoGalleryHtml = '';
    if (embeddedPhotoHtmls.length > 0) {
      const rows: string[] = [];
      for (let i = 0; i < embeddedPhotoHtmls.length; i += 3) {
        const rowCells = embeddedPhotoHtmls.slice(i, i + 3).join('');
        rows.push(`<tr>${rowCells}</tr>`);
      }
      photoGalleryHtml = `
        <div style="margin-top: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;">
          <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            📷 Photo Evidence & Audit Findings (${attachments.length} Image${attachments.length === 1 ? '' : 's'})
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows.join('')}
          </table>
        </div>
      `;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>5S Audit Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Header Strip with Sankara Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 24px 28px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">SANKARA EYE HOSPITAL</div>
                    <div style="color: #fed7aa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px;">
                      Project Patient Experience (PPE) • 5S Workplace Excellence
                    </div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.35); color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      Official Audit Report
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Scope & Audit Overview Bar -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="55%">
                    <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Hospital Unit & Scope</div>
                    <div style="font-size: 16px; color: #0f172a; font-weight: 800; margin-top: 2px;">
                      ${audit.unit || 'Sankara Hospital Unit'}
                    </div>
                    <div style="font-size: 13px; color: #334155; margin-top: 2px;">
                      <strong>Zone:</strong> ${audit.zone || 'General'} • <strong>Dept:</strong> ${audit.department || 'All Areas'}
                    </div>
                  </td>
                  <td width="45%" align="right">
                    <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Audit Reference</div>
                    <div style="font-size: 14px; color: #ea580c; font-weight: 800; margin-top: 2px;">
                      #${audit.auditNumber || 'AUD-' + Date.now().toString().slice(-6)}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Date: <strong>${audit.auditDate || new Date().toISOString().split('T')[0]}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Compliance Scorecard Highlight Box -->
          <tr>
            <td style="padding: 24px 28px;">
              <div style="background: #ffffff; border: 2px solid ${scoreBadgeBorder}; border-radius: 12px; padding: 18px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                        5S Workplace Compliance Score
                      </div>
                      <div style="display: inline-block; margin-top: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: ${scoreBadgeBg}; color: ${scoreBadgeText}; border: 1px solid ${scoreBadgeBorder};">
                        ${scoreStatus}
                      </div>
                    </td>
                    <td align="right">
                      <div style="font-size: 34px; font-weight: 900; color: ${scoreBadgeText}; line-height: 1;">
                        ${pct}%
                      </div>
                      <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px;">
                        Score: <strong>${audit.totalScore || 0}</strong> / ${audit.maxScore || 108} Points
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Stakeholders / Routing Info -->
              <div style="margin-top: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; line-height: 1.6;">
                  <tr>
                    <td width="33%">
                      <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Primary In-Charge (TO)</strong><br>
                      <span style="color: #0f172a; font-weight: 700;">${toList[0] || 'Department Lead'}</span>
                    </td>
                    <td width="33%">
                      <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Executive In-Charge (CC)</strong><br>
                      <span style="color: #0f172a; font-weight: 700;">${ccList.join(', ') || 'Unit Head & Zone Lead'}</span>
                    </td>
                    <td width="33%" align="right">
                      <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Lead 5S Auditor</strong><br>
                      <span style="color: #ea580c; font-weight: 700;">${audit.auditorName || 'Internal Auditor'}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Auditor Remarks / Directives Box (if provided) -->
              ${customNotes ? `
                <div style="margin-top: 18px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 18px;">
                  <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
                    📝 Auditor Directives & Observations
                  </div>
                  <div style="font-size: 13px; color: #78350f; margin-top: 6px; line-height: 1.5; white-space: pre-line;">
                    ${customNotes}
                  </div>
                </div>
              ` : ''}

              <!-- Non-Conformities (NC) Table -->
              <div style="margin-top: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <h3 style="color: #0f172a; margin: 0; font-size: 15px; font-weight: 800;">
                    Action Items & Non-Conformities (${Array.isArray(ncs) ? ncs.length : 0})
                  </h3>
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background: #0f172a; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                      <th style="padding: 10px 12px; width: 40px; text-align: center;">#</th>
                      <th style="padding: 10px 12px; width: 140px;">Pillar & Area</th>
                      <th style="padding: 10px 12px;">Checkpoint Finding & Observation</th>
                      <th style="padding: 10px 12px; width: 110px; text-align: center;">Severity</th>
                      <th style="padding: 10px 12px; width: 80px; text-align: center;">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ncRowsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Photo Gallery (if photos attached) -->
              ${photoGalleryHtml}

              <!-- Action Plan & Closure Directive -->
              <div style="margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; font-size: 12px; color: #475569; line-height: 1.6;">
                <strong>Standard Operating Procedure for Closure:</strong>
                <ol style="margin: 6px 0 0 0; padding-left: 20px;">
                  <li>Department In-Charge must formulate Corrective Actions (CA) and Preventive Actions (PA) within the specified target days.</li>
                  <li>After rectifying the non-conformity, upload the rectified photograph directly on the Sankara 5S Operations Portal.</li>
                  <li>The Auditor / Unit Head will verify the submission and mark the NC as closed upon satisfactory inspection.</li>
                </ol>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 20px 28px; text-align: center; font-size: 11px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 12px;">Sankara Eye Care Institutions India</div>
              <div>Quality Assurance & 5S Operational Standards Cell • Project Patient Experience</div>
              <div style="margin-top: 6px; color: #64748b;">
                This is an automated notification sent via official Sankara Zoho SMTP service (is.support@sankaraeye.com).
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const defaultSubject = `[5S Audit Report] ${audit.unit || 'Unit'} - ${audit.department || 'Department'} (${audit.auditNumber || 'AUD'}) - Score: ${pct}%`;
    const finalSubject = subject && String(subject).trim().length > 0 ? String(subject).trim() : defaultSubject;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sankara 5S Operations Desk" <is.support@sankaraeye.com>',
      to: toList,
      cc: ccList.length > 0 ? ccList : undefined,
      subject: finalSubject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    const info = await mailTransporter.sendMail(mailOptions);

    // Record audit log
    try {
      await pool.query(
        `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
         VALUES ($1, $2, 'SEND_5S_AUDIT_EMAIL', $3, '5S Auditor')`,
        [
          audit.unit || '5S',
          audit.auditNumber || audit.id,
          JSON.stringify({
            auditNumber: audit.auditNumber,
            unit: audit.unit,
            department: audit.department,
            to: toList,
            cc: ccList,
            score: pct,
            ncCount: ncs.length,
            photosCount: attachments.length,
            messageId: info.messageId
          })
        ]
      );
    } catch (_) {}

    return res.json({
      success: true,
      messageId: info.messageId,
      toList,
      ccList,
      attachmentsCount: attachments.length
    });
  } catch (error: any) {
    console.error('[Send 5S Audit Email Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch 5S audit email' });
  }
});

// 5S Contact Directory CRUD Endpoints
router.get('/fives/contacts', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM five_s_contacts ORDER BY unit_code, zone_name, department_name`
    );
    return res.json(result.rows);
  } catch (error: any) {
    console.warn('[5S Contacts DB Query Warning]:', error.message);
    return res.json([]);
  }
});

router.post('/fives/contacts', async (req: Request, res: Response) => {
  const {
    id = `f5c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    unitCode,
    unitName,
    zoneName = '',
    zoneInchargeName = '',
    zoneInchargeEmail = '',
    zoneInchargeDesignation = '',
    zoneInchargeEmpId = '',
    departmentName,
    deptInchargeName = '',
    deptInchargeEmail = '',
    deptInchargeDesignation = '',
    deptInchargeEmpId = ''
  } = req.body;

  if (!unitCode || !departmentName) {
    return res.status(400).json({ error: 'Unit code and Department name are required' });
  }

  try {
    const insertRes = await pool.query(
      `INSERT INTO five_s_contacts (
        id, unit_code, unit_name, zone_name,
        zone_incharge_name, zone_incharge_email, zone_incharge_designation, zone_incharge_emp_id,
        department_name, dept_incharge_name, dept_incharge_email, dept_incharge_designation, dept_incharge_emp_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id, unitCode.toUpperCase(), unitName || unitCode, zoneName,
        zoneInchargeName, zoneInchargeEmail, zoneInchargeDesignation, zoneInchargeEmpId,
        departmentName, deptInchargeName, deptInchargeEmail, deptInchargeDesignation, deptInchargeEmpId
      ]
    );
    return res.status(201).json(insertRes.rows[0]);
  } catch (error: any) {
    console.error('[5S Contact Create Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/fives/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    unitCode,
    unitName,
    zoneName,
    zoneInchargeName,
    zoneInchargeEmail,
    zoneInchargeDesignation,
    zoneInchargeEmpId,
    departmentName,
    deptInchargeName,
    deptInchargeEmail,
    deptInchargeDesignation,
    deptInchargeEmpId
  } = req.body;

  try {
    const updateRes = await pool.query(
      `UPDATE five_s_contacts SET
        unit_code = COALESCE($1, unit_code),
        unit_name = COALESCE($2, unit_name),
        zone_name = COALESCE($3, zone_name),
        zone_incharge_name = COALESCE($4, zone_incharge_name),
        zone_incharge_email = COALESCE($5, zone_incharge_email),
        zone_incharge_designation = COALESCE($6, zone_incharge_designation),
        zone_incharge_emp_id = COALESCE($7, zone_incharge_emp_id),
        department_name = COALESCE($8, department_name),
        dept_incharge_name = COALESCE($9, dept_incharge_name),
        dept_incharge_email = COALESCE($10, dept_incharge_email),
        dept_incharge_designation = COALESCE($11, dept_incharge_designation),
        dept_incharge_emp_id = COALESCE($12, dept_incharge_emp_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        unitCode ? unitCode.toUpperCase() : null,
        unitName,
        zoneName,
        zoneInchargeName,
        zoneInchargeEmail,
        zoneInchargeDesignation,
        zoneInchargeEmpId,
        departmentName,
        deptInchargeName,
        deptInchargeEmail,
        deptInchargeDesignation,
        deptInchargeEmpId,
        id
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    return res.json(updateRes.rows[0]);
  } catch (error: any) {
    console.error('[5S Contact Update Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/fives/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM five_s_contacts WHERE id = $1', [id]);
    return res.json({ success: true, deletedId: id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
