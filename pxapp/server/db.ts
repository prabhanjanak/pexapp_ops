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

const useSsl = process.env.PGSSL === 'true' || Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
        query_timeout: 4000,
      }
    : {
        user: DB_USER,
        host: DB_HOST,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: DB_PORT,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
        query_timeout: 4000,
      }
);

// Comprehensive list of 14 Sankara Eye Hospital Units with CMO and Unit Head Leadership
export const SANKARA_INITIAL_UNITS = [
  {
    id: 'unit-coimbatore',
    name: 'Sankara Eye Hospital',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    cmo: 'Dr. Shruthi Tara',
    unit_head: 'Ms. Binitha Harish',
    contact_head: 'Ms. Binitha Harish',
    is_assessed: false,
    established_year: 1977,
    bed_capacity: 250
  },
  {
    id: 'unit-coimbatore-city',
    name: 'Sankara Eye Hospital – Coimbatore City',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    cmo: 'Dr. Devi Priya',
    unit_head: 'Ms. Kanmani S',
    contact_head: 'Ms. Kanmani S',
    is_assessed: false,
    established_year: 1985,
    bed_capacity: 80
  },
  {
    id: 'unit-guntur',
    name: 'Sankara Eye Hospital',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    cmo: 'Dr. Sudhakar Potti',
    unit_head: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    contact_head: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    is_assessed: false,
    established_year: 2014,
    bed_capacity: 115
  },
  {
    id: 'unit-bangalore',
    name: 'Sankara Eye Hospital',
    city: 'Bengaluru',
    state: 'Karnataka',
    cmo: 'Dr. Yeddula Umesh',
    unit_head: 'Lt. Col. S. Guruprasad (Retd.)',
    contact_head: 'Lt. Col. S. Guruprasad (Retd.)',
    is_assessed: false,
    established_year: 2008,
    bed_capacity: 150
  },
  {
    id: 'unit-shimoga',
    name: 'Sankara Eye Hospital',
    city: 'Shivamogga',
    state: 'Karnataka',
    cmo: 'Dr. S. Mahesha',
    unit_head: 'Ms. Gayatri Shantharam / Ms. Anitha',
    contact_head: 'Ms. Gayatri Shantharam / Ms. Anitha',
    is_assessed: false,
    established_year: 2011,
    bed_capacity: 100
  },
  {
    id: 'unit-anand',
    name: 'Sankara Eye Hospital',
    city: 'Anand',
    state: 'Gujarat',
    cmo: 'Dr. Nisha Vadhyamal Ahuja',
    unit_head: 'Col. Sudeepkumar D. Mehta (Retd.)',
    contact_head: 'Col. Sudeepkumar D. Mehta (Retd.)',
    is_assessed: false,
    established_year: 2017,
    bed_capacity: 100
  },
  {
    id: 'unit-kanpur',
    name: 'Sankara Eye Hospital',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    cmo: 'Dr. Puneet Johri',
    unit_head: 'Dr. Rahul Singh',
    contact_head: 'Dr. Rahul Singh',
    is_assessed: false,
    established_year: 2020,
    bed_capacity: 110
  },
  {
    id: 'unit-jaipur',
    name: 'Sankara Eye Hospital',
    city: 'Jaipur',
    state: 'Rajasthan',
    cmo: 'Dr. Neeraj Shah',
    unit_head: 'Dr. Nishant Jain',
    contact_head: 'Dr. Nishant Jain',
    is_assessed: false,
    established_year: 2022,
    bed_capacity: 105
  },
  {
    id: 'unit-ludhiana',
    name: 'Sankara Eye Hospital',
    city: 'Ludhiana',
    state: 'Punjab',
    cmo: 'Dr. Manoj Gupta',
    unit_head: 'Dr. Manoj Gupta',
    contact_head: 'Dr. Manoj Gupta',
    is_assessed: false,
    established_year: 2019,
    bed_capacity: 100
  },
  {
    id: 'unit-indore',
    name: 'Sankara Eye Centre',
    city: 'Indore',
    state: 'Madhya Pradesh',
    cmo: 'Dr. Ankit Deokar',
    unit_head: 'Dr. Rituraj Sharma',
    contact_head: 'Dr. Rituraj Sharma',
    is_assessed: false,
    established_year: 2021,
    bed_capacity: 95
  },
  {
    id: 'unit-panvel',
    name: 'R. Jhunjhunwala Sankara Eye Hospital',
    city: 'Panvel',
    state: 'Maharashtra',
    cmo: 'Dr. Girish Budhrani',
    unit_head: 'Dr. Rajesh Kapse',
    contact_head: 'Dr. Rajesh Kapse',
    is_assessed: false,
    established_year: 2018,
    bed_capacity: 120
  },
  {
    id: 'unit-hyderabad',
    name: 'Sankara Eye Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    cmo: 'Dr. Simakurthy Sriram',
    unit_head: 'Mr. Gannamraju Viswamohan',
    contact_head: 'Mr. Gannamraju Viswamohan',
    is_assessed: false,
    established_year: 2023,
    bed_capacity: 130
  },
  {
    id: 'unit-varanasi',
    name: 'R. J. Sankara Eye Hospital',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    cmo: 'Dr. Saptagirish Rambhatla',
    unit_head: 'Lt. Col. (Dr.) Bharat Singh',
    contact_head: 'Lt. Col. (Dr.) Bharat Singh',
    is_assessed: false,
    established_year: 2021,
    bed_capacity: 85
  },
  {
    id: 'unit-krishnankoil',
    name: 'Sankara Eye Hospital',
    city: 'Krishnankoil',
    state: 'Tamil Nadu',
    cmo: 'Dr. Sudha N',
    unit_head: 'Mr. Aswathaman R',
    contact_head: 'Mr. Aswathaman R',
    is_assessed: false,
    established_year: 2004,
    bed_capacity: 110
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
    role: 'President',
    unit_id: null,
    designation: 'President of Hospital Operations • Executive Directorate',
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
  {
    id: 'user-unithead-generic',
    name: 'Dr. Rajesh Kapse',
    email: 'unithead@sankara.com',
    emp_id: '010188',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-panvel',
    designation: 'Panvel Unit Head & CMO',
    avatar_initials: 'RK'
  },
  // 14 Official Unit Heads
  {
    id: 'user-coimbatore-head',
    name: 'Ms. Binitha Harish',
    email: 'unithead.coimbatore@sankara.com',
    emp_id: 'UH-CBE-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-coimbatore',
    designation: 'Coimbatore Unit Head',
    avatar_initials: 'BH'
  },
  {
    id: 'user-coimbatore-city-head',
    name: 'Ms. Kanmani S',
    email: 'unithead.coimbatorecity@sankara.com',
    emp_id: 'UH-CBC-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-coimbatore-city',
    designation: 'Coimbatore City Unit Head',
    avatar_initials: 'KS'
  },
  {
    id: 'user-guntur-head',
    name: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    email: 'unithead.guntur@sankara.com',
    emp_id: 'UH-GNT-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-guntur',
    designation: 'Guntur Unit Head',
    avatar_initials: 'TM'
  },
  {
    id: 'user-bangalore-head',
    name: 'Lt. Col. S. Guruprasad (Retd.)',
    email: 'unithead.bangalore@sankara.com',
    emp_id: 'UH-BLR-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-bangalore',
    designation: 'Bengaluru Unit Head',
    avatar_initials: 'SG'
  },
  {
    id: 'user-shimoga-head',
    name: 'Ms. Gayatri Shantharam / Ms. Anitha',
    email: 'unithead.shimoga@sankara.com',
    emp_id: 'UH-SHM-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-shimoga',
    designation: 'Shivamogga Unit Head',
    avatar_initials: 'GA'
  },
  {
    id: 'user-anand-head',
    name: 'Col. Sudeepkumar D. Mehta (Retd.)',
    email: 'unithead.anand@sankara.com',
    emp_id: 'UH-AND-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-anand',
    designation: 'Anand Unit Head',
    avatar_initials: 'SM'
  },
  {
    id: 'user-kanpur-head',
    name: 'Dr. Rahul Singh',
    email: 'unithead.kanpur@sankara.com',
    emp_id: 'UH-KNP-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-kanpur',
    designation: 'Kanpur Unit Head',
    avatar_initials: 'RS'
  },
  {
    id: 'user-jaipur-head',
    name: 'Dr. Nishant Jain',
    email: 'unithead.jaipur@sankara.com',
    emp_id: 'UH-JPR-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-jaipur',
    designation: 'Jaipur Unit Head',
    avatar_initials: 'NJ'
  },
  {
    id: 'user-ludhiana-head',
    name: 'Dr. Manoj Gupta',
    email: 'unithead.ludhiana@sankara.com',
    emp_id: 'UH-LDH-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-ludhiana',
    designation: 'Ludhiana Unit Head',
    avatar_initials: 'MG'
  },
  {
    id: 'user-indore-head',
    name: 'Dr. Rituraj Sharma',
    email: 'unithead.indore@sankara.com',
    emp_id: 'UH-IND-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-indore',
    designation: 'Indore Unit Head',
    avatar_initials: 'RS'
  },
  {
    id: 'user-panvel-head',
    name: 'Dr. Rajesh Kapse',
    email: 'unithead.panvel@sankara.com',
    emp_id: 'UH-PNV-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-panvel',
    designation: 'Panvel Unit Head',
    avatar_initials: 'RK'
  },
  {
    id: 'user-hyderabad-head',
    name: 'Mr. Gannamraju Viswamohan',
    email: 'unithead.hyderabad@sankara.com',
    emp_id: 'UH-HYD-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-hyderabad',
    designation: 'Hyderabad Unit Head',
    avatar_initials: 'GV'
  },
  {
    id: 'user-varanasi-head',
    name: 'Lt. Col. (Dr.) Bharat Singh',
    email: 'unithead.varanasi@sankara.com',
    emp_id: 'UH-VNS-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-varanasi',
    designation: 'Varanasi Unit Head',
    avatar_initials: 'BS'
  },
  {
    id: 'user-krishnankoil-head',
    name: 'Mr. Aswathaman R',
    email: 'unithead.krishnankoil@sankara.com',
    emp_id: 'UH-KRK-01',
    password: 'unit123',
    role: 'Unit Head',
    unit_id: 'unit-krishnankoil',
    designation: 'Krishnankoil Unit Head',
    avatar_initials: 'AR'
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
        cmo VARCHAR(150),
        unit_head VARCHAR(150),
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
        comments JSONB DEFAULT '[]'::jsonb,
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
      ALTER TABLE units ADD COLUMN IF NOT EXISTS cmo VARCHAR(150);
      ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_head VARCHAR(150);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS emp_id VARCHAR(50);
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS remarks TEXT;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE bottlenecks ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;
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
        `INSERT INTO units (id, name, city, state, cmo, unit_head, is_assessed, established_year, bed_capacity, contact_head)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           city = EXCLUDED.city,
           state = EXCLUDED.state,
           cmo = EXCLUDED.cmo,
           unit_head = EXCLUDED.unit_head,
           contact_head = EXCLUDED.contact_head`,
        [unit.id, unit.name, unit.city, unit.state, unit.cmo, unit.unit_head, unit.is_assessed, unit.established_year, unit.bed_capacity, unit.unit_head]
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

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Postgres] Initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
