import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, Client } = pg;

// Database connection config
const DB_NAME = process.env.PGDATABASE || 'sankara_px';
const DB_USER = process.env.PGUSER || process.env.USER || 'postgres';
const DB_HOST = process.env.PGHOST || 'localhost';
const DB_PORT = parseInt(process.env.PGPORT || '5432', 10);
const DB_PASSWORD = process.env.PGPASSWORD || '';

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: DB_USER,
        host: DB_HOST,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: DB_PORT,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
);

// Comprehensive list of 14 Sankara Eye Hospital Units
export const SANKARA_INITIAL_UNITS = [
  {
    id: 'unit-anand',
    name: 'Sankara Eye Hospital – Anand',
    city: 'Anand',
    state: 'Gujarat',
    is_assessed: true,
    established_year: 2017,
    bed_capacity: 100,
    contact_head: 'Dr. H. Patel'
  },
  {
    id: 'unit-bangalore',
    name: 'Sankara Eye Hospital – Bangalore',
    city: 'Bengaluru',
    state: 'Karnataka',
    is_assessed: true,
    established_year: 2008,
    bed_capacity: 150,
    contact_head: 'Dr. M. Swaminathan'
  },
  {
    id: 'unit-coimbatore',
    name: 'Sankara Eye Hospital – Coimbatore',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    is_assessed: true,
    established_year: 1977,
    bed_capacity: 250,
    contact_head: 'Dr. R. Ramakrishnan'
  },
  {
    id: 'unit-coimbatore-city',
    name: 'Sankara Eye Centre – Coimbatore City (R.S. Puram)',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    is_assessed: true,
    established_year: 1985,
    bed_capacity: 80,
    contact_head: 'Dr. S. K. Narayanan'
  },
  {
    id: 'unit-guntur',
    name: 'Sankara Eye Hospital – Guntur',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    is_assessed: true,
    established_year: 2014,
    bed_capacity: 115,
    contact_head: 'Dr. C. Prasad'
  },
  {
    id: 'unit-jaipur',
    name: 'Sankara Eye Hospital – Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    is_assessed: true,
    established_year: 2022,
    bed_capacity: 105,
    contact_head: 'Dr. V. Rathore'
  },
  {
    id: 'unit-kanpur',
    name: 'Sankara Eye Hospital – Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    is_assessed: true,
    established_year: 2020,
    bed_capacity: 110,
    contact_head: 'Dr. A. Agarwal'
  },
  {
    id: 'unit-krishnankoil',
    name: 'Sankara Eye Hospital – Krishnankoil',
    city: 'Krishnankoil',
    state: 'Tamil Nadu',
    is_assessed: true,
    established_year: 2004,
    bed_capacity: 110,
    contact_head: 'Dr. S. Vijay'
  },
  {
    id: 'unit-ludhiana',
    name: 'Sankara Eye Hospital – Ludhiana',
    city: 'Ludhiana',
    state: 'Punjab',
    is_assessed: true,
    established_year: 2019,
    bed_capacity: 100,
    contact_head: 'Dr. G. Singh'
  },
  {
    id: 'unit-shimoga',
    name: 'Sankara Eye Hospital – Shimoga',
    city: 'Shivamogga (Shimoga)',
    state: 'Karnataka',
    is_assessed: true,
    established_year: 2011,
    bed_capacity: 100,
    contact_head: 'Dr. B. Hegde'
  },
  {
    id: 'unit-indore',
    name: 'Sankara Eye Centre – Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    is_assessed: true,
    established_year: 2021,
    bed_capacity: 95,
    contact_head: 'Dr. R. Sharma'
  },
  {
    id: 'unit-panvel',
    name: 'RJ Sankara Eye Hospital – Panvel',
    city: 'Panvel / Navi Mumbai',
    state: 'Maharashtra',
    is_assessed: true,
    established_year: 2018,
    bed_capacity: 120,
    contact_head: 'Dr. Neha V.'
  },
  {
    id: 'unit-hyderabad',
    name: 'Sankara Eye Hospital – Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    is_assessed: true,
    established_year: 2023,
    bed_capacity: 130,
    contact_head: 'Dr. K. Reddy'
  },
  {
    id: 'unit-varanasi',
    name: 'RJ Sankara Eye Hospital – Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    is_assessed: true,
    established_year: 2021,
    bed_capacity: 85,
    contact_head: 'Dr. T. Rao'
  }
];

// Predefined Sankara users
export const SANKARA_INITIAL_USERS = [
  {
    id: 'user-prabhanjan-superadmin',
    name: 'Prabhanjan',
    email: 'prabhanjan@sankaraeye.com',
    emp_id: '010177',
    password: 'Sankara@123',
    role: 'Super Admin',
    unit_id: null,
    designation: 'Super Admin • Central Directorate',
    avatar_initials: 'PR'
  },
  {
    id: 'user-superadmin',
    name: 'Super Admin',
    email: 'superadmin@sankara.com',
    emp_id: '010001',
    password: 'admin123',
    role: 'Super Admin',
    unit_id: null,
    designation: 'Chief Medical Director & Founder',
    avatar_initials: 'SA'
  },
  {
    id: 'user-president',
    name: 'President (Operations)',
    email: 'president@sankara.com',
    emp_id: '010002',
    password: 'admin123',
    role: 'Operations Team',
    unit_id: null,
    designation: 'President of Hospital Operations',
    avatar_initials: 'PO'
  },
  {
    id: 'user-operations',
    name: 'Operations Directorate',
    email: 'operations@sankara.com',
    emp_id: '010003',
    password: 'admin123',
    role: 'Operations Team',
    unit_id: null,
    designation: 'Patient Experience & Quality Lead',
    avatar_initials: 'OP'
  },
  // 14 Unit Heads
  {
    id: 'user-anand-head',
    name: 'Dr. H. Patel',
    email: 'unithead.anand@sankara.com',
    emp_id: 'UH-AND-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-anand',
    designation: 'Anand Unit Head / Medical Director',
    avatar_initials: 'HP'
  },
  {
    id: 'user-bangalore-head',
    name: 'Dr. M. Swaminathan',
    email: 'unithead.bangalore@sankara.com',
    emp_id: 'UH-BLR-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-bangalore',
    designation: 'Bangalore Unit Head / Medical Director',
    avatar_initials: 'MS'
  },
  {
    id: 'user-coimbatore-head',
    name: 'Dr. R. Ramakrishnan',
    email: 'unithead.coimbatore@sankara.com',
    emp_id: 'UH-CBE-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-coimbatore',
    designation: 'Coimbatore HQ Unit Head / Medical Director',
    avatar_initials: 'RR'
  },
  {
    id: 'user-coimbatore-city-head',
    name: 'Dr. S. K. Narayanan',
    email: 'unithead.coimbatorecity@sankara.com',
    emp_id: 'UH-CBC-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-coimbatore-city',
    designation: 'Coimbatore City (R.S. Puram) Unit Head',
    avatar_initials: 'SN'
  },
  {
    id: 'user-guntur-head',
    name: 'Dr. C. Prasad',
    email: 'unithead.guntur@sankara.com',
    emp_id: 'UH-GNT-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-guntur',
    designation: 'Guntur Unit Head / Medical Director',
    avatar_initials: 'CP'
  },
  {
    id: 'user-jaipur-head',
    name: 'Dr. V. Rathore',
    email: 'unithead.jaipur@sankara.com',
    emp_id: 'UH-JPR-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-jaipur',
    designation: 'Jaipur Unit Head / Medical Director',
    avatar_initials: 'VR'
  },
  {
    id: 'user-kanpur-head',
    name: 'Dr. A. Agarwal',
    email: 'unithead.kanpur@sankara.com',
    emp_id: 'UH-KNP-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-kanpur',
    designation: 'Kanpur Unit Head / Medical Director',
    avatar_initials: 'AA'
  },
  {
    id: 'user-krishnankoil-head',
    name: 'Dr. S. Vijay',
    email: 'unithead.krishnankoil@sankara.com',
    emp_id: 'UH-KRK-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-krishnankoil',
    designation: 'Krishnankoil Unit Head / Medical Director',
    avatar_initials: 'SV'
  },
  {
    id: 'user-ludhiana-head',
    name: 'Dr. G. Singh',
    email: 'unithead.ludhiana@sankara.com',
    emp_id: 'UH-LDH-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-ludhiana',
    designation: 'Ludhiana Unit Head / Medical Director',
    avatar_initials: 'GS'
  },
  {
    id: 'user-shimoga-head',
    name: 'Dr. B. Hegde',
    email: 'unithead.shimoga@sankara.com',
    emp_id: 'UH-SHM-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-shimoga',
    designation: 'Shimoga Unit Head / Medical Director',
    avatar_initials: 'BH'
  },
  {
    id: 'user-indore-head',
    name: 'Dr. R. Sharma',
    email: 'unithead.indore@sankara.com',
    emp_id: 'UH-IND-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-indore',
    designation: 'Indore Unit Head / Medical Director',
    avatar_initials: 'RS'
  },
  {
    id: 'user-panvel-head',
    name: 'Dr. Neha V.',
    email: 'unithead.panvel@sankara.com',
    emp_id: 'UH-PNV-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-panvel',
    designation: 'Panvel Unit Head / Medical Director',
    avatar_initials: 'NV'
  },
  {
    id: 'user-hyderabad-head',
    name: 'Dr. K. Reddy',
    email: 'unithead.hyderabad@sankara.com',
    emp_id: 'UH-HYD-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-hyderabad',
    designation: 'Hyderabad Unit Head / Medical Director',
    avatar_initials: 'KR'
  },
  {
    id: 'user-varanasi-head',
    name: 'Dr. T. Rao',
    email: 'unithead.varanasi@sankara.com',
    emp_id: 'UH-VNS-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-varanasi',
    designation: 'Varanasi Unit Head / Medical Director',
    avatar_initials: 'TR'
  }
];

export const INITIAL_BOTTLENECKS = [
  // Coimbatore HQ
  {
    id: 'coimbatore-1',
    unit_id: 'unit-coimbatore',
    title: 'Super-specialty OPD consultation wait time > 90 mins',
    category: 'OPD Wait Time',
    status: 'In Progress',
    percent_complete: 70,
    owner: 'Dr. R. Ramakrishnan (Medical Dir)',
    last_updated: '2026-07-28',
    impact_level: 'High',
    target_date: '2026-08-10',
    notes: 'Implementing strict appointment slotting for Retina and Cornea clinics.'
  },
  {
    id: 'coimbatore-2',
    unit_id: 'unit-coimbatore',
    title: 'Real-time patient location tracking across 4 floors',
    category: 'Real-time Patient Tracking',
    status: 'In Progress',
    percent_complete: 90,
    owner: 'Senthil V. (IT Infrastructure)',
    last_updated: '2026-07-27',
    impact_level: 'High',
    target_date: '2026-08-01',
    notes: 'BLE beacon tags tested on 500 patients; dashboard active.'
  },
  {
    id: 'coimbatore-3',
    unit_id: 'unit-coimbatore',
    title: 'Private ward deluxe room cleaning turnaround time',
    category: 'Private Room Capacity',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Lakshmi N. (Facility Mgr)',
    last_updated: '2026-07-19',
    impact_level: 'Medium',
    target_date: '2026-07-19',
    notes: 'Housekeeping turnaround reduced from 50 min to 22 min.'
  },
  {
    id: 'coimbatore-4',
    unit_id: 'unit-coimbatore',
    title: 'Dilation queue management during peak retina morning clinics',
    category: 'Dilation & Buzzer Alert System',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Dr. Chitra M. (Retina Head)',
    last_updated: '2026-07-22',
    impact_level: 'High',
    target_date: '2026-07-22',
    notes: 'Smart vibrating buzzers auto-trigger when dilation timer completes.'
  },
  {
    id: 'coimbatore-5',
    unit_id: 'unit-coimbatore',
    title: 'Pre-surgery systemic blood test report delays',
    category: 'Lab Turnaround',
    status: 'In Progress',
    percent_complete: 80,
    owner: 'Dr. S. Sundar (Lab Incharge)',
    last_updated: '2026-07-26',
    impact_level: 'High',
    target_date: '2026-08-05',
    notes: 'STAT lab counter established inside daycare surgical ward.'
  },
  {
    id: 'coimbatore-6',
    unit_id: 'unit-coimbatore',
    title: 'Monthly surgical complication & redo audit review',
    category: 'Surgical Redo Audits',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Dr. R. Ramakrishnan (Medical Dir)',
    last_updated: '2026-07-14',
    impact_level: 'High',
    target_date: '2026-07-14',
    notes: 'Digital audit log integrated into EMR with root cause classification.'
  },
  {
    id: 'coimbatore-7',
    unit_id: 'unit-coimbatore',
    title: 'Express registration counter for repeat/follow-up patients',
    category: 'Registration Delays',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Karthik P. (Patient Experience)',
    last_updated: '2026-07-18',
    impact_level: 'Medium',
    target_date: '2026-07-18',
    notes: 'QR-code self-check-in station launched at lobby entrance.'
  },

  // Panvel Unit
  {
    id: 'panvel-1',
    unit_id: 'unit-panvel',
    title: 'Peak hour registration counter queue bottleneck',
    category: 'Registration Delays',
    status: 'In Progress',
    percent_complete: 65,
    owner: 'Ramesh K. (Front Desk Mgr)',
    last_updated: '2026-07-24',
    impact_level: 'High',
    target_date: '2026-08-15',
    notes: 'Installing 2 additional self-kiosks and token system.'
  },
  {
    id: 'panvel-2',
    unit_id: 'unit-panvel',
    title: 'Dilation room waiting time exceeding 45 mins',
    category: 'Dilation & Buzzer Alert System',
    status: 'In Progress',
    percent_complete: 40,
    owner: 'Dr. Neha V. (OPD Lead)',
    last_updated: '2026-07-26',
    impact_level: 'High',
    target_date: '2026-08-30',
    notes: 'Trialing color-coded wristband tracking for dilation start times.'
  },
  {
    id: 'panvel-3',
    unit_id: 'unit-panvel',
    title: 'Paper-based OPD patient flow causing lost files',
    category: 'Real-time Patient Tracking',
    status: 'Not Started',
    percent_complete: 0,
    owner: 'IT Ops (Suresh B.)',
    last_updated: '2026-07-10',
    impact_level: 'High',
    target_date: '2026-09-15',
    notes: 'Awaiting tablet roll-out for nursing staff.'
  },
  {
    id: 'panvel-4',
    unit_id: 'unit-panvel',
    title: 'Private room bed occupancy clearance delay during discharge',
    category: 'Private Room Capacity',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Sunita M. (Nursing Supv)',
    last_updated: '2026-07-20',
    impact_level: 'Medium',
    target_date: '2026-07-20',
    notes: 'SOP updated: Fast-track house-keeping alert via WhatsApp bot.'
  },
  {
    id: 'panvel-5',
    unit_id: 'unit-panvel',
    title: 'Pathology & Blood report turnaround time > 3 hours',
    category: 'Lab Turnaround',
    status: 'In Progress',
    percent_complete: 75,
    owner: 'Dr. Anand S. (Pathologist)',
    last_updated: '2026-07-27',
    impact_level: 'Medium',
    target_date: '2026-08-05',
    notes: 'Auto-analyzer integration with LIS almost complete.'
  },

  // Shimoga Unit
  {
    id: 'shimoga-1',
    unit_id: 'unit-shimoga',
    title: 'Kannada/English audio buzzer system for OPD patient calling',
    category: 'Dilation & Buzzer Alert System',
    status: 'In Progress',
    percent_complete: 85,
    owner: 'Dr. B. Hegde (Unit Director)',
    last_updated: '2026-07-27',
    impact_level: 'High',
    target_date: '2026-08-01',
    notes: 'Bilingual voice announcements integrated in waiting area 2.'
  },
  {
    id: 'shimoga-2',
    unit_id: 'unit-shimoga',
    title: 'Private room booking allocation transparency',
    category: 'Private Room Capacity',
    status: 'Completed',
    percent_complete: 100,
    owner: 'Vidya Rao (Ops Admin)',
    last_updated: '2026-07-15',
    impact_level: 'Medium',
    target_date: '2026-07-15',
    notes: 'Live LED display installed outside bed management office.'
  },
  {
    id: 'shimoga-3',
    unit_id: 'unit-shimoga',
    title: 'Outpatient token desk congestion during morning clinic',
    category: 'OPD Wait Time',
    status: 'In Progress',
    percent_complete: 55,
    owner: 'Girish M. (Front Desk)',
    last_updated: '2026-07-26',
    impact_level: 'High',
    target_date: '2026-08-18',
    notes: 'Added token counter for rural camps follow-ups.'
  }
];

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize database schema and seeds
export async function initializeDatabase(maxRetries = 10, retryDelayMs = 2000) {
  console.log(`[Postgres] Connecting to PostgreSQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
  
  // Resilient connection retry loop for Docker / Server startups
  let connectedClient: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!process.env.DATABASE_URL) {
        try {
          const adminClient = new Client({
            user: DB_USER,
            host: DB_HOST,
            database: 'postgres',
            password: DB_PASSWORD,
            port: DB_PORT
          });
          await adminClient.connect();
          const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
          if (res.rowCount === 0) {
            console.log(`[Postgres] Creating database '${DB_NAME}'...`);
            await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
          }
          await adminClient.end();
        } catch (e: any) {
          // Admin DB connect may fail if default db is restricted, continue to main pool
          console.warn(`[Postgres] Admin DB check notice: ${e.message}`);
        }
      }

      connectedClient = await pool.connect();
      console.log(`[Postgres] Successfully connected to PostgreSQL on attempt ${attempt}`);
      break;
    } catch (err: any) {
      console.warn(`[Postgres] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error(`[Postgres] Failed to connect to PostgreSQL after ${maxRetries} attempts.`);
        throw err;
      }
      console.log(`[Postgres] Waiting ${retryDelayMs / 1000}s before retrying...`);
      await sleep(retryDelayMs);
    }
  }

  const client = connectedClient;
  try {
    await client.query('BEGIN');

    // Units Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS units (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        is_assessed BOOLEAN DEFAULT FALSE,
        established_year INTEGER,
        bed_capacity INTEGER,
        contact_head VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        emp_id VARCHAR(50) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        unit_id VARCHAR(64) REFERENCES units(id) ON DELETE SET NULL,
        designation VARCHAR(255),
        avatar_initials VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bottlenecks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bottlenecks (
        id VARCHAR(128) PRIMARY KEY,
        unit_id VARCHAR(64) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        percent_complete INTEGER NOT NULL DEFAULT 0,
        owner VARCHAR(150) NOT NULL,
        last_updated VARCHAR(50) NOT NULL,
        impact_level VARCHAR(20) DEFAULT 'Medium',
        target_date VARCHAR(50),
        notes TEXT,
        remarks TEXT,
        before_photos JSONB DEFAULT '[]'::jsonb,
        after_photos JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) DEFAULT 'General Operations',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Departments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20),
        head_contact VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Schema Migrations if table already existed
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS emp_id VARCHAR(50);
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS remarks TEXT;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
      UPDATE bottlenecks SET status = 'Pending' WHERE status = 'Not Started' OR status = 'Acknowledge';
      UPDATE bottlenecks SET status = 'In progress' WHERE status = 'Assigned work' OR status = 'In Progress';
    `);

    // Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        unit_id VARCHAR(64),
        bottleneck_id VARCHAR(128),
        action VARCHAR(50) NOT NULL,
        details JSONB,
        user_role VARCHAR(50) DEFAULT 'Unit Head',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default departments
    const defaultDepts = [
      { id: 'dept-opd', name: 'Outpatient (OPD)', code: 'OPD', head_contact: 'Dr. Head OPD' },
      { id: 'dept-inpatient', name: 'Inpatient & Daycare', code: 'IPD', head_contact: 'Nursing Supervisor' },
      { id: 'dept-ot', name: 'Operating Theatre (OT)', code: 'OT', head_contact: 'Chief Surgeon' },
      { id: 'dept-lab', name: 'Diagnostic & Laboratory', code: 'LAB', head_contact: 'Lab Director' },
      { id: 'dept-pharmacy', name: 'Pharmacy & Dispensary', code: 'PHARM', head_contact: 'Chief Pharmacist' },
      { id: 'dept-billing', name: 'Billing & TPA Insurance', code: 'BILL', head_contact: 'Finance Lead' },
      { id: 'dept-counselling', name: 'Patient Counselling', code: 'COUNS', head_contact: 'PX Head' },
      { id: 'dept-facility', name: 'Facility & Housekeeping', code: 'FAC', head_contact: 'Facility Manager' },
      { id: 'dept-quality', name: 'Quality Assurance & Audit', code: 'QA', head_contact: 'Quality Lead' },
      { id: 'dept-it', name: 'IT & Digital Infrastructure', code: 'IT', head_contact: 'IT Ops Lead' }
    ];

    for (const d of defaultDepts) {
      await client.query(
        `INSERT INTO departments (id, name, code, head_contact)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [d.id, d.name, d.code, d.head_contact]
      );
    }

    // Seed default categories
    const defaultCats = [
      { id: 'cat-opd-wait', name: 'OPD Wait Time', department: 'Outpatient (OPD)' },
      { id: 'cat-room-cap', name: 'Private Room Capacity', department: 'Inpatient & Daycare' },
      { id: 'cat-tracking', name: 'Real-time Patient Tracking', department: 'IT & Digital Infrastructure' },
      { id: 'cat-buzzer', name: 'Dilation & Buzzer Alert System', department: 'Outpatient (OPD)' },
      { id: 'cat-lab', name: 'Lab Turnaround', department: 'Diagnostic & Laboratory' },
      { id: 'cat-surgical-audit', name: 'Surgical Redo Audits', department: 'Operating Theatre (OT)' },
      { id: 'cat-reg-delays', name: 'Registration Delays', department: 'Outpatient (OPD)' },
      { id: 'cat-counselling', name: 'Counselling Wait Time', department: 'Patient Counselling' },
      { id: 'cat-discharge', name: 'Discharge Process', department: 'Inpatient & Daycare' },
      { id: 'cat-pharmacy', name: 'Pharmacy Counter Delays', department: 'Pharmacy & Dispensary' },
      { id: 'cat-billing', name: 'Billing & Insurance Clearance', department: 'Billing & TPA Insurance' },
      { id: 'cat-triage', name: 'Optometry & Triage Queue', department: 'Outpatient (OPD)' },
      { id: 'cat-preop', name: 'Pre-op Holding Area Flow', department: 'Operating Theatre (OT)' },
      { id: 'cat-diag', name: 'Diagnostics Scheduling', department: 'Diagnostic & Laboratory' },
      { id: 'cat-postop', name: 'Post-op Care Briefing', department: 'Operating Theatre (OT)' }
    ];

    for (const c of defaultCats) {
      await client.query(
        `INSERT INTO categories (id, name, department)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.department]
      );
    }

    await client.query('COMMIT');
    console.log('[Postgres] Tables units, users, bottlenecks, audit_logs verified & migrated.');

    // Seed units
    for (const unit of SANKARA_INITIAL_UNITS) {
      await client.query(
        `INSERT INTO units (id, name, city, state, is_assessed, established_year, bed_capacity, contact_head)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           city = EXCLUDED.city,
           state = EXCLUDED.state,
           contact_head = COALESCE(units.contact_head, EXCLUDED.contact_head)`,
        [unit.id, unit.name, unit.city, unit.state, unit.is_assessed, unit.established_year, unit.bed_capacity, unit.contact_head]
      );
    }

    // Seed users
    for (const u of SANKARA_INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (id, name, email, emp_id, password, role, unit_id, designation, avatar_initials)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           emp_id = EXCLUDED.emp_id,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           unit_id = EXCLUDED.unit_id,
           designation = EXCLUDED.designation,
           avatar_initials = EXCLUDED.avatar_initials`,
        [u.id, u.name, u.email, u.emp_id, u.password, u.role, u.unit_id, u.designation, u.avatar_initials]
      );
    }

    // Seed bottlenecks if empty
    const bCountRes = await client.query('SELECT COUNT(*) FROM bottlenecks');
    if (parseInt(bCountRes.rows[0].count, 10) === 0) {
      for (const b of INITIAL_BOTTLENECKS) {
        await client.query(
          `INSERT INTO bottlenecks (id, unit_id, title, category, status, percent_complete, owner, last_updated, impact_level, target_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [b.id, b.unit_id, b.title, b.category, b.status, b.percent_complete, b.owner, b.last_updated, b.impact_level, b.target_date, b.notes]
        );
      }
    }

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Postgres] Initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
