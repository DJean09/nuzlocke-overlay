// This is the main entry point for the React frontend of the Nuzlocke overlay application. It fetches initial state data from the backend and renders the appropriate widget based on URL parameters.
import React, { useEffect, useState } from 'react';
import ChampionsWidget from './widgets/ChampionsWidget';
import FusesWidget from './widgets/FusesWidget';

function App() {
  // 1. Set up state to hold the data we fetch from AWS
  const [fuses, setFuses] = useState({});
  const [champions, setChampions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 2. Run the fetch BEFORE any return statements
  // This useEffect runs once when the component mounts, fetching the initial state from the backend.
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch("https://6n3vt0wac4.execute-api.us-east-2.amazonaws.com/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action: "get_state" })
        });

        if (!response.ok) throw new Error("Failed to fetch state");

        const data = await response.json();
        
        // Temporary objects to build the state before updating React
        const loadedFuses = {};
        const loadedChampions = {};

        data.forEach(item => {
          if (item.type === "fuse") {
            loadedFuses[item.id] = parseInt(item.count);
          } 
          else if (item.type === "champion") {
            loadedChampions[item.id] = item.status;
          }
        });

        // Save the built objects into React state
        setFuses(loadedFuses);
        setChampions(loadedChampions);

      } catch (error) {
        console.error("Error loading initial overlay state:", error);
      } finally {
        setIsLoading(false); // Tell the app we are done loading
      }
    };

    fetchInitialState();
  }, []);

  // 3. Determine which widget to show
  const params = new URLSearchParams(window.location.search);
  const currentWidget = params.get('widget');

  // Prevent rendering the widgets until the AWS data has finished downloading
  if (isLoading) {
    return <div>Loading Stream Data...</div>; 
  }

  // 4. Pass the fetched state down to the widgets as props
  if (currentWidget === 'champions') {
    return <ChampionsWidget initialChampions={champions} />;
  }

  if (currentWidget === 'fuses') {
    return <FusesWidget initialFuses={fuses} />;
  }

  // 5. Default view if no widget is specified
  return (
    <div style={{ padding: '20px', color: '#ccff00', background: '#1a1a1a' }}>
      <h1>2XKO Stream Backend Live</h1>
      <p>Append <code>?widget=champions</code> or <code>?widget=fuses</code> to the URL in OBS.</p>
    </div>
  );
}

export default App;