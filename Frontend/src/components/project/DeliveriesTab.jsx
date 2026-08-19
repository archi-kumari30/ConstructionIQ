import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Navigation, Clock, Truck, Calendar, User, Package } from 'lucide-react';

const DeliveriesTab = ({ projectId }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, materialsRes, teamRes] = await Promise.all([
        api.get(`/projects/${projectId}/deliveries`),
        api.get('/materials'),
        api.get(`/projects/${projectId}/team`)
      ]);
      setDeliveries(deliveriesRes.data?.data?.deliveries || []);
      setMaterials(materialsRes.data?.data?.materials || []);
      
      // Filter project team members who are suppliers
      const teamSuppliers = (teamRes.data?.data || []).filter(
        (m) => m.roleOnProject === 'supplier' || m.user?.role === 'supplier' || m.userId?.role === 'supplier'
      );
      setSuppliers(teamSuppliers);
    } catch (err) {
      console.error('Error loading delivery logs dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!materialId || !supplierId || !quantityOrdered || !carrierName || !deliveryDate) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/deliveries`, {
        materialId,
        supplierId,
        quantityOrdered: parseFloat(quantityOrdered),
        carrierName,
        deliveryDate: new Date(deliveryDate)
      });
      setModalOpen(false);
      setMaterialId('');
      setSupplierId('');
      setQuantityOrdered('');
      setCarrierName('');
      setDeliveryDate('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record delivery shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (deliveryId, targetStatus) => {
    try {
      await api.put(`/projects/${projectId}/deliveries/${deliveryId}`, {
        status: targetStatus
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery status.');
    }
  };

  const formatOnlyDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'delivered': return 'badge-success';
      case 'in_transit': return 'badge-info';
      case 'delayed': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      case 'scheduled': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Logistics & Deliveries</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Supplier shipments of materials. Updating status to 'delivered' automatically increments warehouse inventory stock levels.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          <span>Log Delivery</span>
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '150px' }}></div>
      ) : deliveries.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px' }}>
          <Truck size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No deliveries logged yet</span>
          <span className="empty-state-desc">Assign suppliers to the project team and log deliveries to record shipments.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Supplier Vendor</th>
                <th>Qty Ordered</th>
                <th>Carrier Name</th>
                <th>Delivery Date</th>
                <th>Shipment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => {
                const material = d.materialId || {};
                const supplierObj = d.supplierId || {};
                const dId = d.id || d._id;
                
                return (
                  <tr key={dId}>
                    <td style={{ fontWeight: 600 }}>{material.name || 'Materials'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} color="var(--text-muted)" />
                        <span>{supplierObj.name || 'Supplier'}</span>
                      </div>
                    </td>
                    <td>{d.quantityOrdered} {material.unit || 'units'}</td>
                    <td>{d.carrierName || 'Freight Carrier'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{formatOnlyDate(d.deliveryDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {d.status !== 'delivered' && d.status !== 'cancelled' && (
                        <select
                          className="form-select"
                          value={d.status}
                          onChange={(e) => handleStatusChange(dId, e.target.value)}
                          style={{ padding: '4px 6px', fontSize: '11px', width: '110px' }}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="delayed">Delayed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Delivery Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Record Delivery Shipment</h2>
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
                  <label className="form-label">Supplier Partner (from Team)</label>
                  <select
                    className="form-select"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s) => {
                      const u = s.user || s.userId || {};
                      const uid = u._id || u.id || s.userId || s.user;
                      return (
                        <option key={uid} value={uid}>
                          {u.name || 'Vendor'} ({u.email || 'N/A'})
                        </option>
                      );
                    })}
                  </select>
                  {suppliers.length === 0 && (
                    <small style={{ color: 'var(--error)', fontSize: '10px' }}>
                      No suppliers assigned to the project team yet. Add one in the Team tab first.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Ordered</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quantityOrdered}
                    onChange={(e) => setQuantityOrdered(e.target.value)}
                    placeholder="e.g. 500"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Carrier Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. DHL Logistics / BlueDart"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Delivery Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || suppliers.length === 0}>
                  {submitting ? 'Recording...' : 'Log Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesTab;
