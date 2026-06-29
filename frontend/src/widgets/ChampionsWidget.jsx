import React, { useState, useEffect } from 'react';

// Hardcoded initial list of 2XKO champions.
const INITIAL_CHAMPIONS = [
  { id: 'Ahri', name: 'Ahri', image: 'src/assets/2XKO_Nuzlocke_Ahri.png' },
  { id: 'Akali', name: 'Akali', image: 'src/assets/2XKO_Nuzlocke_Akali.png' },
  { id: 'Blitzcrank', name: 'Blitzcrank', image: 'src/assets/2XKO_Nuzlocke_Blitzcrank.png' },
  { id: 'Braum', name: 'Braum', image: 'src/assets/2XKO_Nuzlocke_Braum.png' },
  { id: 'Caitlyn', name: 'Caitlyn', image: 'src/assets/2XKO_Nuzlocke_Caitlyn.png' },
  { id: 'Darius', name: 'Darius', image: 'src/assets/2XKO_Nuzlocke_Darius.png' },
  { id: 'Ekko', name: 'Ekko', image: 'src/assets/2XKO_Nuzlocke_Ekko.png' },
  { id: 'Illaoi', name: 'Illaoi', image: 'src/assets/2XKO_Nuzlocke_Illaoi.png' },
  { id: 'Jinx', name: 'Jinx', image: 'src/assets/2XKO_Nuzlocke_Jinx.png' },
  { id: 'Senna', name: 'Senna', image: 'src/assets/2XKO_Nuzlocke_Senna.png' },
  { id: 'Teemo', name: 'Teemo', image: 'src/assets/2XKO_Nuzlocke_Teemo.png' },
  { id: 'Thresh', name: 'Thresh', image: 'src/assets/2XKO_Nuzlocke_Thresh.png' },
  { id: 'Vi', name: 'Vi', image: 'src/assets/2XKO_Nuzlocke_Vi.png' },
  { id: 'Warwick', name: 'Warwick', image: 'src/assets/2XKO_Nuzlocke_Warwick.png' },
  { id: 'Yasuo', name: 'Yasuo', image: 'src/assets/2XKO_Nuzlocke_Yasuo.png' }
];

// 1. Accept the `initialChampions` prop handed down from App.jsx
function ChampionsWidget({ initialChampions }) {
  
  // 2. Look at the AWS data. If a champion is marked as 'dead', add them to our starting array.
  const startingDead = Object.keys(initialChampions || {}).filter(
    (champId) => initialChampions[champId] === 'dead'
  );

  const [deadChampions, setDeadChampions] = useState(startingDead);
  const [menuConfig, setMenuConfig] = useState({ visible: false, x: 0, y: 0 });

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

  // Handle Left Click: Mark champion as dead
  const handleChampionClick = (id) => {
    // Instantly turn them gray on the screen (Optimistic UI update)
    setDeadChampions((prev) => [...prev, id]); 

    // Send the update to the cloud ledger behind the scenes
    updateAWS({ action: 'toggle_champion', champion: id, status: 'dead' });
  };

  // Handle Right Click: Intercept and open custom menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (deadChampions.length === 0) return;

    setMenuConfig({
      visible: true,
      x: e.pageX,
      y: e.pageY
    });
  };

  // Handle Revive selection from custom menu
  const handleRevive = (id) => {
    // Instantly revive them on screen
    setDeadChampions((prev) => prev.filter((champId) => champId !== id));
    
    // Send the revive to the cloud ledger
    updateAWS({ action: 'toggle_champion', champion: id, status: 'alive' });
    
    closeMenu();
  };

  const closeMenu = () => setMenuConfig({ ...menuConfig, visible: false });

  useEffect(() => {
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [menuConfig]);

  return (
    <div className="section champion-section" onContextMenu={handleContextMenu}>
      <div className="section-title">Champions Alive</div>
      <div className="row-container">
        {INITIAL_CHAMPIONS.map((champ) => {
          const isDead = deadChampions.includes(champ.id);

          return (
            <div
              key={champ.id}
              id={champ.id}
              className={`item-card champion ${isDead ? 'dead' : ''}`}
              onClick={() => !isDead && handleChampionClick(champ.id)}
            >
              <div className="icon-wrapper">
                <img src={champ.image} alt={champ.name} />
              </div>
            </div>
          );
        })}
      </div>

      {menuConfig.visible && (
        <div
          className="custom-context-menu"
          style={{ top: `${menuConfig.y}px`, left: `${menuConfig.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="menu-title">Revive Champion</div>
          <ul>
            {deadChampions.map((id) => (
              <li key={id} onClick={() => handleRevive(id)}>
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChampionsWidget;