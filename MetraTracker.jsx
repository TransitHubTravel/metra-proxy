import React, { useEffect, useState } from "react";
import metraStations from "../data/metraStations";

const API_URL = "https://proxy.transithub.travel/gtfs/tripUpdates";

const MetraTracker = () => {
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [arrivals, setArrivals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchArrivals = async () => {
    if (!selectedStation) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      const now = Date.now();

      const filtered = data.entity
        .filter((entity) => {
          const updates = entity?.trip_update?.stop_time_update || [];
          return updates.some((s) => s.stop_id === selectedStation);
        })
        .map((entity) => {
          const trip = entity.trip_update;
          const stop = trip.stop_time_update.find((s) => s.stop_id === selectedStation);
          const arrival = stop?.arrival?.time?.low || null;
          return {
            train: trip.trip.trip_id,
            arrivalTime: arrival ? new Date(arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unknown",
            timestamp: arrival
          };
        })
        .filter((t) => t.timestamp && new Date(t.timestamp).getTime() > now)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setArrivals(filtered);
    } catch (err) {
      console.error("Failed to fetch arrivals:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, [selectedStation]);

  const handleLineChange = (e) => {
    setSelectedLine(e.target.value);
    setSelectedStation("");
    setArrivals([]);
  };

  const handleStationChange = (e) => {
    setSelectedStation(e.target.value);
  };

  const lines = Object.keys(metraStations);
  const stations = selectedLine ? metraStations[selectedLine] : [];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🚆 Metra Tracker</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          value={selectedLine}
          onChange={handleLineChange}
          className="border p-2 rounded"
        >
          <option value="">Select Line</option>
          {lines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>

        <select
          value={selectedStation}
          onChange={handleStationChange}
          className="border p-2 rounded"
          disabled={!selectedLine}
        >
          <option value="">Select Station</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading arrivals...</p>}

      {!loading && !error && selectedStation && arrivals.length === 0 && (
        <p className="text-gray-500">No upcoming arrivals found for this station.</p>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {arrivals.length > 0 && (
        <div className="space-y-2">
          {arrivals.map((arrival, idx) => (
            <div
              key={idx}
              className="p-3 border rounded shadow-sm bg-white flex justify-between"
            >
              <span>Train: {arrival.train}</span>
              <span>Arrival: {arrival.arrivalTime}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetraTracker;
