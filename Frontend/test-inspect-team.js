import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

const check = async () => {
  try {
    // 1. Log in
    const loginRes = await api.post('/auth/login', {
      email: 'projectmanager@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.tokens.accessToken;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Fetch Project Team Members
    const res = await api.get('/projects/6a806e331a4ab04ab9781835/team');
    console.log('API response team data:');
    console.log(JSON.stringify(res.data.data, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.response?.data || err.message);
    process.exit(1);
  }
};

check();
