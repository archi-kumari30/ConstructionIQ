import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, User, Clock, Check, Calendar, CheckSquare } from 'lucide-react';

const AttendanceTab = ({ projectId }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [workersList, setWorkersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('present');
  const [shift, setShift] = useState('day');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceRes, workersRes] = await Promise.all([
        api.get(`/projects/${projectId}/attendance`),
        api.get('/workers')
      ]);
      setAttendanceLogs(attendanceRes.data?.data?.attendance || []);
      setWorkersList(workersRes.data?.data?.workers || []);
    } catch (err) {
      console.error('Error loading attendance logs:', err);
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

    if (!workerId || !date || !status) {
      setError('Please select a worker, date, and status.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/attendance`, {
        workerId,
        date: new Date(date),
        status,
        shift,
        overtimeHours: parseFloat(overtimeHours || '0')
      });
      setModalOpen(false);
      setWorkerId('');
      setDate('');
      setStatus('present');
      setShift('day');
      setOvertimeHours('0');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Conflict: attendance already logged for this date.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'present': return 'badge-success';
      case 'absent': return 'badge-danger';
      case 'half_day': return 'badge-warning';
      case 'leave': return 'badge-info';
      default: return 'badge-info';
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Workforce Daily Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Roster registry and daily check-ins. Limits to one log entry per worker per day.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          <span>Log Attendance</span>
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '150px' }}></div>
      ) : attendanceLogs.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px' }}>
          <CheckSquare size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No attendance logged yet</span>
          <span className="empty-state-desc">Site engineers can log workforce shifts and overtime hours here.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Trade Role</th>
                <th>Check-in Date</th>
                <th>Shift Type</th>
                <th>Overtime</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.map((log) => {
                const worker = log.worker || log.workerId || {};
                return (
                  <tr key={log._id}>
                    <td style={{ fontWeight: 600 }}>{worker.name || 'Unknown Worker'}</td>
                    <td>{worker.trade || 'Laborer'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{formatDate(log.date)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.shift}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{log.overtimeHours || 0} hrs</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(log.status)}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Log Daily Check-in</h2>
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
                  <label className="form-label">Roster Worker</label>
                  <select
                    className="form-select"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    required
                  >
                    <option value="">Select Worker...</option>
                    {workersList.map((w) => (
                      <option key={w.id || w._id} value={w.id || w._id}>
                        {w.name} ({w.trade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attendance Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Check-in Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select
                      className="form-select"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Overtime (hrs)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={overtimeHours}
                      onChange={(e) => setOvertimeHours(e.target.value)}
                      placeholder="e.g. 2"
                      min="0"
                      max="12"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
