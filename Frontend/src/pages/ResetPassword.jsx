import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await resetPassword(token, password);
    if (res.success) {
      setMessage(res.message || 'Password reset successfully.');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--primary)',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        padding: '30px',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Create New Password</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter your new secure workspace password</div>
        </div>

        {message && (
          <div style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            border: '1px solid var(--success)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {message}
            <div style={{ marginTop: '10px' }}>
              <Link to="/login" className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 8px' }}>Login</Link>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
