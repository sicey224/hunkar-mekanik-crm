import jwt from 'jsonwebtoken';

const ADMIN_PASSWORD = 'admin';
const SECRET_KEY = 'hunkar_secret_key_123';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, SECRET_KEY, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Hatalı şifre' });
}
