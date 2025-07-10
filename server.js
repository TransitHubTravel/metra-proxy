// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

const METRA_AUTH = {
  username: '62df027a36d2eb1474d6fe5123c83c5e',
  password: '11559938f5d0529542e0dea35357429c'
};

// Proxy: tripUpdates
app.get('/gtfs/tripUpdates', async (req, res) => {
  try {
    const response = await axios.get('https://gtfsapi.metrarail.com/gtfs/tripUpdates', { auth: METRA_AUTH });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tripUpdates' });
  }
});

// Proxy: positions
app.get('/gtfs/positions', async (req, res) => {
  try {
    const response = await axios.get('https://gtfsapi.metrarail.com/gtfs/positions', { auth: METRA_AUTH });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// Proxy: alerts
app.get('/gtfs/alerts', async (req, res) => {
  try {
    const response = await axios.get('https://gtfsapi.metrarail.com/gtfs/alerts', { auth: METRA_AUTH });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Metra GTFS proxy running on port ${PORT}`);
});
