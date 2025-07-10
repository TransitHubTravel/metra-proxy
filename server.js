const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;
const METRA_USERNAME = "62df027a36d2eb1474d6fe5123c83c5e";
const METRA_PASSWORD = "11559938f5d0529542e0dea35357429c";

app.get("/api/tripUpdates", async (req, res) => {
  try {
    const response = await axios.get(
      "https://gtfsapi.metrarail.com/gtfs/tripUpdates",
      {
        auth: {
          username: METRA_USERNAME,
          password: METRA_PASSWORD,
        },
        headers: {
          "Accept": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trip updates" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Metra proxy server running on port ${PORT}`);
});
