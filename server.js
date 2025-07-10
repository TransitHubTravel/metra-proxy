
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS
app.use(cors());

// Metra GTFS API base URL
const METRA_API_BASE = "https://gtfsapi.metrarail.com/gtfs";

// Basic authentication credentials
const METRA_USERNAME = "62df027a36d2eb1474d6fe5123c83c5e";
const METRA_PASSWORD = "11559938f5d0529542e0dea35357429c";

// Proxy endpoint
app.get("/:feed", async (req, res) => {
  const { feed } = req.params;

  // Validate feed
  const allowedFeeds = ["tripUpdates", "alerts", "positions"];
  if (!allowedFeeds.includes(feed)) {
    return res.status(400).json({ error: "Invalid feed requested." });
  }

  try {
    const response = await fetch(`${METRA_API_BASE}/${feed}`, {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${METRA_USERNAME}:${METRA_PASSWORD}`).toString("base64"),
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch data." });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching Metra data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Metra proxy server running on port ${PORT}`);
});
