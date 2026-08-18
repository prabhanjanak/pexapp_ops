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
    id: 'unit-coimbatore',
    name: 'Coimbatore HQ',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    is_assessed: true,
    established_year: 1977,
    bed_capacity: 250,
    contact_head: 'Dr. R. Ramakrishnan'
  },
  {
    id: 'unit-panvel',
    name: 'Panvel Unit',
    city: 'Panvel (Navi Mumbai)',
    state: 'Maharashtra',
    is_assessed: true,
    established_year: 2018,
    bed_capacity: 120,
    contact_head: 'Dr. Neha V.'
  },
  {
    id: 'unit-shimoga',
    name: 'Shimoga Unit',
    city: 'Shimoga',
    state: 'Karnataka',
    is_assessed: true,
    established_year: 2011,
    bed_capacity: 100,
    contact_head: 'Dr. B. Hegde'
  },
  {
    id: 'unit-krishnankoil',
    name: 'Krishnankoil Unit',
    city: 'Krishnankoil',
    state: 'Tamil Nadu',
    is_assessed: false,
    established_year: 2004,
    bed_capacity: 110,
    contact_head: 'Dr. S. Vijay'
  },
  {
    id: 'unit-guntur',
    name: 'Guntur Unit',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    is_assessed: false,
    established_year: 2014,
    bed_capacity: 115,
    contact_head: 'Dr. C. Prasad'
  },
  {
    id: 'unit-bengaluru',
    name: 'Bengaluru - Electronic City',
    city: 'Bengaluru',
    state: 'Karnataka',
    is_assessed: false,
    established_year: 2008,
    bed_capacity: 150,
    contact_head: 'Dr. M. Swaminathan'
  },
  {
    id: 'unit-anand',
    name: 'Anand Unit',
    city: 'Anand',
    state: 'Gujarat',
    is_assessed: false,
    established_year: 2017,
    bed_capacity: 90,
    contact_head: 'Dr. H. Patel'
  },
  {
    id: 'unit-ludhiana',
    name: 'Ludhiana Unit',
    city: 'Ludhiana',
    state: 'Punjab',
    is_assessed: false,
    established_year: 2019,
    bed_capacity: 100,
    contact_head: 'Dr. G. Singh'
  },
  {
    id: 'unit-kanpur',
    name: 'Kanpur Unit',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    is_assessed: false,
    established_year: 2020,
    bed_capacity: 110,
    contact_head: 'Dr. A. Agarwal'
  },
  {
    id: 'unit-indore',
    name: 'Indore Unit',
    city: 'Indore',
    state: 'Madhya Pradesh',
    is_assessed: false,
    established_year: 2021,
    bed_capacity: 95,
    contact_head: 'Dr. R. Sharma'
  },
  {
    id: 'unit-jaipur',
    name: 'Jaipur Unit',
    city: 'Jaipur',
    state: 'Rajasthan',
    is_assessed: false,
    established_year: 2022,
    bed_capacity: 105,
    contact_head: 'Dr. V. Rathore'
  },
  {
    id: 'unit-hyderabad',
    name: 'Hyderabad Unit',
    city: 'Hyderabad',
    state: 'Telangana',
    is_assessed: false,
    established_year: 2023,
    bed_capacity: 130,
    contact_head: 'Dr. K. Reddy'
  },
  {
    id: 'unit-varanasi',
    name: 'Varanasi Unit',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    is_assessed: false,
    established_year: 2021,
    bed_capacity: 85,
    contact_head: 'Dr. T. Rao'
  },
  {
    id: 'unit-salem',
    name: 'Salem Unit',
    city: 'Salem',
    state: 'Tamil Nadu',
    is_assessed: false,
    established_year: 2015,
    bed_capacity: 80,
    contact_head: 'Dr. M. Elangovan'
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
    id: 'user-audit-superadmin',
    name: 'Dr. S. K. Narayanan',
    email: 'auditor@sankaraeye.com',
    emp_id: '010045',
    password: 'Sankara@123',
    role: 'Super Admin (View Only)',
    unit_id: null,
    designation: 'Central Quality & Clinical Auditor',
    avatar_initials: 'SN'
  },
  {
    id: 'user-superadmin',
    name: 'Dr. R. V. Ramani',
    email: 'admin@sankara.org',
    emp_id: '010001',
    password: 'Sankara@123',
    role: 'Super Admin',
    unit_id: null,
    designation: 'Chief Medical Director & Founder',
    avatar_initials: 'RR'
  },
  {
    id: 'user-opsteam',
    name: 'Central Operations Directorate',
    email: 'ops@sankara.org',
    emp_id: '010002',
    password: 'Sankara@123',
    role: 'Operations Team',
    unit_id: null,
    designation: 'Patient Experience & Quality Lead',
    avatar_initials: 'OP'
  },
  {
    id: 'user-panvel-head',
    name: 'Dr. Neha V.',
    email: 'panvel.head@sankara.org',
    emp_id: '010003',
    password: 'Sankara@123',
    role: 'Unit Head',
    unit_id: 'unit-panvel',
    designation: 'Panvel Unit Chief / Medical Director',
    avatar_initials: 'NV'
  },
  {
    id: 'user-coimbatore-head',
    name: 'Dr. R. Ramakrishnan',
    email: 'coimbatore.head@sankara.org',
    emp_id: '010004',
    password: 'Sankara@123',
    role: 'Unit Head',
    unit_id: 'unit-coimbatore',
    designation: 'Coimbatore HQ Medical Director',
    avatar_initials: 'RK'
  },
  {
    id: 'user-shimoga-head',
    name: 'Dr. B. Hegde',
    email: 'shimoga.head@sankara.org',
    emp_id: '010005',
    password: 'Sankara@123',
    role: 'Unit Head',
    unit_id: 'unit-shimoga',
    designation: 'Shimoga Unit Director',
    avatar_initials: 'BH'
  },
  {
    id: 'user-bengaluru-head',
    name: 'Dr. M. Swaminathan',
    email: 'bengaluru.head@sankara.org',
    emp_id: '010006',
    password: 'Sankara@123',
    role: 'Unit Head',
    unit_id: 'unit-bengaluru',
    designation: 'Bengaluru Electronic City Head',
    avatar_initials: 'MS'
  },
  {
    id: 'user-guntur-head',
    name: 'Dr. C. Prasad',
    email: 'guntur.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-guntur',
    designation: 'Guntur Unit Head',
    avatar_initials: 'CP'
  },
  {
    id: 'user-krishnankoil-head',
    name: 'Dr. S. Vijay',
    email: 'krishnankoil.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-krishnankoil',
    designation: 'Krishnankoil Unit Head',
    avatar_initials: 'SV'
  },
  {
    id: 'user-anand-head',
    name: 'Dr. H. Patel',
    email: 'anand.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-anand',
    designation: 'Anand Gujarat Unit Head',
    avatar_initials: 'HP'
  },
  {
    id: 'user-ludhiana-head',
    name: 'Dr. G. Singh',
    email: 'ludhiana.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-ludhiana',
    designation: 'Ludhiana Punjab Unit Head',
    avatar_initials: 'GS'
  },
  {
    id: 'user-kanpur-head',
    name: 'Dr. A. Agarwal',
    email: 'kanpur.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-kanpur',
    designation: 'Kanpur UP Unit Head',
    avatar_initials: 'AA'
  },
  {
    id: 'user-indore-head',
    name: 'Dr. R. Sharma',
    email: 'indore.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-indore',
    designation: 'Indore MP Unit Head',
    avatar_initials: 'RS'
  },
  {
    id: 'user-jaipur-head',
    name: 'Dr. V. Rathore',
    email: 'jaipur.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-jaipur',
    designation: 'Jaipur Rajasthan Unit Head',
    avatar_initials: 'VR'
  },
  {
    id: 'user-hyderabad-head',
    name: 'Dr. K. Reddy',
    email: 'hyderabad.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-hyderabad',
    designation: 'Hyderabad Gachibowli Head',
    avatar_initials: 'KR'
  },
  {
    id: 'user-varanasi-head',
    name: 'Dr. T. Rao',
    email: 'varanasi.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-varanasi',
    designation: 'Varanasi UP Unit Head',
    avatar_initials: 'TR'
  },
  {
    id: 'user-salem-head',
    name: 'Dr. M. Elangovan',
    email: 'salem.head@sankara.org',
    password: 'password123',
    role: 'Unit Head',
    unit_id: 'unit-salem',
    designation: 'Salem Tamil Nadu Unit Head',
    avatar_initials: 'ME'
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

    // Schema Migrations if table already existed
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS emp_id VARCHAR(50);
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS remarks TEXT;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]'::jsonb;
      UPDATE bottlenecks SET status = 'Pending' WHERE status = 'Not Started';
      UPDATE bottlenecks SET status = 'Assigned work' WHERE status = 'In Progress';
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

    await client.query('COMMIT');
    console.log('[Postgres] Tables units, users, bottlenecks, audit_logs verified & migrated.');

    // Seed units
    for (const unit of SANKARA_INITIAL_UNITS) {
      await client.query(
        `INSERT INTO units (id, name, city, state, is_assessed, established_year, bed_capacity, contact_head)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
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
