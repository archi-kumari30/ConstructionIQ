import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, ShieldAlert, Check, FileImage, User, Calendar, Camera } from 'lucide-react';

const IncidentsTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resolve state
  const [resolveItem, setResolveItem] = useState(null);
  const [resDetails, setResDetails] = useState('');
  const [resSubmitting, setResSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/incidents`);
      setIncidents(res.data?.data?.incidents || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [projectId]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !severity) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('severity', severity);
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post(`/projects/${projectId}/incidents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setSelectedFiles([]);
      fetchIncidents();
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
      fetchIncidents();
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
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Site Safety & Hazards Log</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Report safety hazards and site incidents with photo evidence. Resolving critical issues notifies team members.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          <span>Report Incident</span>
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '150px' }}></div>
      ) : incidents.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px' }}>
          <ShieldAlert size={36} color="var(--success)" />
          <span className="empty-state-title" style={{ color: 'var(--success)' }}>All clear: no active hazards</span>
          <span className="empty-state-desc">Report any safety concerns or machinery malfunctions immediately.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
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
              {incidents.map((incident) => {
                const reporter = incident.reportedBy || {};
                const id = incident.id || incident._id;
                const hasPhotos = incident.images && incident.images.length > 0;
                
                return (
                  <tr key={id}>
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
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {incident.images.map((img, index) => (
                            <a key={index} href={img} target="_blank" rel="noreferrer" title="Click to view image">
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
                  <label className="form-label">Incident Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scaffolding instability — Block C"
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
                    placeholder="Provide safety hazards and details..."
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
                    <option value="low">Low (Minor hazard)</option>
                    <option value="medium">Medium (Requires attention)</option>
                    <option value="high">High (Dangerous condition)</option>
                    <option value="critical">Critical (Stop operations immediately)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} />
                    <span>Upload Incident Photos (Max 5)</span>
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ padding: '8px' }}
                  />
                  {selectedFiles.length > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Selected {selectedFiles.length} file(s)
                    </div>
                  )}
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
                    placeholder="e.g. Area cordoned off and structure reinforced by contractor team."
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

export default IncidentsTab;
