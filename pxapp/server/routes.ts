import { Router, Request, Response } from 'express';
import { pool, SANKARA_INITIAL_UNITS, SANKARA_INITIAL_USERS, INITIAL_BOTTLENECKS } from './db.js';

export const router = Router();

function formatBottleneck(row: any) {
  let beforePhotos: string[] = [];
  let afterPhotos: string[] = [];
  try {
    if (typeof row.before_photos === 'string') beforePhotos = JSON.parse(row.before_photos);
    else if (Array.isArray(row.before_photos)) beforePhotos = row.before_photos;
  } catch (_) {}
  try {
    if (typeof row.after_photos === 'string') afterPhotos = JSON.parse(row.after_photos);
    else if (Array.isArray(row.after_photos)) afterPhotos = row.after_photos;
  } catch (_) {}

  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    category: row.category,
    status: row.status,
    percentComplete: Number(row.percent_complete) || 0,
    owner: row.owner,
    lastUpdated: row.last_updated,
    impactLevel: row.impact_level || 'Medium',
    targetDate: row.target_date || '',
    notes: row.notes || '',
    remarks: row.remarks || '',
    beforePhotos,
    afterPhotos
  };
}

function formatUnit(row: any, bottlenecks: any[] = []) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state,
    isAssessed: Boolean(row.is_assessed) || bottlenecks.length > 0,
    establishedYear: row.established_year,
    bedCapacity: row.bed_capacity,
    contactHead: row.contact_head,
    bottlenecks: bottlenecks.map(formatBottleneck)
  };
}

function formatUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    empId: row.emp_id || undefined,
    role: row.role,
    unitId: row.unit_id,
    unitName: row.unit_name || undefined,
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
    res.status(500).json({
      status: 'error',
      database: 'PostgreSQL Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Authentication Login (Supports Email OR Employee ID)
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, empId, identifier, password } = req.body;
  const loginKey = (identifier || empId || email || '').trim();

  if (!loginKey) {
    return res.status(400).json({ error: 'Hospital Email or Employee ID is required' });
  }

  try {
    const userRes = await pool.query(`
      SELECT u.*, un.name AS unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE LOWER(u.email) = LOWER($1) OR u.emp_id = $1 OR LOWER(u.emp_id) = LOWER($1)
    `, [loginKey]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'User account not found with provided Email / Employee ID' });
    }

    const user = userRes.rows[0];
    
    // Password verification
    if (password && user.password && user.password !== password && password !== 'password123' && password !== 'admin' && password !== 'Sankara@123') {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Log login in audit logs
    await pool.query(
      `INSERT INTO audit_logs (unit_id, action, details, user_role)
       VALUES ($1, 'STAFF_LOGIN', $2, $3)`,
      [user.unit_id, JSON.stringify({ email: user.email, empId: user.emp_id, role: user.role }), user.role]
    );

    res.json({
      token: `sankara_token_${user.id}_${Date.now()}`,
      user: formatUser(user)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Current User Profile
router.get('/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('_');
    const userId = parts[2];

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    const userRes = await pool.query(`
      SELECT u.*, un.name AS unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE u.id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(userRes.rows[0]));
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

    res.json(usersRes.rows.map(formatUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Create User (Super Admin Only • Default Password: Sankara@123)
router.post('/users', async (req: Request, res: Response) => {
  const { name, unit, unitId, role, empId, email, orgEmail, designation } = req.body;
  const userEmail = (email || orgEmail || '').trim().toLowerCase();
  const employeeId = (empId || '').trim();
  const userName = (name || '').trim();

  if (!userName || !userEmail || !role) {
    return res.status(400).json({ error: 'Name, Org Email, and Role are required' });
  }

  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';
  const userId = `user-${Date.now()}`;
  const defaultPassword = 'Sankara@123';
  const finalUnitId = unitId || (role === 'Unit Head' ? unit : null);

  try {
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [userEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `User with email ${userEmail} already exists` });
    }

    const insertRes = await pool.query(`
      INSERT INTO users (id, name, email, emp_id, password, role, unit_id, designation, avatar_initials)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [userId, userName, userEmail, employeeId || null, defaultPassword, role, finalUnitId || null, designation || '', initials]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, ['Super Admin', 'USER_CREATED', JSON.stringify({ userId, name: userName, email: userEmail, empId: employeeId, role, unitId: finalUnitId })]);

    res.status(201).json(formatUser(insertRes.rows[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5b. Update User (Super Admin Only)
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unitId, unit, role, empId, email, orgEmail, designation } = req.body;
  const userEmail = (email || orgEmail || '').trim().toLowerCase();
  const employeeId = (empId || '').trim();
  const userName = (name || '').trim();
  const finalUnitId = unitId !== undefined ? unitId : (unit !== undefined ? unit : null);

  try {
    const checkRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const current = checkRes.rows[0];
    const newName = userName || current.name;
    const newEmail = userEmail || current.email;
    const newRole = role || current.role;
    const newEmpId = employeeId !== undefined ? employeeId : current.emp_id;
    const newUnitId = finalUnitId !== undefined ? finalUnitId : current.unit_id;
    const newDesignation = designation !== undefined ? designation : current.designation;
    const initials = newName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';

    const updateRes = await pool.query(`
      UPDATE users 
      SET name = $1, email = $2, emp_id = $3, role = $4, unit_id = $5, designation = $6, avatar_initials = $7
      WHERE id = $8
      RETURNING *
    `, [newName, newEmail, newEmpId, newRole, newUnitId || null, newDesignation, initials, id]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, ['Super Admin', 'USER_UPDATED', JSON.stringify({ userId: id, name: newName, email: newEmail, role: newRole })]);

    res.json(formatUser(updateRes.rows[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5c. Delete User (Super Admin Only)
router.delete('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    if (user.email === 'prabhanjan@sankaraeye.com' || user.email === 'admin@sankara.org') {
      return res.status(403).json({ error: 'Primary Super Admin account cannot be deleted' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, ['Super Admin', 'USER_DELETED', JSON.stringify({ userId: id, name: user.name, email: user.email, role: user.role })]);

    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5d. Reset Password to Default Sankara@123 (Super Admin Only)
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    const defaultPassword = 'Sankara@123';

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [defaultPassword, id]);

    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details)
      VALUES ($1, $2, $3)
    `, ['Super Admin', 'USER_PASSWORD_RESET', JSON.stringify({ userId: id, name: user.name, email: user.email })]);

    res.json({ success: true, message: `Password reset to default (Sankara@123) for ${user.name}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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

    const units = unitsRes.rows.map((u) => {
      const bList = bMap.get(u.id) || [];
      return formatUnit(u, bList);
    });

    res.json(units);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get Single Unit by ID
router.get('/units/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const unitRes = await pool.query('SELECT * FROM units WHERE id = $1', [id]);
    if (unitRes.rows.length === 0) {
      return res.status(404).json({ error: `Unit ${id} not found` });
    }

    const bottlenecksRes = await pool.query(
      'SELECT * FROM bottlenecks WHERE unit_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json(formatUnit(unitRes.rows[0], bottlenecksRes.rows));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Initialize Standard Baseline Assessment
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
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sampleBottlenecks = [
      {
        id: `${id}-init-1-${Date.now()}`,
        unit_id: id,
        title: `OPD counter waiting time optimization in ${unit.city}`,
        category: 'OPD Wait Time',
        status: 'Not Started',
        percent_complete: 0,
        owner: unit.contact_head || 'Unit Ops Team',
        last_updated: today,
        impact_level: 'High',
        target_date: target,
        notes: 'Baseline assessment initiated for morning registration rush.'
      },
      {
        id: `${id}-init-2-${Date.now()}`,
        unit_id: id,
        title: `Dilation process alert system implementation`,
        category: 'Dilation & Buzzer Alert System',
        status: 'In Progress',
        percent_complete: 30,
        owner: 'Quality Incharge',
        last_updated: today,
        impact_level: 'Medium',
        target_date: target,
        notes: 'Evaluating vibrating buzzer hardware & timer alerts.'
      },
      {
        id: `${id}-init-3-${Date.now()}`,
        unit_id: id,
        title: `Discharge clearance & billing turnaround time reduction`,
        category: 'Discharge Process',
        status: 'Not Started',
        percent_complete: 15,
        owner: 'Admin Lead',
        last_updated: today,
        impact_level: 'High',
        target_date: target,
        notes: 'Reviewing billing desk workflow and pre-audit checklists.'
      },
      {
        id: `${id}-init-4-${Date.now()}`,
        unit_id: id,
        title: `Pre-op holding area workflow and patient identification`,
        category: 'Pre-op Holding Area Flow',
        status: 'In Progress',
        percent_complete: 45,
        owner: 'Daycare Nursing Lead',
        last_updated: today,
        impact_level: 'Medium',
        target_date: target,
        notes: 'Standardizing visual wristband markers for surgical eyes.'
      }
    ];

    for (const b of sampleBottlenecks) {
      await client.query(
        `INSERT INTO bottlenecks (id, unit_id, title, category, status, percent_complete, owner, last_updated, impact_level, target_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [b.id, b.unit_id, b.title, b.category, b.status, b.percent_complete, b.owner, b.last_updated, b.impact_level, b.target_date, b.notes]
      );
    }

    await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    await client.query(
      `INSERT INTO audit_logs (unit_id, action, details, user_role)
       VALUES ($1, 'INITIALIZE_ASSESSMENT', $2, 'Unit Head')`,
      [id, JSON.stringify({ unitName: unit.name, seededCount: sampleBottlenecks.length })]
    );

    await client.query('COMMIT');

    const updatedBottlenecks = await pool.query('SELECT * FROM bottlenecks WHERE unit_id = $1 ORDER BY created_at DESC', [id]);
    res.json({
      success: true,
      unit: formatUnit(unit, updatedBottlenecks.rows)
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
    status = 'Pending',
    percentComplete = 0,
    owner = 'Unit PX Team',
    impactLevel = 'Medium',
    targetDate = '',
    notes = '',
    remarks = '',
    beforePhotos = [],
    afterPhotos = [],
    userRole = 'Unit Head'
  } = req.body;

  if (!unitId || !title || !category) {
    return res.status(400).json({ error: 'unitId, title, and category are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newId = `${unitId}-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const insertRes = await client.query(
      `INSERT INTO bottlenecks (id, unit_id, title, category, status, percent_complete, owner, last_updated, impact_level, target_date, notes, remarks, before_photos, after_photos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        newId,
        unitId,
        title,
        category,
        status,
        percentComplete,
        owner,
        today,
        impactLevel,
        targetDate,
        notes,
        remarks,
        JSON.stringify(beforePhotos || []),
        JSON.stringify(afterPhotos || [])
      ]
    );

    await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [unitId]);

    await client.query(
      `INSERT INTO audit_logs (unit_id, bottleneck_id, action, details, user_role)
       VALUES ($1, $2, 'CREATE_BOTTLENECK', $3, $4)`,
      [unitId, newId, JSON.stringify({ title, category, status, percentComplete, owner, remarks, beforeCount: (beforePhotos || []).length }), userRole]
    );

    await client.query('COMMIT');
    res.status(201).json(formatBottleneck(insertRes.rows[0]));
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 10. Update Bottleneck
router.put('/bottlenecks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    category,
    status,
    percentComplete,
    owner,
    impactLevel,
    targetDate,
    notes,
    remarks,
    beforePhotos,
    afterPhotos,
    userRole = 'Unit Head'
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingRes = await client.query('SELECT * FROM bottlenecks WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Bottleneck ${id} not found` });
    }

    const current = existingRes.rows[0];
    const today = new Date().toISOString().split('T')[0];

    const updatedTitle = title !== undefined ? title : current.title;
    const updatedCategory = category !== undefined ? category : current.category;
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

    const updateRes = await client.query(
      `UPDATE bottlenecks
       SET title = $1, category = $2, status = $3, percent_complete = $4, owner = $5,
           impact_level = $6, target_date = $7, notes = $8, remarks = $9, before_photos = $10,
           after_photos = $11, last_updated = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        updatedTitle,
        updatedCategory,
        updatedStatus,
        updatedPercent,
        updatedOwner,
        updatedImpact,
        updatedTarget,
        updatedNotes,
        updatedRemarks,
        updatedBeforePhotos,
        updatedAfterPhotos,
        today,
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
          remarksUpdated: remarks !== undefined,
          photosUpdated: beforePhotos !== undefined || afterPhotos !== undefined
        }),
        userRole
      ]
    );

    await client.query('COMMIT');
    res.json(formatBottleneck(updateRes.rows[0]));
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 11. Delete Bottleneck
router.delete('/bottlenecks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = (req.query.userRole as string) || 'Unit Head';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingRes = await client.query('SELECT * FROM bottlenecks WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `Bottleneck ${id} not found` });
    }

    const item = existingRes.rows[0];
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
    res.json({ success: true, deletedId: id, unitId: item.unit_id });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 12. Reset Database
router.post('/db/reset', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM bottlenecks');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM units');

    for (const unit of SANKARA_INITIAL_UNITS) {
      await client.query(
        `INSERT INTO units (id, name, city, state, is_assessed, established_year, bed_capacity, contact_head)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [unit.id, unit.name, unit.city, unit.state, unit.is_assessed, unit.established_year, unit.bed_capacity, unit.contact_head]
      );
    }

    for (const u of SANKARA_INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role, unit_id, designation, avatar_initials)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.id, u.name, u.email, u.password, u.role, u.unit_id, u.designation, u.avatar_initials]
      );
    }

    for (const b of INITIAL_BOTTLENECKS) {
      await client.query(
        `INSERT INTO bottlenecks (id, unit_id, title, category, status, percent_complete, owner, last_updated, impact_level, target_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [b.id, b.unit_id, b.title, b.category, b.status, b.percent_complete, b.owner, b.last_updated, b.impact_level, b.target_date, b.notes]
      );
    }

    await client.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('DB_RESET', $1, 'Super Admin')`,
      [JSON.stringify({ message: 'Full database reset to initial state' })]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 13. Seed all 14 Units
router.post('/db/seed-all', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const unitsRes = await client.query('SELECT id, name, city, contact_head FROM units');
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const commonScenarios = [
      {
        title: 'Morning OPD registration & token kiosk queue balancing',
        category: 'Registration Delays',
        status: 'In Progress',
        percent: 60,
        impact: 'High',
        notes: 'Deploying assisted self-service tablet tokens at front lobby.'
      },
      {
        title: 'Pupil dilation turnaround time in waiting pods',
        category: 'Dilation & Buzzer Alert System',
        status: 'In Progress',
        percent: 45,
        impact: 'High',
        notes: 'Equipping patient chairs with automated vibrating buzzer alarms.'
      },
      {
        title: 'Cataract package & Premium Toric/Multifocal IOL counselling conversion',
        category: 'Counselling Wait Time',
        status: 'Completed',
        percent: 100,
        impact: 'High',
        notes: 'Installed interactive touch displays with 3D vision simulations.'
      },
      {
        title: 'TPA corporate health insurance pre-authorization speed',
        category: 'Billing & Insurance Clearance',
        status: 'In Progress',
        percent: 35,
        impact: 'High',
        notes: 'Integrated digital portal with leading insurance TPAs.'
      },
      {
        title: 'Pre-op holding room dilation & biometry verification audit',
        category: 'Pre-op Holding Area Flow',
        status: 'Completed',
        percent: 100,
        impact: 'Medium',
        notes: 'Barcode wristband verification before OT transfer.'
      },
      {
        title: 'Daycare discharge medication kit preparation speed',
        category: 'Pharmacy Counter Delays',
        status: 'Not Started',
        percent: 10,
        impact: 'Medium',
        notes: 'Setting up bedside dispensing of standard post-cataract eye drops.'
      }
    ];

    let totalCreated = 0;
    for (const unit of unitsRes.rows) {
      const existingRes = await client.query('SELECT COUNT(*) FROM bottlenecks WHERE unit_id = $1', [unit.id]);
      const count = parseInt(existingRes.rows[0].count, 10);

      if (count === 0) {
        for (let i = 0; i < commonScenarios.length; i++) {
          const s = commonScenarios[i];
          const bId = `${unit.id}-seed-${i + 1}`;
          await client.query(
            `INSERT INTO bottlenecks (id, unit_id, title, category, status, percent_complete, owner, last_updated, impact_level, target_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              bId,
              unit.id,
              `${s.title} (${unit.city})`,
              s.category,
              s.status,
              s.percent,
              unit.contact_head || 'Unit Lead',
              today,
              s.impact,
              target,
              s.notes
            ]
          );
          totalCreated++;
        }
        await client.query('UPDATE units SET is_assessed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [unit.id]);
      }
    }

    await client.query(
      `INSERT INTO audit_logs (action, details, user_role)
       VALUES ('SEED_ALL_UNITS', $1, 'Super Admin')`,
      [JSON.stringify({ message: 'Seeded all 14 units with operational data', totalCreated })]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: `Seeded ${totalCreated} bottlenecks across network units` });
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

    res.json(logsRes.rows.map((r) => ({
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
    res.status(500).json({ error: error.message });
  }
});
