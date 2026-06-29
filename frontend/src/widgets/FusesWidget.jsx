import React, { useState } from 'react';

// Hardcoded initial list of fuses for the overlay.
const INITIAL_FUSES = [
  { id: 'fuse-freestyle', name: 'Freestyle', image: 'src/assets/2XKO_Nuzlocke_FreeStyle.png' },
  { id: 'fuse-2xAssist', name: '2x Assist', image: 'src/assets/2XKO_Nuzlocke_2xAssist.png' },
  { id: 'fuse-sidekick', name: 'Sidekick', image: 'src/assets/2XKO_Nuzlocke_Sidekick.png' },
  { id: 'fuse-double-down', name: 'Double Down', image: 'src/assets/2XKO_Nuzlocke_DoubleDown.png' }
];

// 1. Accept the `initialFuses` prop handed down from App.jsx
function FusesWidget({ initialFuses }) {
  
  // 2. Merge our base 0 values with whatever AWS sent us
  const defaultCounts = {
    'fuse-freestyle': 0,
    'fuse-2xAssist': 0,
    'fuse-sidekick': 0,
    'fuse-double-down': 0
  };
  const [fuseCounts, setFuseCounts] = useState({ ...defaultCounts, ...initialFuses });

  // Helper function to send clicks straight to AWS
  const updateAWS = async (payload) => {
    try {
      await fetch("https://6n3vt0wac4.execute-api.us-east-2.amazonaws.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Failed to update AWS:", error);
    }
  };

  // Handle Add (Left Click) or Subtract (Right Click)
  const handleUpdate = (e, id, changeDelta) => {
    if (e.type === 'contextmenu') {
      e.preventDefault();
    }

    // Calculate the new total locally first
    const currentCount = fuseCounts[id] || 0;
    const newCount = Math.max(0, currentCount + changeDelta);

    // Instantly update the screen (Optimistic UI)
    setFuseCounts((prev) => ({ ...prev, [id]: newCount }));

    // Send the absolute new total to AWS
    // Because our Java PutItem code overrides the row, we must send the new final number
    updateAWS({ action: 'update_fuse', fuse: id, change: newCount.toString() });
  };

  return (
    <div className="section fuse-section">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FusesWidget;