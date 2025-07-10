const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const USER = process.env.METRA_USER;
const PASS = process.env.METRA_PASS;
const BASE = "https://gtfsapi.metrarail.com/gtfs";

app.use(cors());

["/positions", "/tripUpdates", "/alerts"].forEach(path => {
  app.get(`/api${path}`, async (req, res) => {
    try {
      const response = await fetch(BASE + path, {
        headers: {
          Authorization: "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64")
        }
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        res.json(json);
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Proxy error" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Metra GTFS proxy running on port ${PORT}`);
});