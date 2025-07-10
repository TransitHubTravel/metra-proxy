// MetraTracker.jsx
import React, { useEffect, useState } from "react";
import stations from "./metraStations";
import Select from "react-select";

const API_BASE = "https://proxy.transithub.travel/gtfs";

const MetraTracker = () => {
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArrivals = async () => {
    if (!selectedLine || !selectedStation) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/tripUpdates`);
      const data = await res.json();
      const currentTime = Date.now();

      const filtered = data.entity.filter((entity) => {
        const stops = entity?.trip_update?.stop_time_update || [];
        return stops.some(
          (stop) =>
            stop.stop_id === selectedStation.value &&
            new Date(stop.arrival?.time?.low || 0).getTime() > currentTime
        );
      });

      const formatted = filtered.map((entity) => {
        const trip = entity.trip_update.trip;
        const stop = entity.trip_update.stop_time_update.find(
          (s) => s.stop_id === selectedStation.value
        );
        return {
          tripId: trip.trip_id,
          routeId: trip.route_id,
          arrival: stop.arrival?.time?.low,
          delay: stop.arrival?.delay || 0,
        };
      });

      setArrivals(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load arrival data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, [selectedLine, selectedStation]);

  const lineOptions = Array.from(
    new Set(stations.map((s) => s.line))
  ).map((line) => ({ value: line, label: line }));

  const stationOptions = stations
    .filter((s) => s.line === selectedLine?.value)
    .map((s) => ({ value: s.stop_id, label: s.name }));

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Metra Tracker</h1>
      <Select
        placeholder="Select Line"
        options={lineOptions}
        value={selectedLine}
        onChange={(opt) => {
          setSelectedLine(opt);
          setSelectedStation(null);
          setArrivals([]);
        }}
        className="mb-2"
      />
      <Select
        placeholder="Select Station"
        options={stationOptions}
        value={selectedStation}
        onChange={setSelectedStation}
        isDisabled={!selectedLine}
        className="mb-4"
      />

      {loading && <p>Loading arrivals...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && arrivals.length === 0 && (
        <p>No upcoming arrivals found for this station.</p>
      )}

      {arrivals.length > 0 && (
        <ul className="space-y-2">
          {arrivals.map((a, i) => (
            <li key={i} className="p-3 rounded border">
              <p>
                <strong>Trip:</strong> {a.tripId} ({a.routeId})
              </p>
              <p>
                <strong>Arrival:</strong>{" "}
                {new Date(a.arrival).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {a.delay !== 0 && (
                <p>
                  <strong>Delay:</strong> {Math.round(a.delay / 60)} min
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MetraTracker;
