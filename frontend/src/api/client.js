/* Mock API client for frontend-only mode */

// Initialize storage if empty
if (localStorage.getItem('pc_wallet_balance') === null) {
  localStorage.setItem('pc_wallet_balance', '1000');
}
if (!localStorage.getItem('pc_transactions')) {
  localStorage.setItem('pc_transactions', JSON.stringify([
    { _id: 'tx-1', type: 'deposit', description: 'Welcome Sign-up Bonus', date: new Date(Date.now() - 3600000).toISOString(), amount: 1000 }
  ]));
}
if (!localStorage.getItem('pc_activations')) {
  localStorage.setItem('pc_activations', JSON.stringify([]));
}
if (!localStorage.getItem('pc_marketplace')) {
  localStorage.setItem('pc_marketplace', JSON.stringify([
    { _id: 'm-1', service: 'Netflix Premium (1 Month)', price: 1500, status: 'available' },
    { _id: 'm-2', service: 'ChatGPT Plus (Shared)', price: 2000, status: 'available' },
    { _id: 'm-3', service: 'Spotify Family (3 Months)', price: 800, status: 'available' },
    { _id: 'm-4', service: 'YouTube Premium', price: 600, status: 'available' },
  ]));
}

const mockBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '999992', name: 'OPay' },
  { code: '999991', name: 'Moniepoint' },
  { code: '50211', name: 'Kuda Bank' }
];

const mockCountries = [
  { id: '19', name: 'Nigeria' },
  { id: '0', name: 'United States' },
  { id: '1', name: 'United Kingdom' },
  { id: '2', name: 'Ghana' },
  { id: '3', name: 'Kenya' }
];

const mockCatalog = [
  { service: 'whatsapp', icon: 'whatsapp', name: 'WhatsApp', priceNgn: 450 },
  { service: 'telegram', icon: 'telegram', name: 'Telegram', priceNgn: 300 },
  { service: 'google', icon: 'google', name: 'Google / Gmail', priceNgn: 250 },
  { service: 'facebook', icon: 'facebook', name: 'Facebook', priceNgn: 200 },
  { service: 'netflix', icon: 'netflix', name: 'Netflix', priceNgn: 400 },
  { service: 'chatgpt', icon: 'chatgpt', name: 'ChatGPT / OpenAI', priceNgn: 500 },
  { service: 'steam', icon: 'steam', name: 'Steam', priceNgn: 350 },
  { service: 'instagram', icon: 'instagram', name: 'Instagram', priceNgn: 200 }
];

function getBalance() {
  return Number(localStorage.getItem('pc_wallet_balance') || '0');
}

function setBalance(val) {
  localStorage.setItem('pc_wallet_balance', String(val));
}

function getTransactions() {
  return JSON.parse(localStorage.getItem('pc_transactions') || '[]');
}

function addTransaction(type, description, amount) {
  const txns = getTransactions();
  const newTx = {
    _id: 'tx-' + Math.random().toString(36).substr(2, 9),
    type,
    description,
    date: new Date().toISOString(),
    amount
  };
  txns.unshift(newTx);
  localStorage.setItem('pc_transactions', JSON.stringify(txns));
  return newTx;
}

function getActivationsList() {
  const list = JSON.parse(localStorage.getItem('pc_activations') || '[]');
  // Dynamic update logic: if activation is pending and 6s have elapsed, auto-complete it
  let changed = false;
  const updated = list.map(a => {
    if (a.status === 'pending' && Date.now() - new Date(a.createdAt).getTime() > 6000) {
      changed = true;
      return {
        ...a,
        status: 'active',
        code: String(Math.floor(100000 + Math.random() * 900000)) // 6-digit random code
      };
    }
    return a;
  });
  if (changed) {
    localStorage.setItem('pc_activations', JSON.stringify(updated));
  }
  return updated;
}

function getMarketplaceList() {
  return JSON.parse(localStorage.getItem('pc_marketplace') || '[]');
}

function mockResponse(data) {
  return Promise.resolve({ data });
}

const client = {
  get: (url, config = {}) => {
    // 1. Wallet balance & transactions
    if (url === '/api/wallet') {
      return mockResponse({
        balance: getBalance(),
        transactions: getTransactions()
      });
    }

    // 2. Auth user info
    if (url.startsWith('/api/auth/me')) {
      const user = JSON.parse(localStorage.getItem('pc_user') || '{}');
      return mockResponse({ user });
    }

    // 3. Banks
    if (url === '/api/wallet/withdraw/banks') {
      return mockResponse({ banks: mockBanks });
    }

    // 4. Supported countries for SMS
    if (url === '/api/sms/supported-countries') {
      return mockResponse({ countries: mockCountries });
    }

    // 5. SMS activations list
    if (url === '/api/sms/activations') {
      return mockResponse({ activations: getActivationsList() });
    }

    // 6. SMS catalog
    if (url === '/api/sms/catalog') {
      const params = config.params || {};
      const search = (params.search || '').toLowerCase();
      const minPrice = params.minPrice;
      const maxPrice = params.maxPrice;

      let filtered = mockCatalog;
      if (search) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(search));
      }
      if (minPrice !== undefined && minPrice !== null) {
        filtered = filtered.filter(item => item.priceNgn >= minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== null) {
        filtered = filtered.filter(item => item.priceNgn <= maxPrice);
      }
      return mockResponse({ items: filtered });
    }

    // 7. Individual SMS activation status check
    const statusMatch = url.match(/^\/api\/sms\/activations\/([^/]+)\/status$/);
    if (statusMatch) {
      const id = statusMatch[1];
      const list = getActivationsList(); // triggers status update check
      const item = list.find(a => a._id === id || a.activationId === id);
      return mockResponse({ activation: item });
    }

    // 8. Marketplace accounts
    if (url === '/api/accounts/available') {
      return mockResponse({ accounts: getMarketplaceList() });
    }

    return mockResponse({});
  },

  post: (url, payload = {}) => {
    // 1. Auth Login / Register
    if (url === '/api/auth/login' || url === '/api/auth/register') {
      const name = payload.name || 'Test User';
      const email = payload.email || 'test@gmail.com';
      const user = { id: 'mock-user-123', name, email };
      localStorage.setItem('pc_user', JSON.stringify(user));
      return mockResponse({ token: 'mock-token-12345', user });
    }

    // 2. Paystack topup initialization
    if (url.startsWith('/api/wallet/paystack/initialize')) {
      const amount = Number(payload.amount);
      const current = getBalance();
      setBalance(current + amount);
      addTransaction('deposit', 'Wallet Top-up via Paystack', amount);
      
      // return a mock auth url (our wallet callback page is /wallet/callback)
      return mockResponse({
        status: 'success',
        authorization_url: `http://localhost:5174/wallet/callback?status=success&amount=${amount}`,
        reference: 'ref-' + Math.random().toString(36).substr(2, 9)
      });
    }

    // 3. Paystack verification
    if (url.startsWith('/api/wallet/paystack/verify')) {
      return mockResponse({ status: 'success', balance: getBalance() });
    }

    // 4. Resolve account number
    if (url === '/api/wallet/withdraw/resolve-account') {
      const bank = mockBanks.find(b => b.code === payload.bankCode);
      const bankName = bank ? bank.name : 'Selected Bank';
      return mockResponse({ accountName: `TEST ACCOUNT (${bankName})` });
    }

    // 5. Submit withdrawal
    if (url === '/api/wallet/withdraw') {
      const amount = Number(payload.amount);
      const current = getBalance();
      if (current < amount) {
        return Promise.reject({ response: { data: { message: 'Insufficient funds for withdrawal.' } } });
      }
      setBalance(current - amount);
      addTransaction('withdrawal', `Withdrawal to ${payload.accountNumber}`, -amount);
      return mockResponse({ status: 'success', message: 'Your withdrawal is being processed.' });
    }

    // 6. Rent number
    if (url === '/api/sms/getNumber') {
      const { service, country } = payload;
      const countryObj = mockCountries.find(c => c.id === country) || mockCountries[0];
      const serviceObj = mockCatalog.find(s => s.service === service);
      const cost = serviceObj ? serviceObj.priceNgn : 450;
      
      const current = getBalance();
      if (current < cost) {
        return Promise.reject({ response: { data: { message: 'Insufficient wallet balance. Top up first!' } } });
      }

      // Deduct balance
      setBalance(current - cost);
      
      // Generate phone number
      const localPrefix = country === '19' ? '+234' : country === '0' ? '+1' : country === '1' ? '+44' : '+233';
      const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
      const number = `${localPrefix}${randomDigits}`;
      
      const activationId = 'act-' + Math.random().toString(36).substr(2, 9);
      const newActivation = {
        _id: activationId,
        activationId,
        service: service,
        serviceName: serviceObj ? serviceObj.name : service,
        number,
        country: countryObj.name,
        status: 'pending',
        cost: cost,
        code: '',
        createdAt: new Date().toISOString()
      };

      const list = JSON.parse(localStorage.getItem('pc_activations') || '[]');
      list.unshift(newActivation);
      localStorage.setItem('pc_activations', JSON.stringify(list));

      addTransaction('purchase', `Rented ${newActivation.serviceName} number`, -cost);

      return mockResponse({ activation: newActivation });
    }

    // 7. Cancel SMS activation
    const cancelMatch = url.match(/^\/api\/sms\/activations\/([^/]+)\/cancel$/);
    if (cancelMatch) {
      const id = cancelMatch[1];
      const list = JSON.parse(localStorage.getItem('pc_activations') || '[]');
      const itemIndex = list.findIndex(a => a._id === id || a.activationId === id);
      if (itemIndex !== -1 && list[itemIndex].status === 'pending') {
        const item = list[itemIndex];
        item.status = 'cancelled';
        localStorage.setItem('pc_activations', JSON.stringify(list));

        // Refund
        const current = getBalance();
        setBalance(current + item.cost);
        addTransaction('deposit', `Refund for cancelled ${item.serviceName || item.service} rental`, item.cost);

        return mockResponse({ success: true, message: 'Activation cancelled and wallet refunded.' });
      }
      return Promise.reject({ response: { data: { message: 'Rental cannot be cancelled.' } } });
    }

    // 8. Purchase marketplace account
    if (url === '/api/accounts/purchase') {
      const accountId = payload.accountId;
      const marketplace = getMarketplaceList();
      const accountIndex = marketplace.findIndex(a => a._id === accountId);
      if (accountIndex === -1) {
        return Promise.reject({ response: { data: { message: 'Account not available.' } } });
      }
      const account = marketplace[accountIndex];
      const current = getBalance();
      if (current < account.price) {
        return Promise.reject({ response: { data: { message: 'Insufficient wallet balance.' } } });
      }

      setBalance(current - account.price);
      addTransaction('purchase', `Purchased ${account.service} account`, -account.price);

      // Remove from available list
      marketplace.splice(accountIndex, 1);
      localStorage.setItem('pc_marketplace', JSON.stringify(marketplace));

      return mockResponse({
        account: {
          ...account,
          status: 'sold',
          credentials: {
            username: `pc_user_${Math.floor(1000 + Math.random() * 9000)}`,
            password: Math.random().toString(36).substr(2, 8)
          }
        }
      });
    }

    // 9. Support report
    if (url === '/api/support/report') {
      return mockResponse({ message: 'Support ticket submitted. We will email you soon!' });
    }

    return mockResponse({});
  },

  put: (url, payload = {}) => {
    if (url.startsWith('/api/auth/me') || url.startsWith('/api/auth/profile')) {
      const user = JSON.parse(localStorage.getItem('pc_user') || '{}');
      const updated = { ...user, ...payload };
      localStorage.setItem('pc_user', JSON.stringify(updated));
      return mockResponse({ user: updated });
    }
    return mockResponse({});
  }
};

export default client;
