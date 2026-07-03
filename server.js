const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Path constants
const DB_DIR = path.join(__dirname, 'data');
const PROCUREMENTS_FILE = path.join(DB_DIR, 'procurements.json');
const LAWS_FILE = path.join(DB_DIR, 'laws.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Middlewares
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Helper: read JSON file safely
function readJsonFile(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultVal;
  }
}

// Helper: write JSON file safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// --- REST APIs for Procurements ---

// GET /api/procurements - Get all records
app.get('/api/procurements', (req, res) => {
  const items = readJsonFile(PROCUREMENTS_FILE, []);
  res.json(items);
});

// GET /api/procurements/:id - Get a single record
app.get('/api/procurements/:id', (req, res) => {
  const items = readJsonFile(PROCUREMENTS_FILE, []);
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: '標案不存在' });
  }
  res.json(item);
});

// POST /api/procurements - Create a new record
app.post('/api/procurements', (req, res) => {
  const items = readJsonFile(PROCUREMENTS_FILE, []);
  const newRecord = {
    id: 'prc_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  items.push(newRecord);
  if (writeJsonFile(PROCUREMENTS_FILE, items)) {
    res.status(201).json(newRecord);
  } else {
    res.status(500).json({ error: '儲存失敗' });
  }
});

// PUT /api/procurements/:id - Update an existing record
app.put('/api/procurements/:id', (req, res) => {
  const items = readJsonFile(PROCUREMENTS_FILE, []);
  const index = items.findIndex(i => i.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: '標案不存在' });
  }
  
  const updatedRecord = {
    ...items[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  items[index] = updatedRecord;
  if (writeJsonFile(PROCUREMENTS_FILE, items)) {
    res.json(updatedRecord);
  } else {
    res.status(500).json({ error: '更新失敗' });
  }
});

// DELETE /api/procurements/:id - Delete a record
app.delete('/api/procurements/:id', (req, res) => {
  let items = readJsonFile(PROCUREMENTS_FILE, []);
  const exists = items.some(i => i.id === req.params.id);
  
  if (!exists) {
    return res.status(404).json({ error: '標案不存在' });
  }
  
  items = items.filter(i => i.id !== req.params.id);
  if (writeJsonFile(PROCUREMENTS_FILE, items)) {
    res.json({ message: '刪除成功' });
  } else {
    res.status(500).json({ error: '刪除失敗' });
  }
});


// --- REST APIs for Laws Search ---

// GET /api/laws - Get all laws
app.get('/api/laws', (req, res) => {
  const laws = readJsonFile(LAWS_FILE, []);
  res.json(laws);
});

// GET /api/laws/search - Search laws by keywords
app.get('/api/laws/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const laws = readJsonFile(LAWS_FILE, []);
  
  if (!query) {
    return res.json(laws);
  }
  
  const queryTokens = query.split(/\s+/).filter(t => t.length > 0);
  
  const results = laws.filter(law => {
    // Check if ALL query tokens match somewhere in title, content, or keywords
    return queryTokens.every(token => {
      const matchTitle = (law.title || '').toLowerCase().includes(token);
      const matchContent = (law.content || '').toLowerCase().includes(token);
      const matchKeywords = (law.keywords || []).some(k => k.toLowerCase().includes(token));
      const matchCategory = (law.category || '').toLowerCase().includes(token);
      
      return matchTitle || matchContent || matchKeywords || matchCategory;
    });
  });
  
  res.json(results);
});

// Serve the index.html on root
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log("============================================================");
  console.log(`Smart Procurement Generator server is running!`);
  console.log(`Local Host URL (This PC):  http://localhost:${PORT}`);
  console.log(`Network LAN URL (Others): http://${localIP}:${PORT}`);
  console.log("============================================================");
});
