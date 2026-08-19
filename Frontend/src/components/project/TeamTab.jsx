import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Mail, Briefcase, Filter } from 'lucide-react';

const TeamTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliersOnly, setSuppliersOnly] = useState(false);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [roleOnProject, setRoleOnProject] = useState('site_engineer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/team`);
      setTeam(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching project team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Please provide a User ID.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/team`, { userId, roleOnProject });
      setModalOpen(false);
      setUserId('');
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add team member. Verify User ID.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to remove this user from the project workspace?')) {
      return;
    }
    try {
      await api.delete(`/projects/${projectId}/team/${targetUserId}`);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove team member.');
    }
  };

  const displayTeam = suppliersOnly
    ? team.filter((m) => m.roleOnProject === 'supplier' || m.user?.role === 'supplier' || m.userId?.role === 'supplier')
    : team;

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2>Project Roster</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {suppliersOnly ? 'Suppliers attached to delivery logs' : 'All engineers, contractors, and suppliers assigned to this workspace'}
          </p>
        </div>

        <div className="page-header-actions">
          {/* Toggle for suppliers */}
          <button 
            className={`btn ${suppliersOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSuppliersOnly(!suppliersOnly)}
          >
            <Filter size={14} />
            <span>{suppliersOnly ? 'Show All Members' : 'Show Suppliers Only'}</span>
          </button>

          {canModify && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Role on Project</th>
                <th>System Role</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="skeleton" style={{ height: '40px', margin: '4px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : displayTeam.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-title">No members found</span>
          <span className="empty-state-desc">
            {suppliersOnly 
              ? 'No suppliers are assigned to this project team yet. Add team members with the Supplier role to populate this list.'
              : 'Workspace roster is empty.'}
          </span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email Contact</th>
                <th>Role on Project</th>
                <th>Platform Access Role</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayTeam.map((member) => {
                const userObj = member.user || member.userId || {};
                const uId = userObj._id || userObj.id || member.userId || member.user;
                return (
                  <tr key={member._id || uId}>
                    <td style={{ fontWeight: 600 }}>{userObj.name || 'Unknown User'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="var(--text-muted)" />
                        <span>{userObj.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{member.roleOnProject}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '12px' }}>{userObj.role || 'N/A'}</span>
                      </div>
                    </td>
                    {canModify && (
                      <td>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleRemoveMember(uId)}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
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

      {/* Add Member Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Add Team Member / Supplier</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                {error && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 60d0fe4f5311236168a109ee"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    Specify the system User ID of the registered workforce user.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Role on Project</label>
                  <select
                    className="form-select"
                    value={roleOnProject}
                    onChange={(e) => setRoleOnProject(e.target.value)}
                  >
                    <option value="site_engineer">Site Engineer</option>
                    <option value="contractor">Contractor</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTab;
