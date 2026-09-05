import axios from 'axios';

export const client = axios.create({
  baseURL: 'https://responserift.dev/api',
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeError(error)),
);

function normalizeError(error) {
  const data = error.response?.data;
  const message =
    (data && (data.message || data.error)) || error.message || 'Network request failed';
  const normalized = new Error(message);
  normalized.status = error.response?.status ?? 0;
  return normalized;
}
