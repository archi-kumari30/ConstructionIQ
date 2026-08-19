import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const executeVerification = async () => {
      if (!token) {
        setMessage('Invalid verification token.');
        setLoading(false);
        return;
      }

      const res = await verifyEmail(token);
      setSuccess(res.success);
      setMessage(res.message);
      setLoading(false);
    };

    executeVerification();
  }, [token]);

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
        {loading ? (
          <div>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
            <h2>Verifying Email Address...</h2>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{success ? '✅' : '❌'}</div>
            <h2 style={{ marginBottom: '12px' }}>{success ? 'Email Verified' : 'Verification Failed'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
