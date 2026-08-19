import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Search, Calendar, Landmark, MapPin, Loader2 } from 'lucide-react';

const Projects = () => {
  const { user, isAdmin, isProjectManager } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal create state
  const [modalOpen, setModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    budgetEstimated: '',
    managerId: '' // Will require entering a valid user ID as per backend scope
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
      const response = await api.get(`/projects?search=${search}`);
      setProjects(response.data?.data?.projects || []);
    } catch (error) {
      console.error('Error loading projects list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search]);

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

  // Filter and sort client-side
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'budget-high') return b.budgetEstimated - a.budgetEstimated;
    if (sortBy === 'budget-low') return a.budgetEstimated - b.budgetEstimated;
    return 0;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>Projects Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Enforcing role-level workspace access boundaries</p>
        </div>
        
        {(isAdmin || isProjectManager) && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter and search bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search projects..."
              className="form-input filter-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '240px' }}
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px', padding: '6px 12px' }}
          >
            <option value="all">Status: All</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '180px', padding: '6px 12px' }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="budget-high">Budget: High to Low</option>
            <option value="budget-low">Budget: Low to High</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <Loader2 className="animate-spin" size={28} color="var(--primary)" />
          <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading project files...</span>
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-title">No projects assigned</span>
          <span className="empty-state-desc">You are not assigned to any projects or none match your search criteria.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Location</th>
                <th>Timeline Duration</th>
                <th>Estimated Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((project) => {
                const id = project.id || project._id;
                return (
                  <tr
                    key={id}
                    onClick={() => navigate(`/projects/${id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{project.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>{project.location}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Landmark size={14} color="var(--text-muted)" />
                        <span>${project.budgetEstimated?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog for Project Creation */}
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
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px 10px', fontSize: '11px', fontWeight: 500, marginBottom: '12px' }}>
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
                    placeholder="e.g. Skyline Tower — Phase 2"
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
                    placeholder="e.g. Pune, Maharashtra"
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
                  <label className="form-label">Estimated Budget ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProject.budgetEstimated}
                    onChange={(e) => setNewProject({ ...newProject, budgetEstimated: e.target.value })}
                    placeholder="e.g. 4200000"
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
