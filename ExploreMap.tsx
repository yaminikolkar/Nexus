import React, { useState, useEffect } from "react";
import L from "leaflet";

const fallbackCenters = [
  {
    id: 1,
    name: "Helping Hands Foundation",
    lat: 13.6288,
    lng: 79.4192,
    category: "Food & Shelter"
  },
  {
    id: 2,
    name: "Care for Children NGO",
    lat: 13.6215,
    lng: 79.4230,
    category: "Education"
  },
  {
    id: 3,
    name: "Green Earth Initiative",
    lat: 13.6321,
    lng: 79.4278,
    category: "Environment"
  }
];

const ExploreMap: React.FC = () => {
  const [centers, setCenters] = useState(fallbackCenters);

  useEffect(() => {
    // Simulate AI/location fetch
    const aiCenters: any[] = []; // Replace with real fetch if available

    const centersToShow =
      aiCenters && aiCenters.length > 0 ? aiCenters : fallbackCenters;

    setCenters(centersToShow);
  }, []);

  return (
    <div>
      <h2>Explore Map</h2>
      <ul>
        {centers.map(center => (
          <li key={center.id}>
            {center.name} ({center.category})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExploreMap;
