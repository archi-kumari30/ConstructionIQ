import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, Battery, Shield, Calendar, User, Eye, Loader2 } from 'lucide-react';

const EquipmentBookings = () => {
  const { isAdmin, isProjectManager } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('activeProjectId', selectedProjectId);
      window.dispatchEvent(new Event('projectContextChanged'));
    }
  }, [selectedProjectId]);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'telemetry'

  // Forms modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);

  // Booking fields
  const [eqId, setEqId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Telemetry fields
  const [telEqId, setTelEqId] = useState('');
  const [telDate, setTelDate] = useState('');
  const [telHours, setTelHours] = useState('');
  const [telFuel, setTelFuel] = useState('');
  const [telNotes, setTelNotes] = useState('');
  const [telError, setTelError] = useState('');
  const [telSubmitting, setTelSubmitting] = useState(false);

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

  // 2. Fetch bookings, telemetry and fleet when selected project changes
  const fetchData = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingData(true);
      const [bookingsRes, telemetryRes, eqRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/bookings`),
        api.get(`/projects/${selectedProjectId}/telemetry`),
        api.get('/equipment')
      ]);
      setBookings(bookingsRes.data?.data?.bookings || []);
      setTelemetryLogs(telemetryRes.data?.data?.logs || []);
      setEquipmentList(eqRes.data?.data?.fleet || eqRes.data?.data?.equipment || []);
    } catch (err) {
      console.error('Error loading equipment resources:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProjectId]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!eqId || !startTime || !endTime) {
      setBookingError('Please fill in all fields.');
      return;
    }

    try {
      setBookingSubmitting(true);
      await api.post(`/projects/${selectedProjectId}/bookings`, {
        equipmentId: eqId,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
      setBookingModalOpen(false);
      setEqId('');
      setStartTime('');
      setEndTime('');
      fetchData();
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking conflict or database issue.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleTelemetryLog = async (e) => {
    e.preventDefault();
    setTelError('');

    if (!telEqId || !telDate || !telHours || !telFuel) {
      setTelError('Please fill in all required fields.');
      return;
    }

    try {
      setTelSubmitting(true);
      await api.post(`/projects/${selectedProjectId}/telemetry`, {
        equipmentId: telEqId,
        date: new Date(telDate),
        hoursUsed: parseFloat(telHours),
        fuelUsedLiters: parseFloat(telFuel),
        notes: telNotes
      });
      setTelemetryModalOpen(false);
      setTelEqId('');
      setTelDate('');
      setTelHours('');
      setTelFuel('');
      setTelNotes('');
      fetchData();
    } catch (err) {
      setTelError(err.response?.data?.message || 'Failed to record usage logs.');
    } finally {
      setTelSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/equipment/bookings/${bookingId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatOnlyDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canModify = isAdmin || isProjectManager;

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'approved': return 'badge-success';
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      case 'cancelled': return 'badge-danger';
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
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Fleet Bookings & Telemetry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Reserve fleet machinery and record operations usage details.
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

          {projects.length > 0 && canModify && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => setBookingModalOpen(true)}>
                <Plus size={14} />
                <span>Reserve Equipment</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setTelemetryModalOpen(true)}>
                <Plus size={14} />
                <span>Log Usage</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <Truck size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects configured</span>
          <span className="empty-state-desc">Create a project workspace first before reserving fleet machinery.</span>
        </div>
      ) : (
        <>
          {/* Tabs bar */}
          <div className="tab-bar">
            <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              Active Reservations
            </button>
            <button className={`tab ${activeTab === 'telemetry' ? 'active' : ''}`} onClick={() => setActiveTab('telemetry')}>
              Telemetry & Fuel logs
            </button>
          </div>

          {loadingData ? (
            <div className="skeleton" style={{ height: '200px' }}></div>
          ) : activeTab === 'bookings' ? (
            bookings.length === 0 ? (
              <div className="empty-state">
                <Clock size={36} color="var(--text-muted)" />
                <span className="empty-state-title">No active reservations</span>
                <span className="empty-state-desc">No heavy machinery has been reserved for this project phase yet.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Equipment Asset</th>
                      <th>Operational Type</th>
                      <th>Timeline Dates</th>
                      <th>Requested By</th>
                      <th>Reservation Status</th>
                      {canModify && <th>Action Options</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const eq = booking.equipmentId || {};
                      const userObj = booking.userId || {};
                      const bId = booking.id || booking._id;
                      
                      return (
                        <tr key={bId}>
                          <td style={{ fontWeight: 600 }}>{eq.name || 'Machinery'}</td>
                          <td><span className="badge badge-info">{eq.type || 'fleet'}</span></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <div>Start: {formatDate(booking.startTime)}</div>
                              <div>End: {formatDate(booking.endTime)}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} color="var(--text-muted)" />
                              <span>{userObj.name || 'Operator'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          {canModify && (
                            <td>
                              {booking.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bId, 'approved')}
                                    className="btn btn-secondary"
                                    style={{ padding: '3px 6px', fontSize: '10px', color: 'var(--success)', borderColor: 'var(--success)' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bId, 'rejected')}
                                    className="btn btn-secondary"
                                    style={{ padding: '3px 6px', fontSize: '10px', color: 'var(--error)', borderColor: 'var(--error)' }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {booking.status === 'approved' && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bId, 'completed')}
                                    className="btn btn-primary"
                                    style={{ padding: '3px 6px', fontSize: '10px' }}
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bId, 'cancelled')}
                                    className="btn btn-secondary"
                                    style={{ padding: '3px 6px', fontSize: '10px', color: 'var(--error)', borderColor: 'var(--error)' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            telemetryLogs.length === 0 ? (
              <div className="empty-state">
                <Battery size={36} color="var(--text-muted)" />
                <span className="empty-state-title">No utilization telemetry logs</span>
                <span className="empty-state-desc">Record engine hours and fuel consumption to audit fleet operational efficiency.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Equipment Asset</th>
                      <th>Engine Hours (hrs)</th>
                      <th>Fuel Spent (liters)</th>
                      <th>Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetryLogs.map((log) => {
                      const eq = log.equipmentId || {};
                      return (
                        <tr key={log._id}>
                          <td>{formatOnlyDate(log.date)}</td>
                          <td style={{ fontWeight: 600 }}>{eq.name || 'Machinery'}</td>
                          <td><strong>{log.hoursUsed} hrs</strong></td>
                          <td><strong>{log.fuelUsedLiters} L</strong></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{log.notes || 'Routine utilization log'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Reserve Modal */}
      {bookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Reserve Fleet Machinery</h2>
              <button onClick={() => setBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                {bookingError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {bookingError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Available Machinery Asset</label>
                  <select
                    className="form-select"
                    value={eqId}
                    onChange={(e) => setEqId(e.target.value)}
                    required
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map((eq) => (
                      <option key={eq.id || eq._id} value={eq.id || eq._id} disabled={eq.status === 'maintenance'}>
                        {eq.name} ({eq.type}) {eq.status === 'maintenance' ? '— [In Maintenance]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setBookingModalOpen(false)} disabled={bookingSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={bookingSubmitting}>
                  {bookingSubmitting ? 'Reserving...' : 'Submit Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemetry Modal */}
      {telemetryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Record Fleet Utilization</h2>
              <button onClick={() => setTelemetryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleTelemetryLog}>
              <div className="modal-body">
                {telError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {telError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Machinery Asset</label>
                  <select
                    className="form-select"
                    value={telEqId}
                    onChange={(e) => setTelEqId(e.target.value)}
                    required
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map((eq) => (
                      <option key={eq.id || eq._id} value={eq.id || eq._id}>
                        {eq.name} ({eq.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Usage</label>
                  <input
                    type="date"
                    className="form-input"
                    value={telDate}
                    onChange={(e) => setTelDate(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Engine Hours Used</label>
                    <input
                      type="number"
                      className="form-input"
                      value={telHours}
                      onChange={(e) => setTelHours(e.target.value)}
                      placeholder="e.g. 5.5"
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fuel Consumption (L)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={telFuel}
                      onChange={(e) => setTelFuel(e.target.value)}
                      placeholder="e.g. 45"
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={telNotes}
                    onChange={(e) => setTelNotes(e.target.value)}
                    placeholder="Provide operational context..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTelemetryModalOpen(false)} disabled={telSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={telSubmitting}>
                  {telSubmitting ? 'Logging...' : 'Save Utilization Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentBookings;
