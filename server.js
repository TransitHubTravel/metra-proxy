// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

const routes = {
  '/positions': 'https://gtfsapi.metrarail.com/gtfs/positions',
  '/tripUpdates': 'https://gtfsapi.metrarail.com/gtfs/tripUpdates',
  '/alerts': 'https://gtfsapi.metrarail.com/gtfs/alerts',
};

Object.entries(routes).forEach(([path, targetUrl]) => {
  app.get(`/api${path}`, async (req, res) => {
    try {
      const response = await axios.get(targetUrl, {
        auth: {
          username: '62df027a36d2eb1474d6fe5123c83c5e',
          password: '11559938f5d0529542e0dea35357429c',
        },
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Metra proxy server running on port ${PORT}`);
});
