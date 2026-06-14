// src/pages/ConnectionTest.jsx
// Temporary page to verify frontend → backend API communication.
// Will be deleted after Phase 4 is confirmed working.

import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

function ConnectionTest() {
  const [status, setStatus]   = useState('Testing connection...');
  const [data,   setData]     = useState(null);
  const [error,  setError]    = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        setStatus('✅ Connected to backend successfully!');
        setData(res.data);
      })
      .catch((err) => {
        setStatus('❌ Connection failed');
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🏥 HMS — Full Stack Connection Test</h1>
      <hr style={{ margin: '1rem 0' }} />
      <h2>{status}</h2>
      {data  && <pre style={{ background: '#e8f5e9', padding: '1rem', marginTop: '1rem' }}>{JSON.stringify(data, null, 2)}</pre>}
      {error && <pre style={{ background: '#ffebee', padding: '1rem', marginTop: '1rem' }}>{error}</pre>}
    </div>
  );
}

export default ConnectionTest;