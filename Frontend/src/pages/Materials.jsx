import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, FileSpreadsheet } from 'lucide-react';

const Materials = () => {
  const { isAdmin } = useAuth();
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cement');
  const [unit, setUnit] = useState('bag');
  const [unitCost, setUnitCost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials');
      setMaterials(res.data?.data?.materials || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !unitCost || parseFloat(unitCost) <= 0) {
      setError('Please provide a name and valid unit cost.');
      return;
    }

    const payload = {
      name,
      category,
      unit,
      unitCost: parseFloat(unitCost)
    };

    try {
      setSubmitting(true);
      if (editingMaterial) {
        const mId = editingMaterial.id || editingMaterial._id;
        await api.put(`/materials/${mId}`, payload);
      } else {
        await api.post('/materials', payload);
      }
      setModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save material to catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (mat) => {
    setEditingMaterial(mat);
    setName(mat.name || '');
    setCategory(mat.category || 'cement');
    setUnit(mat.unit || 'bag');
    setUnitCost(mat.unitCost || '');
    setModalOpen(true);
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Delete this material from the global catalog? This may impact active inventories.')) {
      return;
    }
    try {
      await api.delete(`/materials/${materialId}`);
      fetchMaterials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setName('');
    setCategory('cement');
    setUnit('bag');
    setUnitCost('');
    setError('');
  };

  // Filter materials client-side
  const filteredMaterials = materials.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Global Materials Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {isAdmin ? 'Master catalog CRUD management' : 'View catalog material types and costs'}
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus size={16} />
            <span>New Material</span>
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search material types..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <FileSpreadsheet size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No materials registered</span>
          <span className="empty-state-desc">The global materials catalog is currently empty.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Category</th>
                <th>Standard Unit</th>
                <th>Standard Cost</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat) => {
                const mId = mat.id || mat._id;
                return (
                  <tr key={mId}>
                    <td style={{ fontWeight: 600 }}>{mat.name}</td>
                    <td><span className="badge badge-info">{mat.category}</span></td>
                    <td>{mat.unit}</td>
                    <td style={{ fontWeight: 600 }}>${mat.unitCost?.toLocaleString()}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditClick(mat)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(mId)}
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

      {/* Material Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{editingMaterial ? 'Edit Material Details' : 'Add Catalog Material'}</h2>
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
                  <label className="form-label">Material Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cement OPC 53"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Group</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="cement">Cement</option>
                    <option value="steel">Steel</option>
                    <option value="aggregate">Aggregate</option>
                    <option value="masonry">Masonry</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Packaging Unit</label>
                  <select
                    className="form-select"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="bag">Bag</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ton">Ton</option>
                    <option value="cum">Cubic Meter (cum)</option>
                    <option value="piece">Piece</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Unit Cost ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="e.g. 8.50"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
