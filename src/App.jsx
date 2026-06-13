import React from 'react';
import ChampionsWidget from './widgets/ChampionsWidget';
import FusesWidget from './widgets/FusesWidget';

function App() {
  // Read "?widget=..." from the browser/OBS URL
  const params = new URLSearchParams(window.location.search);
  const currentWidget = params.get('widget');

  if (currentWidget === 'champions') {
    return <ChampionsWidget />;
  }

  if (currentWidget === 'fuses') {
    return <FusesWidget />;
  }

  // Fallback if no parameter is provided
  return (
    <div style={{ padding: '20px', color: '#ccff00', background: '#1a1a1a' }}>
      <h1>2XKO Stream Backend Live</h1>
      <p>Append <code>?widget=champions</code> or <code>?widget=fuses</code> to the URL in OBS.</p>
    </div>
  );
}

export default App;