import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Navigation, Clock, Truck, Calendar, User, Package, Loader2 } from 'lucide-react';

const MaterialDeliveries = () => {
  const { user, isAdmin, isProjectManager, isSupplier } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('activeProjectId', selectedProjectId);
      window.dispatchEvent(new Event('projectContextChanged'));
    }
  }, [selectedProjectId]);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch projects on mount
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

  // 2. Fetch deliveries, materials, and team (for suppliers) when selected project changes
  const fetchDeliveriesData = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingDeliveries(true);
      const [deliveriesRes, materialsRes, teamRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/deliveries`),
        api.get('/materials'),
        api.get(`/projects/${selectedProjectId}/team`)
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
      setLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    fetchDeliveriesData();
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!materialId || !supplierId || !quantityOrdered || !carrierName || !deliveryDate) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${selectedProjectId}/deliveries`, {
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
      fetchDeliveriesData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record delivery shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (deliveryId, targetStatus) => {
    try {
      await api.put(`/projects/${selectedProjectId}/deliveries/${deliveryId}`, {
        status: targetStatus
      });
      fetchDeliveriesData();
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
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Logistics & Deliveries Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Supplier shipments of materials. Setting status to 'delivered' automatically increments warehouse inventory.
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

          {projects.length > 0 && !isSupplier && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} />
              <span>Log Delivery</span>
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <Truck size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects configured</span>
          <span className="empty-state-desc">Create a project workspace first before monitoring deliveries.</span>
        </div>
      ) : loadingDeliveries ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : deliveries.length === 0 ? (
        <div className="empty-state">
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
                {!isSupplier && <th>Actions</th>}
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
                    {!isSupplier && (
                      <td>
                        {d.status !== 'delivered' && d.status !== 'cancelled' ? (
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
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locked</span>
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
                      No suppliers assigned to the project team yet. Add one in the project's Team tab first.
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

export default MaterialDeliveries;
