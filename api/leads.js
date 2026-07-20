import jwt from 'jsonwebtoken';

const APP_KEY = 'xznx1wc3';
const API_BASE = `https://keyvalue.immanuel.co/api/KeyVal`;
const SECRET_KEY = 'hunkar_secret_key_123';

async function getLeads() {
  try {
    const res = await fetch(`${API_BASE}/GetValue/${APP_KEY}/leads`);
    const text = await res.json();
    if (!text) return [];
    try {
      const decoded = Buffer.from(text, 'base64url').toString('utf8');
      return JSON.parse(decoded);
    } catch(e) {
      return JSON.parse(text);
    }
  } catch (err) {
    return [];
  }
}

async function saveLeads(leads) {
  const value = Buffer.from(JSON.stringify(leads)).toString('base64url');
  const res = await fetch(`${API_BASE}/UpdateValue/${APP_KEY}/leads/${value}`, {
    method: 'POST'
  });
  return res.ok;
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    return true;
  } catch (err) {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify auth
  if (!verifyToken(req)) {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  if (req.method === 'GET') {
    const leads = await getLeads();
    leads.sort((a, b) => b.id - a.id);
    return res.json({ leads });
  }

  if (req.method === 'PUT') {
    let id = req.query.id;
    if (!id && req.body) id = req.body.id;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Durum bilgisi zorunludur.' });
    }

    let leads = await getLeads();
    let updated = false;

    leads = leads.map(lead => {
      if (String(lead.id) === String(id)) {
        updated = true;
        return {
          ...lead,
          status,
          notes: notes || '',
          updatedDate: new Date().toISOString()
        };
      }
      return lead;
    });

    if (!updated) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    const success = await saveLeads(leads);
    if (success) {
      return res.json({ success: true, updatedID: id, status, notes });
    } else {
      return res.status(500).json({ error: 'Güncelleme kaydedilemedi.' });
    }
  }

  if (req.method === 'DELETE') {
    let id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    let leads = await getLeads();
    const originalLength = leads.length;
    leads = leads.filter(lead => String(lead.id) !== String(id));

    if (leads.length === originalLength) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    const success = await saveLeads(leads);
    if (success) {
      return res.json({ success: true, deletedID: id });
    } else {
      return res.status(500).json({ error: 'Silme işlemi kaydedilemedi.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
