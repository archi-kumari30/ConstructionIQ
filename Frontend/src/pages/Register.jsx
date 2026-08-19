import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('project_manager');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !phone) {
      setError('Please fill in all fields');
      return;
    }

    const res = await register(name, email, password, role, phone);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message);
    }
  };

  if (success) {
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
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '12px' }}>Registration Successful!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Your account has been created. A verification link has been simulated. You can now log in to your workspace.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', display: 'inline-flex' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
        maxWidth: '450px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        padding: '30px',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '10px'
          }}>
            <div style={{ width: '12px', height: '24px', backgroundColor: 'var(--accent)', borderRadius: '2px' }}></div>
            <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>ConstructionIQ</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create your user account</div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@constructioniq.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1234567890"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Workforce Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="project_manager">Project Manager</option>
              <option value="site_engineer">Site Engineer</option>
              <option value="contractor">Contractor</option>
              <option value="supplier">Supplier</option>
              {/* ADMIN excluded on purpose */}
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
