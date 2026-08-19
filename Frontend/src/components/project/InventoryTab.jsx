import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AlertTriangle, Edit2, CheckCircle, Package } from 'lucide-react';

const InventoryTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit threshold state
  const [editingItem, setEditingItem] = useState(null);
  const [thresholdValue, setThresholdValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/inventory`);
      setInventory(res.data?.data?.inventory || []);
    } catch (err) {
      console.error('Error fetching project inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [projectId]);

  const handleEditThreshold = (item) => {
    setEditingItem(item);
    setThresholdValue(item.lowStockThreshold || '');
    setError('');
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!thresholdValue || parseFloat(thresholdValue) < 0) {
      setError('Threshold value must be a non-negative number.');
      return;
    }

    try {
      setSubmitting(true);
      const mId = editingItem.material?._id || editingItem.material?.id || editingItem.materialId?._id || editingItem.materialId;
      await api.put(`/projects/${projectId}/inventory/${mId}/threshold`, {
        threshold: parseFloat(thresholdValue)
      });
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock alert threshold.');
    } finally {
      setSubmitting(false);
    }
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Project Materials Inventory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Real-time tracking of site materials, stockpiles, and automatic threshold alerts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Available Qty</th>
                <th>Min Threshold</th>
                <th>Warehouse Location</th>
                <th>Alert Status</th>
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
      ) : inventory.length === 0 ? (
        <div className="empty-state">
          <Package size={36} color="var(--text-muted)" />
          <span className="empty-state-title">Warehouse inventory is empty</span>
          <span className="empty-state-desc">Receive or fulfill supplier deliveries to populate this project's stock levels.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Available Qty</th>
                <th>Min Alert Threshold</th>
                <th>Warehouse Location</th>
                <th>Alert Status</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const material = item.material || item.materialId || {};
                const isLow = item.quantityAvailable < item.lowStockThreshold;
                const mId = material._id || material.id || item.materialId || item.material;
                
                return (
                  <tr key={item._id || mId}>
                    <td style={{ fontWeight: 600 }}>{material.name || 'Unknown Material'}</td>
                    <td>{material.category || 'N/A'}</td>
                    <td style={{ fontWeight: 600, color: isLow ? 'var(--error)' : 'var(--text-primary)' }}>
                      {item.quantityAvailable} {material.unit || 'units'}
                    </td>
                    <td>{item.lowStockThreshold} {material.unit || 'units'}</td>
                    <td>{item.warehouseLocation || 'Main Storage Yard'}</td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <AlertTriangle size={10} />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <CheckCircle size={10} />
                          <span>OK</span>
                        </span>
                      )}
                    </td>
                    {canModify && (
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditThreshold(item)}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <Edit2 size={12} />
                          <span>Edit Limit</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Threshold Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Set Stock Alert Limit</h2>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveThreshold}>
              <div className="modal-body">
                {error && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                  Setting minimum stock alert threshold for: <strong>{editingItem.materialId?.name}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Low Stock Threshold ({editingItem.materialId?.unit || 'units'})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    placeholder="e.g. 50"
                    min="0"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    System triggers real-time socket alert when quantity available falls below this number.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Threshold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
