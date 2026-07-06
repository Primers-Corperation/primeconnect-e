import client from './client.js';

export async function reportIssue({ subject, message }) {
  const { data } = await client.post('/api/support/report', { subject, message });
  return data.message;
}
