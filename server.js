const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// Credentials and base URLs
const METRA_USERNAME = "62df027a36d2eb1474d6fe5123c83c5e";
const METRA_PASSWORD = "11559938f5d0529542e0dea35357429c";
const JSON_FEEDS_BASE = "https://gtfsapi.metrarail.com/gtfs";
const RAW_FEEDS_BASE = "https://gtfsapi.metrarail.com/gtfs/raw";

// Allowed JSON and raw feeds
const jsonFeeds = ["alerts", "tripUpdates", "positions"];
const rawFeeds = ["alerts.dat", "tripUpdates.dat", "positionUpdates.dat", "schedule.zip", "published.txt"];

// JSON feed proxy
app.get("/gtfs/:feed", async (req, res) => {
  const { feed } = req.params;

  if (!jsonFeeds.includes(feed)) {
    return res.status(400).json({ error: "Invalid JSON feed requested." });
  }

  try {
    const response = await fetch(`${JSON_FEEDS_BASE}/${feed}`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${METRA_USERNAME}:${METRA_PASSWORD}`).toString("base64"),
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch JSON feed." });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching JSON feed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// RAW feed proxy
app.get("/gtfs/raw/:file", async (req, res) => {
  const { file } = req.params;

  if (!rawFeeds.includes(file)) {
    return res.status(400).json({ error: "Invalid raw feed file requested." });
  }

  try {
    const response = await fetch(`${RAW_FEEDS_BASE}/${file}`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${METRA_USERNAME}:${METRA_PASSWORD}`).toString("base64"),
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch raw file." });
    }

    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);
    response.body.pipe(res);
  } catch (err) {
    console.error("Error fetching raw feed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Metra proxy server running on port ${PORT}`);
});
