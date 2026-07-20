import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import db from './database.js';

const app = express();
const port = 3000;
const SECRET_KEY = 'hunkar_secret_key_123';
const ADMIN_PASSWORD = 'admin'; // Panel şifresi

app.use(cors());
app.use(express.json());

// Yeni İletişim Talebi Oluştur
app.post('/api/contact', (req, res) => {
  const { fullName, phone, service, message } = req.body;
  
  if (!fullName || !phone) {
    return res.status(400).json({ error: 'İsim ve telefon zorunludur.' });
  }

  const date = new Date().toISOString();

  const query = `INSERT INTO leads (fullName, phone, service, message, date) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [fullName, phone, service || 'Belirtilmedi', message || ''], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.status(201).json({ success: true, id: this.lastID });
  });
});

// Admin Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, SECRET_KEY, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  
  res.status(401).json({ error: 'Hatalı şifre' });
});

// Middleware: Token doğrulama
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ error: 'Yetkisiz erişim' });

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Geçersiz oturum' });
    next();
  });
};

// Talepleri Getir (Sadece Admin)
app.get('/api/leads', verifyToken, (req, res) => {
  db.all('SELECT * FROM leads ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json({ leads: rows });
  });
});

// Talebi Güncelle (Sadece Admin - Durum ve Not)
app.put('/api/leads/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Durum bilgisi zorunludur.' });
  }

  const query = `UPDATE leads SET status = ?, notes = ? WHERE id = ?`;
  db.run(query, [status, notes || '', id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Veritabanı güncelleme hatası' });
    }
    res.json({ success: true, updatedID: id, status, notes });
  });
});

// Talebi Sil (Sadece Admin)
app.delete('/api/leads/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM leads WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Silme işlemi başarısız' });
    }
    res.json({ success: true, deletedID: id });
  });
});

app.listen(port, () => {
  console.log(`Hünkar Backend Sunucusu http://localhost:${port} adresinde çalışıyor...`);
});
