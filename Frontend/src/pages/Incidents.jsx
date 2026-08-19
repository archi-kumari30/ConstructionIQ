import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, ShieldAlert, Check, FileImage, User, Calendar, Camera, Loader2 } from 'lucide-react';

const Incidents = () => {
  const { user, isAdmin, isProjectManager } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== 'all') {
      localStorage.setItem('activeProjectId', selectedProjectId);
    } else {
      localStorage.removeItem('activeProjectId');
    }
    window.dispatchEvent(new Event('projectContextChanged'));
  }, [selectedProjectId]);

  // Report Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [reportProjectId, setReportProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resolve Modal state
  const [resolveItem, setResolveItem] = useState(null);
  const [resDetails, setResDetails] = useState('');
  const [resSubmitting, setResSubmitting] = useState(false);

  const fetchProjectsAndIncidents = async () => {
    try {
      setLoading(true);
      // 1. Fetch projects
      const projectsRes = await api.get('/projects');
      const projectList = projectsRes.data?.data?.projects || [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setReportProjectId(projectList[0].id || projectList[0]._id);
      }

      let allIncidents = [];

      // 2. Fetch incidents for all projects in parallel
      await Promise.all(
        projectList.map(async (project) => {
          const pId = project.id || project._id;
          try {
            const incidentsRes = await api.get(`/projects/${pId}/incidents`);
            const list = incidentsRes.data?.data?.incidents || [];
            // Attach project info to each incident
            const enriched = list.map((inc) => ({
              ...inc,
              projectName: project.name,
              projectId: pId
            }));
            allIncidents = [...allIncidents, ...enriched];
          } catch (e) {
            console.warn(`Error fetching incidents for project ${pId}:`, e.message);
          }
        })
      );

      // Sort by creation date descending
      allIncidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setIncidents(allIncidents);
    } catch (err) {
      console.error('Error fetching incidents list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndIncidents();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!reportProjectId || !title || !description || !severity) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('severity', severity);
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post(`/projects/${reportProjectId}/incidents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setSelectedFiles([]);
      fetchProjectsAndIncidents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to report safety incident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIncident = async (e) => {
    e.preventDefault();
    if (!resDetails) return;

    try {
      setResSubmitting(true);
      const iId = resolveItem.id || resolveItem._id;
      await api.put(`/projects/incidents/${iId}`, {
        status: 'resolved',
        resolutionDetails: resDetails
      });
      setResolveItem(null);
      setResDetails('');
      fetchProjectsAndIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve incident.');
    } finally {
      setResSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  const canModify = isAdmin || isProjectManager;

  // Filter list client side
  const filteredIncidents = incidents.filter((inc) => {
    const matchesProject = selectedProjectId === 'all' || inc.projectId === selectedProjectId;
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    return matchesProject && matchesSeverity;
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Safety & Hazards Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Browse and resolve safety concerns reported across all active construction sites.
          </p>
        </div>

        {projects.length > 0 && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} />
            <span>Report Incident</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Site:</span>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: '180px', padding: '6px 12px' }}
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Severity:</span>
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: '130px', padding: '6px 12px' }}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <Loader2 className="animate-spin" size={28} color="var(--primary)" />
          <span style={{ marginLeft: '10px', fontWeight: 600 }}>Scanning site databases...</span>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert size={36} color="var(--success)" />
          <span className="empty-state-title" style={{ color: 'var(--success)' }}>All Clear</span>
          <span className="empty-state-desc">No active safety hazards or machinery incidents logged.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project / Site</th>
                <th>Incident Details</th>
                <th>Severity</th>
                <th>Photos</th>
                <th>Reported By</th>
                <th>Date Logged</th>
                <th>Status</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => {
                const reporter = incident.reportedBy || {};
                const id = incident.id || incident._id;
                const hasPhotos = incident.images && incident.images.length > 0;
                
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{incident.projectName}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{incident.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {incident.description}
                        </div>
                        {incident.status === 'resolved' && incident.resolutionDetails && (
                          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px', borderLeft: '2px solid var(--success)', paddingLeft: '6px' }}>
                            <strong>Resolution:</strong> {incident.resolutionDetails}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      {hasPhotos ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {incident.images.map((img, index) => (
                            <a key={index} href={img} target="_blank" rel="noreferrer" title="Click to view full photo">
                              <img
                                src={img}
                                alt={`evidence-${index}`}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} color="var(--text-muted)" />
                        <span>{reporter.name || 'Site Staff'}</span>
                      </div>
                    </td>
                    <td>{formatDate(incident.createdAt)}</td>
                    <td>
                      <span className={`badge ${incident.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                        {incident.status}
                      </span>
                    </td>
                    {canModify && (
                      <td>
                        {incident.status !== 'resolved' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => setResolveItem(incident)}
                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--success)', borderColor: 'var(--success)' }}
                          >
                            <Check size={12} />
                            <span>Resolve</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Incident Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Report Safety Incident</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateIncident}>
              <div className="modal-body">
                {formError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Site Project</label>
                  <select
                    className="form-select"
                    value={reportProjectId}
                    onChange={(e) => setReportProjectId(e.target.value)}
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Broken crane safety cable"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Details / Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe safety hazard or malfunctions..."
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select
                    className="form-select"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} />
                    <span>Upload Incident Photos</span>
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ padding: '8px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Uploading & Logging...' : 'Report Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {resolveItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Resolve Safety Incident</h2>
              <button onClick={() => setResolveItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleResolveIncident}>
              <div className="modal-body">
                <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                  Resolving incident: <strong>{resolveItem.title}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Details</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={resDetails}
                    onChange={(e) => setResDetails(e.target.value)}
                    placeholder="Detail actions taken to reinforce safety..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResolveItem(null)} disabled={resSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={resSubmitting}>
                  {resSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
