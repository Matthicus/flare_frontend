import axios from 'axios';

const api = axios.create({
  baseURL: 'https://flare.ddev.site/api/',
  // no need for credentials yet
});

export default async function testConnection() {
  try {
    const res = await api.get('/ping');
    console.log(res.data); // Should log: { message: 'pong' }
    return res.data;
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
