import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MapPin, Calendar, Landmark, User, Settings, Trash2, Edit2 } from 'lucide-react';

const OverviewTab = ({ project, isAdmin, isProjectManager, onUpdate }) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name || '',
    location: project.location || '',
    startDate: project.startDate ? project.startDate.split('T')[0] : '',
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
    budgetEstimated: project.budgetEstimated || '',
    status: project.status || 'planning'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const pId = project.id || project._id;
      const res = await api.put(`/projects/${pId}`, {
        ...formData,
        budgetEstimated: parseFloat(formData.budgetEstimated)
      });
      setEditing(false);
      if (onUpdate) onUpdate(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This action is permanent.')) {
      return;
    }
    setError('');
    try {
      const pId = project.id || project._id;
      await api.delete(`/projects/${pId}`);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', textAlign: 'left' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Project Profile & Timeline</h2>
          {canModify && !editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              <Edit2 size={14} />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '10px', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Location Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Estimated Budget ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.budgetEstimated}
                  onChange={(e) => setFormData({ ...formData, budgetEstimated: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={18} color="var(--text-muted)" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Site Location</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{project.location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Calendar size={18} color="var(--text-muted)" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Construction Schedule</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(project.startDate)} — {formatDate(project.endDate)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Landmark size={18} color="var(--text-muted)" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Allocated Estimated Budget</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-light)' }}>${project.budgetEstimated?.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <User size={18} color="var(--text-muted)" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Project Manager</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{project.manager?.name || project.manager || 'Unassigned'}</div>
                {project.manager?.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{project.manager.email}</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Project Status Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Project Health</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Status Badge:</span>
            <span className={`badge ${
              project.status === 'active' ? 'badge-success' :
              project.status === 'planning' ? 'badge-info' :
              project.status === 'completed' ? 'badge-success' :
              'badge-danger'
            }`}>
              {project.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Workspace ID:</span>
            <code style={{ fontSize: '11px', padding: '2px 4px' }}>{project.id || project._id}</code>
          </div>
        </div>

        {/* PM/Admin Destructive Actions */}
        {canModify && (
          <div className="card" style={{ borderColor: 'rgba(192, 57, 43, 0.3)', backgroundColor: '#FFF5F5' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>Danger Zone</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Deleting a project deletes all associated milestones, workforce attendance lists, material logs, and expenses.
            </p>
            <button className="btn btn-danger" onClick={handleDelete} style={{ width: '100%' }}>
              <Trash2 size={14} />
              <span>Delete Project Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
