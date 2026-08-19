import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Check, X, Truck, Calendar, User, FileText, AlertCircle } from 'lucide-react';

const RequestsTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/requests`);
      setRequests(res.data?.data?.requests || []);
    } catch (err) {
      console.error('Error fetching material requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setMaterials(res.data?.data?.materials || []);
    } catch (err) {
      console.error('Error loading materials catalog:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchMaterials();
  }, [projectId]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');

    if (!materialId || !quantity || parseFloat(quantity) <= 0) {
      setError('Please select a material and enter a valid quantity.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/requests`, {
        materialId,
        quantityRequested: parseFloat(quantity),
        urgency
      });
      setModalOpen(false);
      setMaterialId('');
      setQuantity('');
      setUrgency('medium');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (requestId, isApproved) => {
    const status = isApproved ? 'approved' : 'rejected';
    try {
      await api.put(`/projects/${projectId}/requests/${requestId}/approve`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} request.`);
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      await api.post(`/projects/${projectId}/requests/${requestId}/fulfill`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fulfill request. Check stock limits.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Material Consumption Requests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Submit requests for project stock allocations. Reviews and stock deductions must be approved by the PM.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          <span>New Request</span>
        </button>
      </div>

      {loading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Qty</th>
                <th>Urgency</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Status</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={7} className="skeleton" style={{ height: '40px', margin: '4px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No material requests logged</span>
          <span className="empty-state-desc">Site engineers or managers can request materials to be released from project warehouse.</span>
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
                        req.urgency === 'high' ? 'badge-danger' :
                        req.urgency === 'critical' ? 'badge-danger' :
                        req.urgency === 'medium' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} color="var(--text-muted)" />
                        <span>{userObj.name || 'Site Engineer'}</span>
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
                        req.status === 'rejected' ? 'badge-danger' :
                        'badge-warning'
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

export default RequestsTab;
