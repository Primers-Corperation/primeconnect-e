import client from './client.js';

// The user's rented numbers (activations).
export async function getActivations() {
  const { data } = await client.get('/api/sms/activations');
  return data.activations || [];
}

// Rent a new number for a service/country via Grizzly.
export async function rentNumber({ service, country }) {
  const { data } = await client.post('/api/sms/getNumber', { service, country });
  return data.activation;
}
