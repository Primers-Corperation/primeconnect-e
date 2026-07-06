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

// Real, priced catalog of supported services for a country (default Nigeria).
export async function getCatalog({ country, minPrice, maxPrice, search } = {}) {
  const { data } = await client.get('/api/sms/catalog', { params: { country, minPrice, maxPrice, search } });
  return data.items || [];
}

// Curated list of countries for the picker.
export async function getSupportedCountries() {
  const { data } = await client.get('/api/sms/supported-countries');
  return data.countries || [];
}

// Check (and persist) an activation's real status/OTP code.
export async function getActivationStatus(id) {
  const { data } = await client.get(`/api/sms/activations/${id}/status`);
  return data.activation;
}

// Cancel a pending rental within the 15-minute window; refunds the wallet.
export async function cancelActivation(id) {
  const { data } = await client.post(`/api/sms/activations/${id}/cancel`);
  return data;
}
