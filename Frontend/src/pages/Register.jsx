import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();

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

    const res = await register(
      name.trim(),
      email.trim(),
      password,
      role,
      phone.trim()
    );

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message);
    }
  };

  /* =========================================
     REGISTRATION SUCCESS
     ========================================= */
  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          fontFamily: 'var(--sans)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            textAlign: 'center'
          }}
        >
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
            <div
              style={{
                width: '4px',
                height: '18px',
                backgroundColor: 'var(--accent)'
              }}
            />

            <span
              style={{
                fontWeight: 800,
                fontSize: '18px',
                fontFamily: 'var(--font-title)',
                letterSpacing: '0.5px'
              }}
            >
              CONSTRUCTIONIQ
            </span>
          </Link>

          {/* Registration Label */}
          <div
            style={{
              fontSize: '10px',
              color: 'var(--accent)',
              fontWeight: 650,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-title)',
              marginBottom: '16px'
            }}
          >
            REGISTRATION
          </div>

          {/* Success Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '36px',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '16px'
              }}
            >
              ✅
            </div>

            <h2
              style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-title)'
              }}
            >
              Registration Successful!
            </h2>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}
            >
              Your account has been created. You can now log in to your
              construction workspace.
            </p>

            <Link
              to="/login"
              style={{
                width: '100%',
                height: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-title)'
              }}
            >
              GO TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     REGISTRATION PAGE
     ========================================= */
  return (
    <div
      style={{
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
        overflow: 'auto'
      }}
    >
      {/* Blueprint Grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(193, 68, 14, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(193, 68, 14, 0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Architectural line */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '120px',
          height: '1px',
          backgroundColor: 'var(--border)',
          zIndex: 2
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '1px',
          height: '120px',
          backgroundColor: 'var(--border)',
          zIndex: 2
        }}
      />

      {/* =====================================
          MAIN CONTENT
          ===================================== */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center'
        }}
      >
        {/* =====================================
            LOGO
            ===================================== */}
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
          <div
            style={{
              width: '4px',
              height: '18px',
              backgroundColor: 'var(--accent)'
            }}
          />

          <span
            style={{
              fontWeight: 800,
              fontSize: '18px',
              fontFamily: 'var(--font-title)',
              letterSpacing: '0.5px'
            }}
          >
            CONSTRUCTIONIQ
          </span>
        </Link>

        {/* =====================================
            REGISTRATION LABEL
            ===================================== */}
        <div
          style={{
            fontSize: '10px',
            color: 'var(--accent)',
            fontWeight: 650,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-title)',
            marginBottom: '16px'
          }}
        >
          REGISTRATION
        </div>

        {/* =====================================
            HEADER
            ===================================== */}
        <div
          style={{
            marginBottom: '24px',
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-title)',
              margin: '0 0 6px 0'
            }}
          >
            Create your account.
          </h2>

          <span
            style={{
              fontSize: '13.5px',
              color: 'var(--text-muted)'
            }}
          >
            Create an account to access your construction workspace.
          </span>
        </div>

        {/* =====================================
            ERROR
            ===================================== */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error)',
              border: '1px solid rgba(220, 38, 38, 0.1)',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 500,
              marginBottom: '20px',
              textAlign: 'left'
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================
            REGISTRATION CARD
            ===================================== */}
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

            {/* FULL NAME */}
            <div
              className="form-group"
              style={{
                marginBottom: '18px'
              }}
            >
              <label
                className="form-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                FULL NAME
              </label>

              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={loading}
                required
                style={{
                  height: '46px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* EMAIL */}
            <div
              className="form-group"
              style={{
                marginBottom: '18px'
              }}
            >
              <label
                className="form-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pm@constructioniq.com"
                disabled={loading}
                required
                style={{
                  height: '46px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* PASSWORD */}
            <div
              className="form-group"
              style={{
                marginBottom: '18px'
              }}
            >
              <label
                className="form-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                PASSWORD
              </label>

              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={loading}
                required
                minLength={6}
                style={{
                  height: '46px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* PHONE */}
            <div
              className="form-group"
              style={{
                marginBottom: '18px'
              }}
            >
              <label
                className="form-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                PHONE NUMBER
              </label>

              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                disabled={loading}
                required
                style={{
                  height: '46px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* ROLE */}
            <div
              className="form-group"
              style={{
                marginBottom: '24px'
              }}
            >
              <label
                className="form-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                WORKFORCE ROLE
              </label>

              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                style={{
                  height: '46px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <option value="project_manager">
                  Project Manager
                </option>

                <option value="site_engineer">
                  Site Engineer
                </option>

                <option value="contractor">
                  Contractor
                </option>

                <option value="supplier">
                  Supplier
                </option>

                {/* Admin intentionally excluded */}
              </select>
            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                padding: '10px',
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER →'}
            </button>
          </form>

          {/* =====================================
              FOOTER
              ===================================== */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              marginTop: '24px',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              gap: '12px'
            }}
          >
            <span
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                SIGN IN
              </Link>
            </span>

            <Link
              to="/"
              style={{
                color: 'var(--text-muted)',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              ← BACK TO WEBSITE
            </Link>
          </div>
        </div>

        {/* =====================================
            TECHNICAL STATUS
            ===================================== */}
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-title)'
          }}
        >
          <span>CONSTRUCTIONIQ / REGISTRATION</span>

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)'
              }}
            />

            <span>SYSTEM STATUS: OPERATIONAL</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;