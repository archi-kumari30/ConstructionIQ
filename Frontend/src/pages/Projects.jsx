import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Search, Calendar, Landmark, MapPin, Loader2, ArrowUpDown, Folder } from 'lucide-react';
import { formatINRCompact } from '../utils/format';
import { normalizeProjectStatus, getStatusBadgeColor } from '../utils/statusNormalizer';

const Projects = () => {
  const { user, isAdmin, isProjectManager } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, 'active' (On Track), 'planning' (At Risk), 'suspended' (Delayed), 'completed' (Completed)
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal create state
  const [modalOpen, setModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    budgetEstimated: '',
    managerId: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      if (isProjectManager && user) {
        setNewProject((prev) => ({
          ...prev,
          managerId: user.id || user._id || ''
        }));
      } else {
        setNewProject((prev) => ({
          ...prev,
          managerId: ''
        }));
      }
    }
  }, [modalOpen, isProjectManager, user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects?search=${search}&limit=1000`);
      setProjects(response.data?.data?.projects || []);
    } catch (error) {
      console.error('Error loading projects list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, location, startDate, endDate, budgetEstimated, managerId } = newProject;
    if (!name || !location || !startDate || !endDate || !budgetEstimated || !managerId) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (name.length > 150) {
      setFormError('Project name cannot exceed 150 characters.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date must be greater than or equal to start date.');
      return;
    }

    if (parseFloat(budgetEstimated) < 0) {
      setFormError('Estimated budget cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/projects', {
        name,
        location,
        startDate,
        endDate,
        budgetEstimated: parseFloat(budgetEstimated),
        managerId
      });
      
      const created = res.data?.data;
      setModalOpen(false);
      setNewProject({ name: '', location: '', startDate: '', endDate: '', budgetEstimated: '', managerId: '' });
      if (created?.id || created?._id) {
        navigate(`/projects/${created.id || created._id}`);
      } else {
        fetchProjects();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mock progress and mapping details dynamically based on index for rendering
  const getProjectDisplayDetails = (proj, index) => {
    const defaultProgress = [72, 45, 60, 30];
    const defaultDates = ['18 Aug 2026', '28 Aug 2026', '12 Sep 2026', '30 Sep 2026'];
    return {
      progress: defaultProgress[index % 4],
      dueDate: proj.endDate ? new Date(proj.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : defaultDates[index % 4]
    };
  };

  // Filter client-side
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'all') return true;
    const mapped = normalizeProjectStatus(p.status);
    return mapped.toLowerCase().replace(' ', '') === statusFilter.toLowerCase();
  });

  // Sort client-side
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'status') {
      aVal = normalizeProjectStatus(a.status);
      bVal = normalizeProjectStatus(b.status);
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-slide-up">
      
      {/* 1. Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <span>Dashboard</span>
            <span>/</span>
            <span style={{ color: '#C1440E', fontWeight: 500 }}>Projects</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
            Projects
          </h1>
        </div>

        {(isAdmin || isProjectManager) && (
          <button 
            className="btn btn-primary" 
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', borderRadius: '6px', height: '40px', fontWeight: 600, padding: '0 16px' }}
          >
            <Plus size={15} style={{ marginRight: '6px' }} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* 2. Filter Tabs & Search Group */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E8E5DF', paddingBottom: '16px' }}>
        
        {/* Left: Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { label: 'All Projects', value: 'all' },
            { label: 'On Track', value: 'ontrack' },
            { label: 'At Risk', value: 'atrisk' },
            { label: 'Delayed', value: 'delayed' },
            { label: 'Completed', value: 'completed' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: statusFilter === tab.value ? 600 : 500,
                color: statusFilter === tab.value ? '#C1440E' : '#6B7280',
                border: 'none',
                background: statusFilter === tab.value ? 'rgba(193, 68, 14, 0.08)' : 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Search box */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '260px' }}>
          <Search size={14} color="#6B7280" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search projects..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', height: '38px', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
          />
        </div>
      </div>

      {/* 3. Table Workspace */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
          <Loader2 className="animate-spin" size={24} color="var(--accent)" />
          <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading project files...</span>
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid #E8E5DF', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <Folder size={32} color="#6B7280" style={{ margin: '0 auto 12px auto' }} />
          <span className="empty-state-title" style={{ fontSize: '15px', fontWeight: 600, display: 'block' }}>No projects found</span>
          <span className="empty-state-desc" style={{ fontSize: '13px', color: '#6B7280' }}>
            No workspace folders match your active filters or query.
          </span>
        </div>
      ) : (
        <div className="table-container" style={{ border: '1px solid #E8E5DF', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E5DF', backgroundColor: '#FAF7F2' }}>
                <th onClick={() => handleSort('name')} style={{ padding: '14px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>PROJECT</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>PROGRESS</th>
                <th onClick={() => handleSort('budgetEstimated')} style={{ padding: '14px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>BUDGET</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} style={{ padding: '14px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>STATUS</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('endDate')} style={{ padding: '14px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>DUE DATE</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((project, idx) => {
                const id = project.id || project._id;
                const mappedStatus = normalizeProjectStatus(project.status);
                const colors = getStatusBadgeColor(mappedStatus);
                const display = getProjectDisplayDetails(project, idx);
                
                return (
                  <tr
                    key={id}
                    onClick={() => navigate(`/projects/${id}`)}
                    style={{ borderBottom: '1px solid #E8E5DF', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF7F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Project Name and location */}
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', display: 'block' }}>{project.name}</span>
                      <span style={{ fontSize: '11px', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {project.location || 'Site Location'}
                      </span>
                    </td>

                    {/* Mapped mockup Progress */}
                    <td style={{ padding: '16px', width: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1A1A1A' }}>{display.progress}%</span>
                        <div style={{ flex: 1, height: '4px', backgroundColor: '#FAF7F2', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${display.progress}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Mapped estimated budget formatted in INR compact */}
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                      {formatINRCompact(project.budgetEstimated)}
                    </td>

                    {/* Mapped status badge */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        textTransform: 'uppercase'
                      }}>
                        {mappedStatus}
                      </span>
                    </td>

                    {/* Ending date */}
                    <td style={{ padding: '16px', fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                      {display.dueDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #E8E5DF', background: '#FFFFFF', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              border: page === currentPage ? '1px solid var(--accent)' : '1px solid #E8E5DF',
              background: page === currentPage ? 'rgba(193, 68, 14, 0.08)' : '#FFFFFF',
              color: page === currentPage ? 'var(--accent)' : '#1A1A1A',
              fontWeight: page === currentPage ? 600 : 500,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {page}
          </button>
        ))}
        <button 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #E8E5DF', background: '#FFFFFF', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          ›
        </button>
      </div>

      {/* 5. Create Project Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Launch New Workspace</h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                {formError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', fontWeight: 500, marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. Skyline Residences"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="e.g. Ahmedabad, Gujarat"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProject.budgetEstimated}
                    onChange={(e) => setNewProject({ ...newProject, budgetEstimated: e.target.value })}
                    placeholder="e.g. 15000000 (1.5 Crore)"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Manager User ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProject.managerId}
                    onChange={(e) => setNewProject({ ...newProject, managerId: e.target.value })}
                    placeholder="e.g. 60d0fe4f5311236168a109ee"
                    disabled={isProjectManager}
                    readOnly={isProjectManager}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    {isProjectManager
                      ? 'Automatically populated from your authenticated profile.'
                      : 'Provide a valid manager User ID from the database platform user list.'}
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Launch Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
