import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, Truck, ShieldAlert } from 'lucide-react';

const Equipment = () => {
  const { isAdmin } = useAuth();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('excavator');
  const [status, setStatus] = useState('available');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get('/equipment');
      setEquipmentList(res.data?.data?.fleet || res.data?.data?.equipment || []);
    } catch (err) {
      console.error('Error fetching equipment list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !location) {
      setError('Please fill in all fields.');
      return;
    }

    const payload = { name, type, status, location };

    try {
      setSubmitting(true);
      if (editingEq) {
        const eId = editingEq.id || editingEq._id;
        await api.put(`/equipment/${eId}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
      setModalOpen(false);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (eq) => {
    setEditingEq(eq);
    setName(eq.name || '');
    setType(eq.type || 'excavator');
    setStatus(eq.status || 'available');
    setLocation(eq.location || '');
    setModalOpen(true);
  };

  const handleDelete = async (eqId) => {
    if (!window.confirm('Remove this machinery asset from the global fleet?')) {
      return;
    }
    try {
      await api.delete(`/equipment/${eqId}`);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  const resetForm = () => {
    setEditingEq(null);
    setName('');
    setType('excavator');
    setStatus('available');
    setLocation('');
    setError('');
  };

  const filteredEq = equipmentList.filter((eq) =>
    eq.name?.toLowerCase().includes(search.toLowerCase()) ||
    eq.type?.toLowerCase().includes(search.toLowerCase()) ||
    eq.location?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'available': return 'badge-success';
      case 'in_use': return 'badge-info';
      case 'maintenance': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Global Fleet Machinery</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {isAdmin ? 'Master fleet CRUD operations management' : 'Browse active equipment registry'}
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus size={16} />
            <span>New Equipment</span>
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search fleet assets..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filteredEq.length === 0 ? (
        <div className="empty-state">
          <Truck size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No fleet machinery registered</span>
          <span className="empty-state-desc">The fleet database registry is currently empty.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Machinery Type</th>
                <th>Location / Yard</th>
                <th>Operational Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEq.map((eq) => {
                const eqId = eq.id || eq._id;
                return (
                  <tr key={eqId}>
                    <td style={{ fontWeight: 600 }}>{eq.name}</td>
                    <td><span className="badge badge-info">{eq.type}</span></td>
                    <td>{eq.location}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(eq.status)}`}>
                        {eq.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditClick(eq)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(eqId)}
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

      {/* Equipment Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{editingEq ? 'Edit Machinery Details' : 'Add Fleet Machinery'}</h2>
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
                  <label className="form-label">Machinery Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Caterpillar Excavator 320"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Machinery Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="excavator">Excavator</option>
                    <option value="crane">Crane</option>
                    <option value="loader">Loader</option>
                    <option value="bulldozer">Bulldozer</option>
                    <option value="dump_truck">Dump Truck</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Operational Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">Available (Standby)</option>
                    <option value="in_use">In Use (Active)</option>
                    <option value="maintenance">Maintenance / Repair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Storage Yard / Current Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Central Yard Block B"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Machinery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
