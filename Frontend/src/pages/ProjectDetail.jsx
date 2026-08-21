import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { formatINR } from '../utils/format';
import OverviewTab from '../components/project/OverviewTab';
import TeamTab from '../components/project/TeamTab';
import MilestonesTab from '../components/project/MilestonesTab';
import InventoryTab from '../components/project/InventoryTab';
import RequestsTab from '../components/project/RequestsTab';
import BookingsTab from '../components/project/BookingsTab';
import AttendanceTab from '../components/project/AttendanceTab';
import DeliveriesTab from '../components/project/DeliveriesTab';
import BudgetsTab from '../components/project/BudgetsTab';
import IncidentsTab from '../components/project/IncidentsTab';
import ReportsTab from '../components/project/ReportsTab';
import { Landmark, MapPin, Loader2 } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isProjectManager } = useAuth();
  const { joinProjectRoom } = useSocket();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProjectHeader = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data?.data || null);
      
      // Join WebSocket project room on load
      joinProjectRoom(id);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/unauthorized');
      } else {
        console.error('Failed to load project header:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectHeader();
  }, [id]);

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading project workspace...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Project Workspace Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The project ID does not exist or has been deleted.</p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'team', label: 'Team' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'requests', label: 'Requests' },
    { key: 'bookings', label: 'Bookings & Telemetry' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'deliveries', label: 'Deliveries' },
    { key: 'budgets', label: 'Budgets & Expenses' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'reports', label: 'Reports & Insights' }
  ];

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'active': return 'badge-success';
      case 'planning': return 'badge-info';
      case 'completed': return 'badge-success';
      default: return 'badge-danger';
    }
  };

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Profile Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '5px solid var(--primary-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={`badge ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{project.name}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <MapPin size={14} />
              <span>{project.location}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Allocated Budget</div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary-light)', marginTop: '2px' }}>
                {formatINR(project.budgetEstimated)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Project Manager</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)', marginTop: '4px' }}>
                {project.manager?.name || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scrollable tab bar */}
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab content renders dynamically (lazy-loads endpoints on mount) */}
      <div style={{ minHeight: '40vh' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
            onUpdate={handleProjectUpdated}
          />
        )}
        {activeTab === 'team' && (
          <TeamTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'milestones' && (
          <MilestonesTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'requests' && (
          <RequestsTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab
            projectId={id}
          />
        )}
        {activeTab === 'deliveries' && (
          <DeliveriesTab
            projectId={id}
          />
        )}
        {activeTab === 'budgets' && (
          <BudgetsTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'incidents' && (
          <IncidentsTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab
            projectId={id}
            isAdmin={isAdmin}
            isProjectManager={isProjectManager}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
