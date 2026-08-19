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
      backgroundColor: '#F4F1EA',
      color: '#1E252B',
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
        backgroundImage: 'linear-gradient(rgba(23, 37, 43, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(23, 37, 43, 0.02) 1px, transparent 1px)',
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
        backgroundColor: 'rgba(23, 37, 43, 0.1)',
        zIndex: 2
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        width: '1px',
        height: '120px',
        backgroundColor: 'rgba(23, 37, 43, 0.1)',
        zIndex: 2
      }}></div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        
        {/* Logo - Fades in */}
        <Link 
          to="/" 
          className="animate-fade-slide-up"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none', 
            color: '#1E252B', 
            marginBottom: '12px' 
          }}
        >
          <div style={{ width: '4px', height: '18px', backgroundColor: '#A64B2A' }}></div>
          <span style={{ fontWeight: 500, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CONSTRUCTIONIQ</span>
        </Link>

        {/* Technical label */}
        <div className="animate-fade-slide-up seq-1" style={{ fontSize: '10px', color: '#A64B2A', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', marginBottom: '16px' }}>
          AUTHENTICATION
        </div>

        {/* Technical header - Slides up */}
        <div className="animate-fade-slide-up seq-1" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: '0 0 6px 0' }}>Welcome back.</h2>
          <span style={{ fontSize: '13.5px', color: '#5F6870', fontWeight: 500 }}>Sign in to continue to your construction workspace.</span>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(198, 40, 40, 0.05)',
            color: '#C62828',
            border: '1px solid rgba(198, 40, 40, 0.2)',
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
          className="animate-fade-slide-up seq-2"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D9D5CC',
            borderRadius: '12px',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'left'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, color: '#1E252B', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pm@constructioniq.com"
                disabled={loading}
                required
                style={{
                  height: '46px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #C9C5BD',
                  color: '#1E252B',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  width: '100%',
                  outline: 'none',
                  transition: 'border-color 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A4174'}
                onBlur={(e) => e.target.style.borderColor = '#C9C5BD'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, color: '#1E252B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>PASSWORD</label>
                <Link to="/forgot-password" style={{ fontSize: '11px', color: '#0A4174', fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-title)' }}>FORGOT PASSWORD?</Link>
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
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #C9C5BD',
                    color: '#1E252B',
                    padding: '0 14px',
                    paddingRight: '40px',
                    fontSize: '13.5px',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0A4174'}
                  onBlur={(e) => e.target.style.borderColor = '#C9C5BD'}
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
                    color: '#5F6870',
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
              className="btn btn-primary animate-fade-slide-up seq-3"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#1E252B',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 500,
                fontSize: '13px',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#A64B2A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1E252B'}
            >
              {loading ? 'Verifying Access...' : 'SIGN IN →'}
            </button>
          </form>

          {/* Footer of card */}
          <div style={{ borderTop: '1px solid #D9D5CC', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '11px' }}>
            <Link to="/" style={{ color: '#5F6870', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>← BACK TO WEBSITE</span>
            </Link>
          </div>
        </div>

        {/* Bottom Technical Status strip */}
        <div className="animate-fade-slide-up seq-4" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>
          <span>CONSTRUCTIONIQ / AUTH</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2E7D32' }}></span>
            <span>SYSTEM STATUS: OPERATIONAL</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
