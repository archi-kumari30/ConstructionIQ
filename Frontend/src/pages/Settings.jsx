import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Laptop, User, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useSocket();

  // Load preferences from local storage
  const [region, setRegion] = useState(() => localStorage.getItem('regionContext') || 'in-west');
  const [pushAlerts, setPushAlerts] = useState(() => localStorage.getItem('notifPushAlerts') !== 'false');
  const [aiAnomalyAlerts, setAiAnomalyAlerts] = useState(() => localStorage.getItem('notifAiAnomalyAlerts') !== 'false');
  
  const [activeCategory, setActiveCategory] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate small saving lag for UX
    setTimeout(() => {
      localStorage.setItem('regionContext', region);
      localStorage.setItem('notifPushAlerts', String(pushAlerts));
      localStorage.setItem('notifAiAnomalyAlerts', String(aiAnomalyAlerts));
      
      setSaving(false);
      setSuccess(true);
      addToast(
        'Preferences Updated',
        'Your user operations preferences have been saved successfully.',
        'success'
      );
      
      // Clear success banner after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    }, 600);
  };

  const formatRole = (r) => {
    if (!r) return '';
    return r.split('_').map(w => w.toUpperCase()).join(' ');
  };

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }} className="animate-fade-slide-up">
      {/* Page Header */}
      <div>
        <div style={{ fontSize: '10px', color: '#C1440E', letterSpacing: '1.5px', fontWeight: 600, fontFamily: 'var(--font-title)', marginBottom: '6px', textTransform: 'uppercase' }}>
          CONSTRUCTION OPERATIONS PLATFORM
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
          Settings
        </h1>
        <p style={{ color: '#6B7280', fontSize: '13.5px', margin: '4px 0 0 0' }}>
          Configure user preferences, notification rules, and regional operational scopes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 7fr', gap: '32px', alignItems: 'start' }} className="responsive-settings-split">
        <style>{`
          @media (max-width: 768px) {
            .responsive-settings-split {
              grid-template-columns: 1fr !important;
            }
          }
          .settings-menu-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            border: none;
            background: none;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-muted);
            cursor: pointer;
            text-align: left;
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
          }
          .settings-menu-btn.active {
            border-left-color: #C1440E;
            color: #C1440E;
            background-color: rgba(193, 68, 14, 0.02);
            font-weight: 600;
          }
          .settings-menu-btn:hover {
            color: var(--text-primary);
          }
        `}</style>

        {/* Settings categories menu */}
        <div className="card" style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              className={`settings-menu-btn ${activeCategory === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveCategory('profile')}
            >
              <User size={16} /> Account Profile
            </button>
            <button 
              className={`settings-menu-btn ${activeCategory === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveCategory('notifications')}
            >
              <Bell size={16} /> Operations Alerts
            </button>
            <button 
              className={`settings-menu-btn ${activeCategory === 'security' ? 'active' : ''}`}
              onClick={() => setActiveCategory('security')}
            >
              <Shield size={16} /> Roles & Security
            </button>
          </div>
        </div>

        {/* Content Form Card */}
        <div className="card" style={{ padding: '28px' }}>
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid rgba(22, 163, 74, 0.1)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '20px'
            }}>
              <Check size={16} />
              <span>User preferences saved. Your changes have been recorded.</span>
            </div>
          )}

          {activeCategory === 'profile' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#1A1A1A', marginBottom: '24px' }}>Account Information</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-settings-split">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value={user?.name || 'Archi Kumari'} disabled />
                    <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Name updates must be requested via admin logs.</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={user?.email || 'pm@constructioniq.com'} disabled />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-settings-split">
                  <div className="form-group">
                    <label className="form-label">System Platform Access Role</label>
                    <input type="text" className="form-input" value={formatRole(user?.role) || 'PROJECT_MANAGER'} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Indian Region Context</label>
                    <select 
                      className="form-select" 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="in-west">Western Region (Gujarat/Maharashtra)</option>
                      <option value="in-north">Northern Region (NCR/Punjab)</option>
                      <option value="in-south">Southern Region (Karnataka/Tamil Nadu)</option>
                      <option value="in-east">Eastern Region (West Bengal/Odisha)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">System Currency Context</label>
                  <input type="text" className="form-input" value="INR (₹) — Indian Rupee" disabled />
                  <small style={{ color: '#6B7280', fontSize: '11px' }}>This workspace displays project budget data in crores and lakhs using en-IN local formats.</small>
                </div>

                <div style={{ borderTop: '1px solid #E8E5DF', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeCategory === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#1A1A1A', marginBottom: '8px' }}>Operations Alert Rules</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Toggle which warnings from BullMQ background jobs trigger floating browser alerts.
              </p>
              
              <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Push alerts */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="pushAlerts"
                      checked={pushAlerts}
                      onChange={(e) => setPushAlerts(e.target.checked)}
                      style={{ marginTop: '4px', cursor: 'pointer' }}
                    />
                    <label htmlFor="pushAlerts" style={{ cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Enable Real-time Socket.IO Alerts</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Receive instant notifications when materials fall below threshold limits or safety incidents are reported.
                      </div>
                    </label>
                  </div>

                  {/* AI Alerts */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="aiAnomalyAlerts"
                      checked={aiAnomalyAlerts}
                      onChange={(e) => setAiAnomalyAlerts(e.target.checked)}
                      style={{ marginTop: '4px', cursor: 'pointer' }}
                    />
                    <label htmlFor="aiAnomalyAlerts" style={{ cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>AI Audit Budget & Expense Flag warnings</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Alert when site expenses exceed allocated category budget margin thresholds.
                      </div>
                    </label>
                  </div>

                </div>

                <div style={{ borderTop: '1px solid #E8E5DF', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }} disabled={saving}>
                    {saving ? 'Saving Alerts...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeCategory === 'security' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#1A1A1A', marginBottom: '12px' }}>Platform Roles & Security</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Your current account permissions and backend authorization credentials overview.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 600 }}>Authorized Role:</span>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{user?.role || 'PROJECT_MANAGER'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 600 }}>Project Access Level:</span>
                  <span style={{ color: 'var(--text-muted)' }}>Role-based Access Control (RBAC) enforced</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 600 }}>Session Token Expiry:</span>
                  <span style={{ color: 'var(--text-muted)' }}>Managed dynamically (Silent Cookie Refresh active)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
