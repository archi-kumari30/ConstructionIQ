import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, UserCheck, Mail, Phone, Briefcase } from 'lucide-react';

const Workers = () => {
  const { user, isAdmin, isProjectManager, isContractor } = useAuth();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('laborer');
  const [trade, setTrade] = useState('masonry');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workers');
      setWorkers(res.data?.data?.workers || []);
    } catch (err) {
      console.error('Error loading workforce database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !contractorId) {
      setError('Please provide worker name and contractor User ID.');
      return;
    }

    const payload = {
      name,
      role,
      trade,
      contactInfo: {
        email,
        phone
      },
      contractorId
    };

    try {
      setSubmitting(true);
      if (editingWorker) {
        const wId = editingWorker.id || editingWorker._id;
        await api.put(`/workers/${wId}`, payload);
      } else {
        await api.post('/workers', payload);
      }
      setModalOpen(false);
      resetForm();
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save worker registry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (wrk) => {
    setEditingWorker(wrk);
    setName(wrk.name || '');
    setRole(wrk.role || 'laborer');
    setTrade(wrk.trade || 'masonry');
    setEmail(wrk.contactInfo?.email || '');
    setPhone(wrk.contactInfo?.phone || '');
    setContractorId(wrk.contractorId?._id || wrk.contractorId || '');
    setModalOpen(true);
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm('Remove this worker from the active global workforce registry?')) {
      return;
    }
    try {
      await api.delete(`/workers/${workerId}`);
      fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove worker.');
    }
  };

  const resetForm = () => {
    setEditingWorker(null);
    setName('');
    setRole('laborer');
    setTrade('masonry');
    setEmail('');
    setPhone('');
    setContractorId('');
    setError('');
  };

  const filteredWorkers = workers.filter((w) =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.trade?.toLowerCase().includes(search.toLowerCase()) ||
    w.role?.toLowerCase().includes(search.toLowerCase())
  );

  const canModify = isAdmin || isProjectManager || isContractor;

  const formatRole = (r) => {
    if (!r) return '';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Global Workforce Labor</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Workforce roster records. Write scopes are limited to Admins, PMs, and assigned Contractors.
          </p>
        </div>

        {canModify && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus size={16} />
            <span>Add Worker</span>
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search workers registry..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <UserCheck size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No workers logged</span>
          <span className="empty-state-desc">The workforce registry database is currently empty.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Trade Specialty</th>
                <th>Role Rank</th>
                <th>Supervising Contractor</th>
                <th>Contacts</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((wrk) => {
                const wrkId = wrk.id || wrk._id;
                const supervisor = wrk.contractorId || {};
                return (
                  <tr key={wrkId}>
                    <td style={{ fontWeight: 600 }}>{wrk.name}</td>
                    <td><span className="badge badge-info">{wrk.trade}</span></td>
                    <td>{formatRole(wrk.role)}</td>
                    <td>{supervisor.name || wrk.contractorId || 'Supervisor'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {wrk.contactInfo?.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} />
                            <span>{wrk.contactInfo.email}</span>
                          </div>
                        )}
                        {wrk.contactInfo?.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={10} />
                            <span>{wrk.contactInfo.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {canModify && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditClick(wrk)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(wrkId)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
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

      {/* Worker Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{editingWorker ? 'Edit Worker details' : 'Register New Worker'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Worker Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trade Specialty</label>
                  <select
                    className="form-select"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  >
                    <option value="masonry">Masonry</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="welding">Welding</option>
                    <option value="general_labor">General Labor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Worker Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="laborer">Laborer</option>
                    <option value="foreman">Foreman</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@work.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1234567890"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contractor User ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contractorId}
                    onChange={(e) => setContractorId(e.target.value)}
                    placeholder="e.g. 60d0fe4f5311236168a109ee"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    Specify the system User ID of the supervisor Contractor (or your own user ID if logged in as a Contractor).
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Save Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
