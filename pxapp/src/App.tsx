import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  HospitalUnit,
  Bottleneck,
  DbHealthStatus,
  UnitHeadTab,
  OpsTeamTab,
  SuperAdminTab,
  PortalView
} from './types';
import { calculateOrgStats } from './utils/calc';
import { INITIAL_UNITS } from './data/seedData';
import { api } from './services/api';
import { LoginPage } from './components/LoginPage';
import { PortalSelector } from './components/PortalSelector';
import { FiveSInProgressView } from './components/FiveSInProgressView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UnitHeadView } from './components/UnitHeadView';
import { OperationsTeamView } from './components/OperationsTeamView';
import { SuperAdminView } from './components/SuperAdminView';
import { AuditLogModal } from './components/AuditLogModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  // Authentication state from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('sankara_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (_) {
      return null;
    }
  });

  // Dual-Portal Selection State: 'portal' | '5s' | 'bottleneck'
  const [portalView, setPortalView] = useState<PortalView>('portal');

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Left Sidebar Tab selections per role
  const [activeUnitTab, setActiveUnitTab] = useState<UnitHeadTab>('dashboard');
  const [activeOpsTab, setActiveOpsTab] = useState<OpsTeamTab>('dashboard');
  const [activeAdminTab, setActiveAdminTab] = useState<SuperAdminTab>('dashboard');

  // Selected unit (for Unit Head it's their assigned unit; for Super Admin it can be toggled)
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-panvel');
  const [units, setUnits] = useState<HospitalUnit[]>(INITIAL_UNITS);
  const [dbHealth, setDbHealth] = useState<DbHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Update selected unit when current user changes (for Unit Head)
  useEffect(() => {
    if (currentUser?.role === 'Unit Head' && currentUser.unitId) {
      setSelectedUnitId(currentUser.unitId);
    }
  }, [currentUser]);

  // Toast notifications helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load data from PostgreSQL
  const loadData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [unitsData, healthData] = await Promise.all([
        api.getUnits(),
        api.getHealth()
      ]);
      setUnits(unitsData);
      setDbHealth(healthData);
    } catch (err: any) {
      console.warn('Backend load warning:', err.message);
      setDbHealth({
        status: 'error',
        database: 'PostgreSQL Syncing',
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.getHealth().then(setDbHealth).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setPortalView('portal');
    addToast('Logged out successfully', 'info');
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.unitId) {
      setSelectedUnitId(user.unitId);
    }
    setPortalView('portal');
    addToast(`Welcome back, ${user.name}! Logged in as ${user.role}.`, 'success');
  };

  // Org Stats
  const orgStats = calculateOrgStats(units);

  // 1. Update Bottleneck
  const handleUpdateBottleneck = async (
    unitId: string,
    bottleneckId: string,
    updates: Partial<Bottleneck>
  ) => {
    // Optimistic update
    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id !== unitId) return unit;
        return {
          ...unit,
          isAssessed: true,
          bottlenecks: unit.bottlenecks.map((b) => (b.id === bottleneckId ? { ...b, ...updates } : b))
        };
      })
    );

    try {
      await api.updateBottleneck(bottleneckId, {
        ...updates,
        userRole: currentUser?.role || 'Unit Head'
      });
      if (updates.percentComplete === 100) {
        addToast('Bottleneck resolved and moved to Completed archive!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to sync bottleneck update:', err);
      addToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // 2. Add Bottleneck
  const handleAddBottleneck = async (
    unitId: string,
    newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>
  ) => {
    const tempId = `${unitId}-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const tempItem: Bottleneck = {
      ...newBottleneck,
      id: tempId,
      lastUpdated: today
    };

    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id !== unitId) return unit;
        return {
          ...unit,
          isAssessed: true,
          bottlenecks: [tempItem, ...unit.bottlenecks]
        };
      })
    );

    try {
      const created = await api.createBottleneck({
        unitId,
        title: newBottleneck.title,
        category: newBottleneck.category,
        department: newBottleneck.department,
        status: newBottleneck.status,
        percentComplete: newBottleneck.percentComplete,
        owner: newBottleneck.owner,
        impactLevel: newBottleneck.impactLevel,
        targetDate: newBottleneck.targetDate,
        notes: newBottleneck.notes,
        remarks: newBottleneck.remarks,
        beforePhotos: newBottleneck.beforePhotos,
        afterPhotos: newBottleneck.afterPhotos,
        tasks: newBottleneck.tasks,
        userRole: currentUser?.role || 'Unit Head'
      });

      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (unit.id !== unitId) return unit;
          return {
            ...unit,
            bottlenecks: unit.bottlenecks.map((b) => (b.id === tempId ? created : b))
          };
        })
      );

      addToast('Bottleneck created and logged in registry!', 'success');
    } catch (err: any) {
      console.error('Failed to create bottleneck:', err);
      addToast(`Creation failed: ${err.message}`, 'error');
    }
  };

  // 3. Delete Bottleneck
  const handleDeleteBottleneck = async (unitId: string, bottleneckId: string) => {
    if (!window.confirm('Are you sure you want to delete this bottleneck from the registry?')) {
      return;
    }

    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id !== unitId) return unit;
        const remaining = unit.bottlenecks.filter((b) => b.id !== bottleneckId);
        return {
          ...unit,
          isAssessed: remaining.length > 0,
          bottlenecks: remaining
        };
      })
    );

    try {
      await api.deleteBottleneck(bottleneckId, currentUser?.role || 'Unit Head');
      addToast('Bottleneck removed from registry', 'info');
    } catch (err: any) {
      console.error('Failed to delete bottleneck:', err);
      addToast(`Delete failed: ${err.message}`, 'error');
      loadData(true);
    }
  };

  // 4. Initialize Unit Assessment
  const handleInitializeUnitAssessment = async (unitId: string) => {
    try {
      const res = await api.initializeUnitAssessment(unitId);
      if (res.success && res.unit) {
        setUnits((prev) => prev.map((u) => (u.id === unitId ? res.unit : u)));
        addToast(`Baseline assessment initialized for ${res.unit.name}!`, 'success');
      }
    } catch (err: any) {
      console.error('Failed to initialize assessment:', err);
      addToast(`Init failed: ${err.message}`, 'error');
    }
  };

  // 5. Reset Database (Super Admin)
  const handleResetData = async () => {
    if (window.confirm('Reset all hospital units and bottlenecks to baseline state?')) {
      setIsLoading(true);
      try {
        await api.resetDatabase();
        await loadData();
        addToast('Database reset to initial state successfully.', 'info');
      } catch (err: any) {
        addToast(`Reset failed: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 6. Seed All 14 Units (Super Admin)
  const handleSeedAllUnits = async () => {
    if (window.confirm('Populate realistic operational bottlenecks across all 14 units?')) {
      setIsLoading(true);
      try {
        const res = await api.seedAllUnits();
        await loadData();
        addToast(res.message || 'All 14 units updated with baseline data!', 'success');
      } catch (err: any) {
        addToast(`Seeding failed: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Step 1: Render Login Page if not authenticated
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Step 2: Render Dual-Portal Selection Screen
  if (portalView === 'portal') {
    return (
      <>
        <PortalSelector
          currentUser={currentUser}
          onSelectPortal={(portal) => setPortalView(portal)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
        />
      </>
    );
  }

  // Step 3: Render 5S Kaizen Audit In-Progress View
  if (portalView === '5s') {
    return (
      <FiveSInProgressView
        currentUser={currentUser}
        onBack={() => setPortalView('portal')}
      />
    );
  }

  // Step 4: Render Full Bottleneck (PPE) Workspace with Left Sidebar Pane
  const isSuperAdminOrPresident = currentUser.role === 'Super Admin' || currentUser.role === 'IT Admin' || currentUser.role === 'President' || currentUser.name.toLowerCase().includes('president') || currentUser.email.toLowerCase().includes('president');

  const currentTab = currentUser.role === 'Unit Head'
    ? activeUnitTab
    : isSuperAdminOrPresident
    ? activeAdminTab
    : activeOpsTab;

  const handleTabChange = (tab: any) => {
    if (currentUser.role === 'Unit Head') {
      if (tab === 'profile') setIsProfileModalOpen(true);
      else setActiveUnitTab(tab);
    } else if (isSuperAdminOrPresident) {
      setActiveAdminTab(tab);
    } else {
      setActiveOpsTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex selection:bg-orange-500 selection:text-white">
      
      {/* Left Sidebar Pane Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={currentTab}
        onTabChange={handleTabChange}
        onBackToPortal={() => setPortalView('portal')}
        units={units}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header with Breadcrumbs, Global Back Button & User Profile */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onRefreshData={() => {
            loadData();
            addToast('Refreshed live network records', 'info');
          }}
          onGlobalBack={() => setPortalView('portal')}
          canGoBack={true}
          backLabel="Switch Module Portal"
          pageTitle={
            currentUser.role === 'Unit Head'
              ? `${currentUser.unitName || 'Hospital Unit'} • Patient Experience`
              : 'Project Patient Experience (PPE) • Operations Directorate'
          }
          assessedCount={orgStats.assessedUnits}
          totalUnits={orgStats.totalUnits}
          orgAvgPercent={orgStats.orgAvgPercent}
          isLoading={isLoading}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-8 py-6">
          
          {/* Tier 1: Unit Head Workspace */}
          {currentUser.role === 'Unit Head' && (
            <UnitHeadView
              units={units}
              selectedUnitId={currentUser.unitId || selectedUnitId}
              currentUser={currentUser}
              activeTab={activeUnitTab}
              onUpdateBottleneck={handleUpdateBottleneck}
              onAddBottleneck={handleAddBottleneck}
              onDeleteBottleneck={handleDeleteBottleneck}
              onInitializeUnitAssessment={handleInitializeUnitAssessment}
              allowUnitSwitch={false}
            />
          )}

          {/* Tier 2: Operations Team / Super Admin View Only */}
          {!isSuperAdminOrPresident && currentUser.role !== 'Unit Head' && (
            <OperationsTeamView
              units={units}
              activeTab={activeOpsTab}
              currentUser={currentUser}
              onSelectUnitHead={setSelectedUnitId}
              onInitializeUnitAssessment={handleInitializeUnitAssessment}
              onUpdateBottleneck={handleUpdateBottleneck}
              onAddBottleneck={handleAddBottleneck}
              onDeleteBottleneck={handleDeleteBottleneck}
              onRefreshUnits={() => loadData(true)}
            />
          )}

          {/* Tier 3: Super Admin & President Workspace (All Access) */}
          {isSuperAdminOrPresident && (
            <SuperAdminView
              units={units}
              activeTab={activeAdminTab}
              currentUser={currentUser}
              dbHealth={dbHealth}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              onUpdateBottleneck={handleUpdateBottleneck}
              onAddBottleneck={handleAddBottleneck}
              onDeleteBottleneck={handleDeleteBottleneck}
              onInitializeUnitAssessment={handleInitializeUnitAssessment}
              onResetData={handleResetData}
              onSeedAllUnits={handleSeedAllUnits}
              onOpenAuditLogs={() => setIsAuditModalOpen(true)}
              onRefreshUnits={() => loadData(true)}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <img src="/sankara-emblem.png" alt="Sankara" className="w-5 h-5 object-contain" />
              <span className="font-black text-slate-800">Sankara Eye Foundation, India</span>
              <span>•</span>
              <span>Sri Kanchi Kamakoti Medical Trust</span>
            </div>
            <div className="font-semibold text-slate-600 flex items-center gap-2">
              <span>Business Excellence Application • Project Patient Experience</span>
            </div>
          </div>
        </footer>

      </div>

      {/* User Profile & Change Password Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-orange-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
