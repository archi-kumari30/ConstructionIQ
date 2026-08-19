import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';

const MilestonesTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/milestones`);
      setMilestones(res.data?.data?.milestones || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !dueDate) {
      setError('Please provide title and due date.');
      return;
    }

    const payload = {
      title,
      description,
      dueDate: new Date(dueDate),
      status
    };

    try {
      setSubmitting(true);
      if (editingMilestone) {
        const mId = editingMilestone.id || editingMilestone._id;
        await api.put(`/projects/${projectId}/milestones/${mId}`, payload);
      } else {
        await api.post(`/projects/${projectId}/milestones`, payload);
      }
      setModalOpen(false);
      resetForm();
      fetchMilestones();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title || '');
    setDescription(milestone.description || '');
    setDueDate(milestone.dueDate ? milestone.dueDate.split('T')[0] : '');
    setStatus(milestone.status || 'pending');
    setModalOpen(true);
  };

  const handleDelete = async (milestoneId) => {
    if (!window.confirm('Delete this milestone? This will remove it from the schedule.')) {
      return;
    }
    try {
      await api.delete(`/projects/${projectId}/milestones/${milestoneId}`);
      fetchMilestones();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone.');
    }
  };

  const resetForm = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('pending');
    setError('');
  };

  // HTML5 drag and drop handlers
  const handleDragStart = (e, milestoneId) => {
    e.dataTransfer.setData('text/plain', milestoneId);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const milestoneId = e.dataTransfer.getData('text/plain');
    if (!milestoneId) return;

    // Find current milestone
    const milestone = milestones.find((m) => (m.id || m._id) === milestoneId);
    if (!milestone || milestone.status === targetStatus) return;

    // Call API to update status
    try {
      // Optimistic UI update
      setMilestones((prev) =>
        prev.map((m) =>
          (m.id || m._id) === milestoneId ? { ...m, status: targetStatus } : m
        )
      );

      await api.put(`/projects/${projectId}/milestones/${milestoneId}`, {
        title: milestone.title,
        dueDate: milestone.dueDate,
        status: targetStatus
      });
    } catch (err) {
      console.error('Failed to update milestone status on drop:', err);
      // Revert on error
      fetchMilestones();
    }
  };

  const columns = [
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'delayed', label: 'Delayed' }
  ];

  const formatColumnStatus = (statusKey) => {
    return statusKey.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Project Schedule & Milestones</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {canModify ? 'Drag and drop cards between columns to transition status' : 'View-only access to scheduling calendar timeline'}
          </p>
        </div>

        {canModify && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus size={14} />
            <span>New Milestone</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="kanban-board">
          {columns.map((col) => (
            <div key={col.key} className="kanban-column skeleton" style={{ height: '300px' }}></div>
          ))}
        </div>
      ) : (
        <div className="kanban-board">
          {columns.map((col) => {
            const colMilestones = milestones.filter((m) => m.status === col.key);
            return (
              <div
                key={col.key}
                className="kanban-column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{col.label}</span>
                  <span className="kanban-column-count">{colMilestones.length}</span>
                </div>

                <div className="kanban-card-list">
                  {colMilestones.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px', border: '1px dashed rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                      Drop items here
                    </div>
                  ) : (
                    colMilestones.map((m) => {
                      const mId = m.id || m._id;
                      return (
                        <div
                          key={mId}
                          className="kanban-card"
                          draggable={canModify}
                          onDragStart={(e) => handleDragStart(e, mId)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div className="kanban-card-title">{m.title}</div>
                            {canModify && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => handleEditClick(m)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => handleDelete(mId)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {m.description && <div className="kanban-card-desc">{m.description}</div>}
                          
                          <div className="kanban-card-footer" style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={11} />
                              <span>Due: {formatDate(m.dueDate)}</span>
                            </div>
                            
                            {col.key === 'delayed' && (
                              <AlertCircle size={12} color="var(--error)" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New/Edit Milestone Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{editingMilestone ? 'Edit Milestone' : 'Add Project Milestone'}</h2>
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
                  <label className="form-label">Milestone Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Foundation & Piling"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide description details..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Milestone Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesTab;
