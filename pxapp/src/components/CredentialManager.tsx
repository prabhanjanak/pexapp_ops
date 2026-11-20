import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Server,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Database,
  Cpu,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface CredentialManagerProps {
  currentUser: User;
}

export const CredentialManager: React.FC<CredentialManagerProps> = ({ currentUser }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // SMTP Credentials State
  const [smtpHost, setSmtpHost] = useState('smtp.zoho.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('is.support@sankaraeye.com');
  const [smtpPass, setSmtpPass] = useState('3fKebcsUWLWr');
  const [smtpFrom, setSmtpFrom] = useState('"Sankara 5S Operations Desk" <is.support@sankaraeye.com>');
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // System Environment Specs
  const [systemSpecs, setSystemSpecs] = useState<any>(null);

  // Testing & Saving State
  const [testEmail, setTestEmail] = useState(currentUser.email || 'is.support@sankaraeye.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Check existing session unlock token
  useEffect(() => {
    const savedToken = sessionStorage.getItem('sankara_admin_cred_token');
    const savedPass = sessionStorage.getItem('sankara_admin_cred_pass');
    if (savedToken && savedPass) {
      setPasscode(savedPass);
      handleUnlockWithPass(savedPass);
    }
  }, []);

  const handleUnlockWithPass = async (passToTry: string) => {
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      const res = await api.unlockCredentials(passToTry);
      if (res.success) {
        setIsUnlocked(true);
        sessionStorage.setItem('sankara_admin_cred_token', res.token);
        sessionStorage.setItem('sankara_admin_cred_pass', passToTry);

        // Fetch current active credentials
        const data = await api.getCredentials(passToTry);
        if (data.smtp) {
          setSmtpHost(data.smtp.host || 'smtp.zoho.com');
          setSmtpPort(String(data.smtp.port || '465'));
          setSmtpSecure(data.smtp.secure !== false);
          setSmtpUser(data.smtp.user || 'is.support@sankaraeye.com');
          setSmtpPass(data.smtp.pass || '3fKebcsUWLWr');
          setSmtpFrom(data.smtp.from || '"Sankara 5S Operations Desk" <is.support@sankaraeye.com>');
        }
        if (data.system) {
          setSystemSpecs(data.system);
        }
      }
    } catch (err: any) {
      setUnlockError(err.message || 'Incorrect administrative security passcode. Access denied.');
      setIsUnlocked(false);
      sessionStorage.removeItem('sankara_admin_cred_token');
      sessionStorage.removeItem('sankara_admin_cred_pass');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setUnlockError('Please enter the administrative security passcode');
      return;
    }
    handleUnlockWithPass(passcode.trim());
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    setPasscode('');
    sessionStorage.removeItem('sankara_admin_cred_token');
    sessionStorage.removeItem('sankara_admin_cred_pass');
    setTestResult(null);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
  };

  const handleTestSmtp = async () => {
    if (!testEmail.trim() || !testEmail.includes('@')) {
      alert('Please enter a valid recipient email address for the test ping');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const currentConfig = {
        host: smtpHost.trim(),
        port: smtpPort.trim(),
        secure: smtpSecure,
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
        from: smtpFrom.trim()
      };

      const res = await api.testAdminSmtp(passcode, testEmail.trim(), currentConfig);
      if (res.success) {
        setTestResult({
          success: true,
          message: `✓ Connection verified! Test email delivered to ${res.recipient}`,
          messageId: res.messageId
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'SMTP authentication failed. Please verify host, port, user, and application password.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInjectCredentials = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    try {
      const payload = {
        host: smtpHost.trim(),
        port: smtpPort.trim(),
        secure: smtpSecure,
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
        from: smtpFrom.trim()
      };

      const res = await api.saveCredentials(passcode, payload, currentUser.email);
      if (res.success) {
        setSaveSuccessMsg('✓ Production credentials updated, stored in PostgreSQL, and injected into live runtime environment!');
        setTimeout(() => setSaveSuccessMsg(null), 8000);
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to inject credentials into production environment.');
    } finally {
      setIsSaving(false);
    }
  };

  // If Locked: Render Security Challenge Screen
  if (!isUnlocked) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                Restricted Master Access
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Production Credential Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter the master administrative security passcode to view, update, test, and inject SMTP & production environment credentials.
            </p>
          </div>

          {unlockError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          <form onSubmit={handleManualUnlock} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Administrative Security Passcode..."
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                title={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isUnlocking || !passcode}
              className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlocking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Production Credentials</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sri Kanchi Kamakoti Medical Trust • 256-Bit Authenticated Gateway</span>
          </div>

        </div>
      </div>
    );
  }

  // If Unlocked: Render Master Credential Configuration Panel
  return (
    <div className="space-y-6">
      
      {/* Top Unlocked Status & Lock Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Production Credential Manager
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Unlocked & Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Authenticated with Super Administrator Master Passcode • Injects directly to live production
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLockSession}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Lock Session</span>
        </button>
      </div>

      {/* Success Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
          <button onClick={() => setSaveErrorMsg(null)} className="text-rose-700 hover:text-rose-950 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: SMTP Server Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Outgoing SMTP Mail Server Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Used for automated 5S audit reports, NC escalations, and executive bottleneck alerts
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                Zoho Mail / Custom SMTP
              </span>
            </div>

            <div className="space-y-4">
              
              {/* Host & Port */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.zoho.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Port
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="465"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Encryption Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Connection Security & Encryption
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpSecure(true);
                      if (smtpPort === '587') setSmtpPort('465');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      smtpSecure
                        ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs font-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${smtpSecure ? 'bg-orange-600' : 'bg-slate-300'}`} />
                    <span>SSL Encrypted (Port 465)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpSecure(false);
                      if (smtpPort === '465') setSmtpPort('587');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !smtpSecure
                        ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs font-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${!smtpSecure ? 'bg-orange-600' : 'bg-slate-300'}`} />
                    <span>TLS / STARTTLS (Port 587)</span>
                  </button>
                </div>
              </div>

              {/* User Account / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  SMTP Username / Authorized Email ID
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="is.support@sankaraeye.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Application Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Application Password / Token
                  </label>
                  <span className="text-[11px] text-slate-400">Zoho App-Specific Password</span>
                </div>
                <div className="relative">
                  <input
                    type={showSmtpPass ? 'text' : 'password'}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="Enter Application Password..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={showSmtpPass ? 'Hide password' : 'Show password'}
                  >
                    {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sender Display Header */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Default Sender Display Header
                </label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder='"Sankara 5S Operations Desk" <is.support@sankaraeye.com>'
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

            </div>

            {/* Main Injection Action Button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Updates runtime memory, records in PostgreSQL, and synchronizes <code>.env</code> files.
              </div>
              <button
                type="button"
                onClick={handleInjectCredentials}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Injecting into Production...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Inject & Apply to Production</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Col: Live SMTP Testing & Server Specs */}
        <div className="space-y-6">
          
          {/* Live SMTP Diagnostic Test Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Live SMTP Health Test
                </h3>
                <p className="text-[11px] text-slate-500">
                  Send a real-time verification ping to verify credentials
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Recipient Test Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="prabhanjan@sankaraeye.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTesting}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                    <span>Verifying with Mail Server...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>Test SMTP Connection</span>
                  </>
                )}
              </button>

              {/* Test Results Banner */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs font-semibold space-y-1 animate-in fade-in ${
                  testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div>{testResult.message}</div>
                  {testResult.messageId && (
                    <div className="text-[10px] font-mono opacity-80">
                      Message ID: {testResult.messageId}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Production Server Specs Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
              <Server className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Production Server Environment
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Node Environment:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {systemSpecs?.nodeEnv || 'production'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">PostgreSQL Host:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {systemSpecs?.pgHost || 'localhost'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Name:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {systemSpecs?.pgDatabase || 'sankara_px'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Port:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {systemSpecs?.pgPort || '5432'}
                </span>
              </div>
              {systemSpecs?.uptime !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Server Uptime:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {Math.round(systemSpecs.uptime / 60)} mins
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-400">
              Data on Sankara IP <code>192.168.1.244</code> remains fully isolated and protected.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

