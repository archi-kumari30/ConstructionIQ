import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, Truck, Calendar, User, FileText, Loader2 } from 'lucide-react';

const MaterialRequests = () => {
  const { isAdmin, isProjectManager } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('activeProjectId', selectedProjectId);
      window.dispatchEvent(new Event('projectContextChanged'));
    }
  }, [selectedProjectId]);

  // Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch all projects first
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api.get('/projects');
        const list = res.data?.data?.projects || [];
        setProjects(list);
        if (list.length > 0) {
          const firstId = list[0].id || list[0]._id;
          setSelectedProjectId(firstId);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch requests and materials when project ID changes
  const fetchRequestsAndMaterials = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingRequests(true);
      const [reqsRes, matsRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/requests`),
        api.get('/materials')
      ]);
      setRequests(reqsRes.data?.data?.requests || []);
      setMaterials(matsRes.data?.data?.materials || []);
    } catch (err) {
      console.error('Error fetching requests data:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndMaterials();
  }, [selectedProjectId]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');

    if (!materialId || !quantity || parseFloat(quantity) <= 0) {
      setError('Please select a material and enter a valid quantity.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${selectedProjectId}/requests`, {
        materialId,
        quantityRequested: parseFloat(quantity),
        urgency
      });
      setModalOpen(false);
      setMaterialId('');
      setQuantity('');
      setUrgency('medium');
      fetchRequestsAndMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (requestId, isApproved) => {
    const status = isApproved ? 'approved' : 'rejected';
    try {
      await api.put(`/projects/${selectedProjectId}/requests/${requestId}/approve`, { status });
      fetchRequestsAndMaterials();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} request.`);
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      await api.post(`/projects/${selectedProjectId}/requests/${requestId}/fulfill`);
      fetchRequestsAndMaterials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fulfill request. Check stock limits.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canModify = isAdmin || isProjectManager;

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={28} color="var(--primary)" />
        <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading project list...</span>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Material Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Submit and review requests for project warehouse stock allocations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {projects.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Project:</span>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '220px', padding: '6px 12px' }}
              >
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No projects available</span>
          )}

          {projects.length > 0 && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} />
              <span>New Request</span>
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects configured</span>
          <span className="empty-state-desc">Create a project workspace first before posting material requests.</span>
        </div>
      ) : loadingRequests ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No material requests logged</span>
          <span className="empty-state-desc">Site staff or managers can request materials to be released from project inventory.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Requested Qty</th>
                <th>Urgency</th>
                <th>Requested By</th>
                <th>Date Requested</th>
                <th>Status</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const materialObj = req.material || req.materialId || {};
                const userObj = req.requestedBy || {};
                const reqId = req.id || req._id;
                
                return (
                  <tr key={reqId}>
                    <td style={{ fontWeight: 600 }}>{materialObj.name || 'Unknown Material'}</td>
                    <td>{req.quantityRequested} {materialObj.unit || 'units'}</td>
                    <td>
                      <span className={`badge ${
                        req.urgency === 'high' || req.urgency === 'critical' ? 'badge-danger' :
                        req.urgency === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} color="var(--text-muted)" />
                        <span>{userObj.name || 'Site Staff'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        req.status === 'fulfilled' ? 'badge-success' :
                        req.status === 'approved' ? 'badge-info' :
                        req.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    {canModify && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {req.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleApprove(reqId, true)}
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--success)', borderColor: 'var(--success)' }}
                              >
                                <Check size={12} />
                                <span>Approve</span>
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleApprove(reqId, false)}
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error)', borderColor: 'var(--error)' }}
                              >
                                <X size={12} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleFulfill(reqId)}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <Truck size={12} />
                              <span>Fulfill Stock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Request Materials</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                {error && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Material Catalog Type</label>
                  <select
                    className="form-select"
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    required
                  >
                    <option value="">Select Material...</option>
                    {materials.map((m) => (
                      <option key={m.id || m._id} value={m.id || m._id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to Request</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Priority</label>
                  <select
                    className="form-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequests;
