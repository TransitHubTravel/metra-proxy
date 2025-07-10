
import React, { useEffect, useState } from "react";
import "./MetraTracker.css";

const MetraTracker = () => {
  const [tripUpdates, setTripUpdates] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTripUpdates = async () => {
    try {
      const res = await fetch("https://proxy.transithub.travel/gtfs/tripUpdates");
      const data = await res.json();
      setTripUpdates(data.entity || []);

      // Extract unique route_ids
      const uniqueRoutes = [
        ...new Set(data.entity.map((e) => e.tripUpdate?.trip?.routeId).filter(Boolean)),
      ];
      setRoutes(uniqueRoutes);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch trip updates:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripUpdates();
    const interval = setInterval(fetchTripUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrips = selectedRoute
    ? tripUpdates.filter((e) => e.tripUpdate?.trip?.routeId === selectedRoute)
    : tripUpdates;

  return (
    <div className="metra-tracker">
      <h1>Metra Tracker</h1>
      <div className="controls">
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          <option value="">All Routes</option>
          {routes.map((routeId) => (
            <option key={routeId} value={routeId}>
              {routeId}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading trip updates…</p>
      ) : filteredTrips.length === 0 ? (
        <p>No trains found for this route.</p>
      ) : (
        <ul className="trip-list">
          {filteredTrips.map((entity) => {
            const trip = entity.tripUpdate?.trip;
            const stopTime = entity.tripUpdate?.stopTimeUpdate?.[0];

            return (
              <li key={entity.id} className="trip-card">
                <strong>Train ID:</strong> {trip?.tripId} <br />
                <strong>Route:</strong> {trip?.routeId} <br />
                <strong>Direction:</strong> {trip?.directionId} <br />
                <strong>Next Stop:</strong> {stopTime?.stopId} <br />
                <strong>Arrival Time:</strong>{" "}
                {stopTime?.arrival?.time
                  ? new Date(stopTime.arrival.time * 1000).toLocaleTimeString()
                  : "N/A"}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MetraTracker;
