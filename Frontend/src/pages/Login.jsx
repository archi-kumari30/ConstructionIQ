import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Destination path (redirects to dashboard if no state)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      fontFamily: 'var(--sans)',
      overflow: 'hidden'
    }}>
      {/* Faint blueprint coordinate grid background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(193, 68, 14, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(193, 68, 14, 0.012) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      {/* Decorative architectural measurement lines */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        width: '120px',
        height: '1px',
        backgroundColor: 'var(--border)',
        zIndex: 2
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        width: '1px',
        height: '120px',
        backgroundColor: 'var(--border)',
        zIndex: 2
      }}></div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none', 
            color: 'var(--text-primary)', 
            marginBottom: '12px' 
          }}
        >
          <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--accent)' }}></div>
          <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CONSTRUCTIONIQ</span>
        </Link>

        {/* Technical label */}
        <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 650, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', marginBottom: '16px' }}>
          AUTHENTICATION
        </div>

        {/* Technical header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: '0 0 6px 0' }}>Welcome back.</h2>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Sign in to continue to your construction workspace.</span>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            border: '1px solid rgba(220, 38, 38, 0.1)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12.5px',
            fontWeight: 500,
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {/* Login Panel - Structured card */}
        <div 
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '36px',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'left'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pm@constructioniq.com"
                disabled={loading}
                required
                style={{
                  height: '46px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  width: '100%',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 650, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>PASSWORD</label>
                <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-title)' }}>FORGOT PASSWORD?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  style={{
                    height: '46px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    padding: '0 14px',
                    paddingRight: '40px',
                    fontSize: '13.5px',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
            >
              {loading ? 'Verifying Access...' : 'SIGN IN →'}
            </button>
          </form>

          {/* Footer of card */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '11px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>← BACK TO WEBSITE</span>
            </Link>
          </div>
        </div>

        {/* Bottom Technical Status strip */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-title)' }}>
          <span>CONSTRUCTIONIQ / AUTH</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            <span>SYSTEM STATUS: OPERATIONAL</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
