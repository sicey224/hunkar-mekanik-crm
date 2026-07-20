const APP_KEY = 'xznx1wc3';
const API_BASE = `https://keyvalue.immanuel.co/api/KeyVal`;

async function getLeads() {
  try {
    const res = await fetch(`${API_BASE}/GetValue/${APP_KEY}/leads`);
    const text = await res.json();
    if (!text) return [];
    return JSON.parse(text);
  } catch (err) {
    return [];
  }
}

async function saveLeads(leads) {
  const value = encodeURIComponent(JSON.stringify(leads));
  const res = await fetch(`${API_BASE}/UpdateValue/${APP_KEY}/leads/${value}`, {
    method: 'POST'
  });
  return res.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullName, phone, service, message } = req.body;
  if (!fullName || !phone) {
    return res.status(400).json({ error: 'İsim ve telefon zorunludur.' });
  }

  const leads = await getLeads();
  const newLead = {
    id: Date.now(),
    fullName,
    phone,
    service: service || 'Belirtilmedi',
    message: message || '',
    status: 'Yeni',
    notes: '',
    date: new Date().toISOString()
  };

  leads.push(newLead);
  const success = await saveLeads(leads);

  if (success) {
    return res.status(201).json({ success: true, id: newLead.id });
  } else {
    return res.status(500).json({ error: 'Veri kaydedilemedi.' });
  }
}
