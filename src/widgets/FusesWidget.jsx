import React, { useState } from 'react';

// Hardcoded initial list of fuses for testing
const INITIAL_FUSES = [
  { id: 'fuse-freestyle', name: 'Freestyle', image: 'src/assets/2XKO_Nuzlocke_FreeStyle.png' },
  { id: 'fuse-2xAssist', name: '2x Assist', image: 'src/assets/2XKO_Nuzlocke_2xAssist.png' },
  { id: 'fuse-sidekick', name: 'Sidekick', image: 'src/assets/2XKO_Nuzlocke_Sidekick.png' },
  { id: 'fuse-double-down', name: 'Double Down', image: 'src/assets/2XKO_Nuzlocke_DoubleDown.png' }
];

const LOCAL_TESTING_MODE = true;

function FusesWidget() {
  // Store fuse counts in a state object. e.g., { 'fuse-freestyle': 3 }
  const [fuseCounts, setFuseCounts] = useState({
    'fuse-freestyle': 0,
    'fuse-2xAssist': 0,
    'fuse-sidekick': 0,
    'fuse-double-down': 0
  });

  // Handle Add (Left Click) or Subtract (Right Click)
  const handleUpdate = (e, id, change) => {
    if (e.type === 'contextmenu') {
        e.preventDefault(); // Prevent standard browser right-click menu
    }

    if (LOCAL_TESTING_MODE) {
        setFuseCounts((prev) => {
            const currentCount = prev[id] || 0;
            // Math.max ensures the fuse count never drops below 0
            return { ...prev, [id]: Math.max(0, currentCount + change) };
      });
    } else {
      // Future AWS HTTP fetch call goes here
      console.log('Sending to AWS:', { action: 'update_fuse', fuse: id, change });
    }
  };

  return (
    <div className="section fuse-section">
      {/* <div className="section-title">Fuses Owned</div> */}
      <div className="row-container">
        {INITIAL_FUSES.map((fuse) => {
          const currentCount = fuseCounts[fuse.id] || 0;

          return (
            <div
              key={fuse.id}
              id={fuse.id}
              className="item-card fuse"
              onClick={(e) => handleUpdate(e, fuse.id, 1)}
              onContextMenu={(e) => handleUpdate(e, fuse.id, -1)}
            >
              <div className="icon-wrapper">
                <img src={fuse.image} alt={fuse.name} />
                <div className="counter-badge">{currentCount}</div>
              </div>
              {/* <div className="name-plate">{fuse.name}</div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FusesWidget;