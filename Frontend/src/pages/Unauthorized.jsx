import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
      gap: '16px',
      padding: '24px'
    }}>
      <ShieldAlert size={48} color="var(--error)" />
      <h1>Access Denied</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '14px' }}>
        You do not have the required permissions to view this workspace resource or catalog settings.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
