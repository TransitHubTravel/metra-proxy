
import React, { useEffect, useState } from "react";

const MetraTracker = () => {
  const [trainData, setTrainData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routes, setRoutes] = useState([]);

  const fetchTrainData = async () => {
    try {
      const response = await fetch("https://proxy.transithub.travel/gtfs/positions", {
        headers: {
          Authorization: "Basic NjJkZjAyN2EzNmQyZWIxNDc0ZDZmZTUxMjNjODNjNWM6MTE1NTk5MzhmNWQwNTI5NTQyZTBkZWEzNTM1NzQyOWM="
        }
      });
      const data = await response.json();
      setTrainData(data);

      const routeIds = Array.from(
        new Set(
          data.map((item) => item?.vehicle?.trip?.route_id).filter(Boolean)
        )
      );
      setRoutes(routeIds);
    } catch (error) {
      console.error("Error fetching train data:", error);
    }
  };

  useEffect(() => {
    fetchTrainData();
    const interval = setInterval(fetchTrainData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrains = selectedRoute
    ? trainData.filter((item) => item.vehicle?.trip?.route_id === selectedRoute)
    : trainData;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Metra Tracker</h1>
      <div className="mb-4">
        <label htmlFor="route" className="block font-medium mb-1">
          Filter by Route
        </label>
        <select
          id="route"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="">All Routes</option>
          {routes.map((route) => (
            <option key={route} value={route}>
              {route}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {filteredTrains.length > 0 ? (
          filteredTrains.map((train) => (
            <div
              key={train.id}
              className="border border-gray-300 p-4 rounded shadow"
            >
              <div className="font-semibold">Train ID: {train.vehicle?.label}</div>
              <div>Route: {train.vehicle?.trip?.route_id}</div>
              <div>
                Coordinates: {train.vehicle?.position?.latitude.toFixed(5)},
                {train.vehicle?.position?.longitude.toFixed(5)}
              </div>
              <div>Status: {train.vehicle?.current_status}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No trains found for this route.</div>
        )}
      </div>
    </div>
  );
};

export default MetraTracker;
