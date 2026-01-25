import axios from 'axios';

const API_URL = 'https://primeconnect-backend.onrender.com/api';

async function verify() {
    console.log('Verifying connection to:', API_URL);

    // 1. Health Check
    try {
        const health = await axios.get('https://primeconnect-backend.onrender.com/');
        console.log('Health Check: OK', health.status, health.data);
    } catch (err) {
        console.error('Health Check Failed');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }

    // 2. Register/Login User
    const user = { name: 'DeployTest', email: 'deploy_test_3@example.com', password: 'password123' };
    let token = null;
    let userId = null;

    try {
        console.log('Attempting Register...');
        const regRes = await axios.post(`${API_URL}/auth/register`, user);
        console.log('Register Success:', regRes.data.status);
        token = regRes.data.token;
        userId = regRes.data.user._id;
    } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('exists')) {
            console.log('User exists, logging in...');
            try {
                const loginRes = await axios.post(`${API_URL}/auth/login`, { email: user.email, password: user.password });
                token = loginRes.data.token;
                userId = loginRes.data.user._id;
                console.log('Login Success');
            } catch (loginErr) {
                console.error('Login Failed:', loginErr.response?.data || loginErr.message);
            }
        } else {
            console.error('Register Failed:', err.response?.data || err.message);
        }
    }

    if (token) {
        // 3. Verify Wallet Endpoint (Read-Only)
        try {
            console.log('Checking Wallet...');
            const walletRes = await axios.get(`${API_URL}/wallet/balance/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Wallet Balance:', walletRes.data.balance);
        } catch (err) {
            console.error('Wallet Check Failed:', err.response?.data || err.message);
        }

        // 4. Verify SMS Endpoint (Auth Check)
        try {
            console.log('Checking SMS Auth...');
            await axios.post(`${API_URL}/sms/send`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
                if (err.response?.status === 400) {
                    console.log('SMS Auth Passed (400 Bad Request as expected)');
                } else {
                    console.error('SMS Check Unexpected:', err.response?.status);
                }
            });
        } catch (err) {
            // ignore
        }
    } else {
        console.log('Skipping authenticated checks (no token).');
    }
}

verify();
