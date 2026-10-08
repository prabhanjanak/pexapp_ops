import React, { useState, useEffect } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSAudit, FiveSNonConformity, FiveSRole } from './types';
import { FIVE_S_UNITS, FIVE_S_DEFAULT_USERS, INITIAL_AUDITS, INITIAL_NON_CONFORMITIES } from './seedData';
import { FiveSLogin } from './FiveSLogin';
import { FiveSHeader } from './FiveSHeader';
import { AuditorDashboard } from './AuditorDashboard';
import { DepartmentDashboard } from './DepartmentDashboard';
import { ZonalDashboard } from './ZonalDashboard';
import { UnitHeadDashboard } from './UnitHeadDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { PresidentDashboard } from './PresidentDashboard';
import { FiveSReportsView } from './FiveSReportsView';
import { User } from '../../types';

interface FiveSAppProps {
  currentUser?: User | null;
  onBackToPortal?: () => void;
}

function mapPortalUserToFiveSUser(portalUser: User | null | undefined): FiveSUser | null {
  if (!portalUser) return null;
  const portalRole = (portalUser.role || '').toLowerCase();
  if (portalRole.includes('president')) {
    const base = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'president') || FIVE_S_DEFAULT_USERS[5];
    return { ...base, name: portalUser.name || base.name, email: portalUser.email || base.email };
  }
  if (portalRole.includes('admin')) {
    const base = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'superadmin') || FIVE_S_DEFAULT_USERS[4];
    return { ...base, name: portalUser.name || base.name, email: portalUser.email || base.email };
  }
  if (portalRole.includes('unit head')) {
    const matched = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'unithead') || FIVE_S_DEFAULT_USERS[3];
    const matchedUnit = portalUser.unitId ? portalUser.unitId.replace('unit-', '').toUpperCase() : matched.unit;
    return {
      ...matched,
      name: portalUser.name || matched.name,
      email: portalUser.email || matched.email,
      unit: matchedUnit
    };
  }
  if (portalRole.includes('zonal')) {
    const base = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'zonal') || FIVE_S_DEFAULT_USERS[2];
    const matchedUnit = portalUser.unitId ? portalUser.unitId.replace('unit-', '').toUpperCase() : base.unit;
    return {
      ...base,
      name: portalUser.name || base.name,
      email: portalUser.email || base.email,
      unit: matchedUnit,
      zone: portalUser.zoneId || base.zone || 'Zone 1'
    };
  }
  if (portalRole.includes('department') || portalRole.includes('incharge')) {
    const base = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'incharge') || FIVE_S_DEFAULT_USERS[1];
    const matchedUnit = portalUser.unitId ? portalUser.unitId.replace('unit-', '').toUpperCase() : base.unit;
    return {
      ...base,
      name: portalUser.name || base.name,
      email: portalUser.email || base.email,
      unit: matchedUnit,
      zone: portalUser.zoneId || base.zone || 'Zone 1',
      department: portalUser.department || base.department || 'Doctor consultation rooms'
    };
  }
  if (portalRole.includes('auditor')) {
    const base = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'auditor') || FIVE_S_DEFAULT_USERS[0];
    const matchedUnit = portalUser.unitId ? portalUser.unitId.replace('unit-', '').toUpperCase() : base.unit;
    return {
      ...base,
      name: portalUser.name || base.name,
      email: portalUser.email || base.email,
      unit: matchedUnit,
      allowedUnits: [matchedUnit]
    };
  }
  if (portalRole.includes('operations')) {
    return {
      id: 'usr-ops-lead',
      name: portalUser.name || 'Operations Lead',
      email: portalUser.email || 'operations@sankaraeye.com',
      username: 'operations',
      role: 'superadmin',
      roleLabel: 'Operations Team Lead',
      unit: 'All 14 Units',
      designation: 'Operations & Quality Directorate',
      avatarInitials: 'OP'
    };
  }
  return FIVE_S_DEFAULT_USERS[0];
}

export const FiveSApp: React.FC<FiveSAppProps> = ({ currentUser: portalUser, onBackToPortal }) => {
  // 5S Authenticated User State (portalUser strictly overrides stale local storage)
  const [fivesUser, setFivesUser] = useState<FiveSUser | null>(() => {
    if (portalUser) return mapPortalUserToFiveSUser(portalUser);
    try {
      const saved = localStorage.getItem('sankara_5s_auth_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch (_) {
      return null;
    }
  });

  // Keep 5S user synchronized whenever the authenticated portalUser changes
  useEffect(() => {
    if (portalUser) {
      setFivesUser(mapPortalUserToFiveSUser(portalUser));
    }
  }, [portalUser]);

  // Active Screen: 'dashboard' | 'reports'
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'reports'>('dashboard');

  // Master Data & Operations State
  const [units, setUnits] = useState<FiveSUnitConfig[]>(() => {
    try {
      const saved = localStorage.getItem('sankara_5s_units');
      return saved ? JSON.parse(saved) : FIVE_S_UNITS;
    } catch (_) {
      return FIVE_S_UNITS;
    }
  });

  const [audits, setAudits] = useState<FiveSAudit[]>(() => {
    try {
      const saved = localStorage.getItem('sankara_5s_audits');
      return saved ? JSON.parse(saved) : INITIAL_AUDITS;
    } catch (_) {
      return INITIAL_AUDITS;
    }
  });

  const [ncs, setNcs] = useState<FiveSNonConformity[]>(() => {
    try {
      const saved = localStorage.getItem('sankara_5s_ncs');
      return saved ? JSON.parse(saved) : INITIAL_NON_CONFORMITIES;
    } catch (_) {
      return INITIAL_NON_CONFORMITIES;
    }
  });

  // Sync state to local storage for persistence
  useEffect(() => {
    if (fivesUser) {
      localStorage.setItem('sankara_5s_auth_user', JSON.stringify(fivesUser));
    } else {
      localStorage.removeItem('sankara_5s_auth_user');
    }
  }, [fivesUser]);

  useEffect(() => {
    localStorage.setItem('sankara_5s_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('sankara_5s_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('sankara_5s_ncs', JSON.stringify(ncs));
  }, [ncs]);

  // Login Handler
  const handleLogin = (user: FiveSUser) => {
    setFivesUser(user);
    setActiveScreen('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    setFivesUser(null);
    setActiveScreen('dashboard');
    localStorage.removeItem('sankara_5s_auth_user');
  };

  // Switch Role (for demonstration testing)
  const handleRoleSwitch = (newRole: FiveSRole) => {
    const matched = FIVE_S_DEFAULT_USERS.find((u) => u.role === newRole);
    if (matched) {
      setFivesUser(matched);
      setActiveScreen('dashboard');
    }
  };

  // NC Updates Handler
  const handleUpdateNc = (ncId: string, updates: Partial<FiveSNonConformity>) => {
    setNcs((prev) =>
      prev.map((n) => (n.id === ncId ? { ...n, ...updates } : n))
    );
  };

  // Delete NC Handler
  const handleDeleteNc = (ncId: string) => {
    setNcs((prev) => prev.filter((n) => n.id !== ncId));
  };

  // New Audit Submitted Handler
  const handleAuditSubmitted = (newAudit: FiveSAudit, newNcs: FiveSNonConformity[]) => {
    setAudits((prev) => [newAudit, ...prev]);
    if (newNcs.length > 0) {
      setNcs((prev) => [...newNcs, ...prev]);
    }
  };

  // Update Audit Handler
  const handleUpdateAudit = (auditId: string, updates: Partial<FiveSAudit>) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === auditId ? { ...a, ...updates } : a))
    );
  };

  // Delete Audit Handler
  const handleDeleteAudit = (auditId: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== auditId));
  };

  // Step 1: Render 5S Login Page if not signed in
  if (!fivesUser) {
    return (
      <FiveSLogin
        onLogin={handleLogin}
        onBackToPortal={onBackToPortal}
      />
    );
  }

  // Step 2: Render Authenticated Role-Based Workspace
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      
      {/* Top Header with Role Indicator, Scope Badge, and Logout */}
      <FiveSHeader
        currentUser={fivesUser}
        activeScreen={activeScreen}
        onScreenChange={(s) => setActiveScreen(s)}
        onLogout={handleLogout}
        onBackToPortal={onBackToPortal}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* If Reports screen is active */}
        {activeScreen === 'reports' ? (
          <FiveSReportsView
            currentUser={fivesUser}
            units={units}
            audits={audits}
            ncs={ncs}
            onBackToDashboard={() => setActiveScreen('dashboard')}
          />
        ) : (
          /* Role-Based Dashboard Auto-Routing */
          <>
            {/* Role A: Auditor */}
            {fivesUser.role === 'auditor' && (
              <AuditorDashboard
                currentUser={fivesUser}
                units={units}
                audits={audits}
                ncs={ncs}
                onUpdateNc={handleUpdateNc}
                onSaveAudit={() => {}}
                onAuditSubmitted={handleAuditSubmitted}
              />
            )}

            {/* Role B: Department In-Charge */}
            {fivesUser.role === 'incharge' && (
              <DepartmentDashboard
                currentUser={fivesUser}
                ncs={ncs}
                onUpdateNc={handleUpdateNc}
                onGoReports={() => setActiveScreen('reports')}
              />
            )}

            {/* Role C: Zonal In-Charge */}
            {fivesUser.role === 'zonal' && (
              <ZonalDashboard
                currentUser={fivesUser}
                units={units}
                audits={audits}
                ncs={ncs}
                onUpdateNc={handleUpdateNc}
                onGoReports={() => setActiveScreen('reports')}
              />
            )}

            {/* Role D: Unit Head */}
            {fivesUser.role === 'unithead' && (
              <UnitHeadDashboard
                currentUser={fivesUser}
                units={units}
                audits={audits}
                ncs={ncs}
                onGoReports={() => setActiveScreen('reports')}
                onAuditSubmitted={handleAuditSubmitted}
                onUpdateAudit={handleUpdateAudit}
                onDeleteAudit={handleDeleteAudit}
                onUpdateNc={handleUpdateNc}
                onDeleteNc={handleDeleteNc}
              />
            )}

            {/* Role E: Super Admin */}
            {fivesUser.role === 'superadmin' && (
              <SuperAdminDashboard
                currentUser={fivesUser}
                units={units}
                audits={audits}
                ncs={ncs}
                onUpdateUnits={setUnits}
                onGoReports={() => setActiveScreen('reports')}
                onAuditSubmitted={handleAuditSubmitted}
                onUpdateAudit={handleUpdateAudit}
                onDeleteAudit={handleDeleteAudit}
                onUpdateNc={handleUpdateNc}
                onDeleteNc={handleDeleteNc}
              />
            )}

            {/* Role F: President */}
            {fivesUser.role === 'president' && (
              <PresidentDashboard
                currentUser={fivesUser}
                units={units}
                audits={audits}
                ncs={ncs}
                onGoReports={() => setActiveScreen('reports')}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sankara Eye Foundation India • 5S Digital Quality Standards & Operational Excellence
          </span>
          <span className="font-semibold text-slate-600">
            All 14 Hospital Units Network • Sri Kanchi Kamakoti Medical Trust
          </span>
        </div>
      </footer>

    </div>
  );
};
