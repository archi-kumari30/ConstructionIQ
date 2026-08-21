import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Users, ShieldAlert, CheckCircle, Plus, Loader2, ArrowRight, UserPlus } from 'lucide-react';

const SiteOperations = () => {
  const { isAdmin, isProjectManager } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Dynamic metrics
  const [reports, setReports] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [compiling, setCompiling] = useState(false);

  // Sync project select box with localStorage context
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('activeProjectId', selectedProjectId);
      window.dispatchEvent(new Event('projectContextChanged'));
    }
  }, [selectedProjectId]);

  // 1. Fetch all projects first
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api.get('/projects');
        const list = res.data?.data?.projects || [];
        setProjects(list);
        
        const cachedId = localStorage.getItem('activeProjectId');
        if (cachedId && list.some(p => p.id === cachedId || p._id === cachedId)) {
          setSelectedProjectId(cachedId);
        } else if (list.length > 0) {
          setSelectedProjectId(list[0].id || list[0]._id);
        }
      } catch (err) {
        console.error('Error fetching projects list:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch project metrics when selected project ID changes
  const fetchProjectData = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingData(true);
      const [reportsRes, teamRes, incidentsRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/reports`),
        api.get(`/projects/${selectedProjectId}/team`),
        api.get(`/projects/${selectedProjectId}/incidents`)
      ]);
      setReports(reportsRes.data?.data?.reports || []);
      setTeamMembers(teamRes.data?.data || []);
      setIncidents(incidentsRes.data?.data?.incidents || []);
    } catch (err) {
      console.error('Error loading project metrics:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    // Listen for socket compilation completions
    const handleReportCompiled = () => {
      setCompiling(false);
      fetchProjectData();
    };

    window.addEventListener('report-compiled', handleReportCompiled);
    return () => {
      window.removeEventListener('report-compiled', handleReportCompiled);
    };
  }, [selectedProjectId]);

  const handleCompileReport = async () => {
    try {
      setCompiling(true);
      await api.post(`/projects/${selectedProjectId}/reports`, {
        date: new Date().toISOString()
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger daily log compilation.');
      setCompiling(false);
    }
  };

  const latestReport = reports[0] || null;
  const activeCrewCount = teamMembers.length;
  const openIncidentsCount = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const totalIncidents = incidents.length;
  
  // Calculate safety score (start at 100%, deduct 10% for each open hazard)
  const safetyScore = Math.max(100 - openIncidentsCount * 10, 50);

  const canModify = isAdmin || isProjectManager;

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={28} color="var(--primary)" />
        <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading operations workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }} className="animate-fade-slide-up">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#C1440E', letterSpacing: '1.5px', fontWeight: 600, fontFamily: 'var(--font-title)', marginBottom: '6px', textTransform: 'uppercase' }}>
            CONSTRUCTION OPERATIONS PLATFORM
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
            Site Operations
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            Coordinate daily shift logs, roster team members, and check safety audits dynamically.
          </p>
        </div>

        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Project:</span>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: '220px', padding: '6px 12px' }}
            >
              {projects.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card" style={{ padding: '40px' }}>
          <ClipboardList size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects active</span>
          <span className="empty-state-desc">Create or assign projects first before managing site operations.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Daily Shift Log Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#FDF4F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={20} color="#C1440E" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Daily Shift Log</h3>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  {latestReport ? `Compiled: ${new Date(latestReport.date).toLocaleDateString()}` : 'No logs compiled'}
                </span>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {latestReport ? (
                <>
                  <p style={{ fontSize: '13px', color: '#1A1A1A', margin: 0, fontWeight: 500 }}>
                    Latest Log: "Weather is {latestReport.weather || 'Sunny'} with {latestReport.workforceCount || 0} crew present."
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontStyle: 'italic' }}>
                    "{latestReport.notes || 'No notes compiled'}"
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  No shift log compiled. Collect supervisor checklists and compile the daily operations report PDF.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              {canModify && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleCompileReport} 
                  disabled={compiling}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {compiling ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                  <span>{compiling ? 'Compiling...' : 'Compile Log'}</span>
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/reports')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <span>View History</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Team Coordination Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#FDF4F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#C1440E" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Team Coordination</h3>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Active Roster: {activeCrewCount} Members</span>
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, flex: 1 }}>
              {activeCrewCount > 0 
                ? `Assign and remove site engineers, suppliers and sub-contractors attached to the project workspace. Currently ${activeCrewCount} user roles mapped.`
                : 'No workers or crew members assigned to this project team yet. Invite users to coordinate.'
              }
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <UserPlus size={12} />
                <span>Manage Roster</span>
              </button>
            </div>
          </div>

          {/* Safety Incidents Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#FDF4F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={20} color="#C1440E" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Safety Audits</h3>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  Open Hazards: {openIncidentsCount}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                Safety compliance score is at <strong>{safetyScore}%</strong>.
              </p>
              <p style={{ fontSize: '12.5px', color: '#1A1A1A', margin: 0, fontWeight: 500 }}>
                Total incident history entries logged: {totalIncidents}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/safety')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <span>Open Safety Ledger</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SiteOperations;
