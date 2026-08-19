import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Clock, Battery, Shield, Calendar, User, Eye } from 'lucide-react';

const BookingsTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [bookings, setBookings] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, telemetryRes, eqRes] = await Promise.all([
        api.get(`/projects/${projectId}/bookings`),
        api.get(`/projects/${projectId}/telemetry`),
        api.get('/equipment')
      ]);
      setBookings(bookingsRes.data?.data?.bookings || []);
      setTelemetryLogs(telemetryRes.data?.data?.logs || []);
      setEquipmentList(eqRes.data?.data?.fleet || eqRes.data?.data?.equipment || []);
    } catch (err) {
      console.error('Error loading equipment resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!eqId || !startTime || !endTime) {
      setBookingError('Please fill in all fields.');
      return;
    }

    try {
      setBookingSubmitting(true);
      await api.post(`/projects/${projectId}/bookings`, {
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
      await api.post(`/projects/${projectId}/telemetry`, {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* 1. Bookings Section */}
      <div>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h2>Heavy Machinery Bookings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Reserve equipment fleet assets for scheduling phases. Requires project authorization.
            </p>
          </div>

          {canModify && (
            <button className="btn btn-primary" onClick={() => setBookingModalOpen(true)}>
              <Plus size={14} />
              <span>Reserve Equipment</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '150px' }}></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <span className="empty-state-title">No machinery reserved</span>
            <span className="empty-state-desc">Reserve assets from the global fleet catalog to assign them here.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Type</th>
                  <th>Start Window</th>
                  <th>End Window</th>
                  <th>Booking Status</th>
                  {canModify && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const eq = b.equipmentId || {};
                  const bId = b.id || b._id;
                  return (
                    <tr key={bId}>
                      <td style={{ fontWeight: 600 }}>{eq.name || 'Excavator Model'}</td>
                      <td><span className="badge badge-info">{eq.type || 'Machinery'}</span></td>
                      <td>{formatDate(b.startTime)}</td>
                      <td>{formatDate(b.endTime)}</td>
                      <td>
                        <span className={`badge ${
                          b.status === 'completed' ? 'badge-success' :
                          b.status === 'in_progress' ? 'badge-info' :
                          b.status === 'cancelled' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      {canModify && (
                        <td>
                          {b.status === 'booked' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateBookingStatus(bId, 'in_progress')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span>Start Use</span>
                            </button>
                          )}
                          {b.status === 'in_progress' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleUpdateBookingStatus(bId, 'completed')}
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--success)' }}
                              >
                                <span>Complete</span>
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleUpdateBookingStatus(bId, 'cancelled')}
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error)' }}
                              >
                                <span>Cancel</span>
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
        )}
      </div>

      {/* 2. Telemetry Logs Section */}
      <div>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h2>Fleet Telemetry Logs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Daily logs recording machine operations hours and fuel consumption.
            </p>
          </div>

          <button className="btn btn-secondary" onClick={() => setTelemetryModalOpen(true)}>
            <Plus size={14} />
            <span>Log Daily Usage</span>
          </button>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '150px' }}></div>
        ) : telemetryLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <span className="empty-state-title">No telemetry logs found</span>
            <span className="empty-state-desc">Site engineers can record hours and fuel levels for active machinery.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Log Date</th>
                  <th>Hours Used</th>
                  <th>Fuel Consumed</th>
                  <th>Details Notes</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {telemetryLogs.map((log) => {
                  const eqObj = log.equipmentId || {};
                  const userObj = log.loggedBy || {};
                  return (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 600 }}>{eqObj.name || 'Machinery'}</td>
                      <td>{formatOnlyDate(log.date)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <Clock size={12} color="var(--text-muted)" />
                          <span>{log.hoursUsed} hrs</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Battery size={12} color="var(--text-muted)" />
                          <span>{log.fuelUsedLiters} L</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.notes || 'Routine ops'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} color="var(--text-muted)" />
                          <span>{userObj.name || 'Site Staff'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Booking Modal */}
      {bookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Reserve Fleet Asset</h2>
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
                  <label className="form-label">Machinery Equipment</label>
                  <select
                    className="form-select"
                    value={eqId}
                    onChange={(e) => setEqId(e.target.value)}
                    required
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map((eq) => (
                      <option key={eq.id || eq._id} value={eq.id || eq._id}>
                        {eq.name} ({eq.type}) - {eq.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reservation Start Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reservation End Time</label>
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
              <h2>Record Machinery Telemetry</h2>
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
                  <label className="form-label">Select Equipment</label>
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
                  <label className="form-label">Operation Date</label>
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
                    <label className="form-label">Hours Operated</label>
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
                    <label className="form-label">Fuel Used (Liters)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={telFuel}
                      onChange={(e) => setTelFuel(e.target.value)}
                      placeholder="e.g. 25"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Log Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={telNotes}
                    onChange={(e) => setTelNotes(e.target.value)}
                    placeholder="e.g. Paving excavation phase 3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTelemetryModalOpen(false)} disabled={telSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={telSubmitting}>
                  {telSubmitting ? 'Logging...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
