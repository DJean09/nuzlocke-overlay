import React, { useState, useEffect } from 'react';

// Hardcoded initial list of 2XKO champions for testing
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

// Local testing flag (set to false later when AWS WebSockets are live)
const LOCAL_TESTING_MODE = true;

function ChampionsWidget() {
  // Track which champion IDs are dead
  // deadChampions will be an array of champion IDs that are currently marked as dead
  // setDeadChampions will be used to update this state when champions are marked as dead or revived
  const [deadChampions, setDeadChampions] = useState([]);
  
  // Track custom context menu state
  // menuConfig will hold the visibility and position of the custom context menu
  // setMenuConfig will be used to show/hide the menu and position it based on right-click coordinates
  const [menuConfig, setMenuConfig] = useState({ visible: false, x: 0, y: 0 });

  // Handle Left Click: Mark champion as dead
  const handleChampionClick = (id) => {
    const payload = { action: 'toggle_champion', champion: id, status: 'dead' };
    
    // For local testing, we directly update the state to reflect the champion's death
    if (LOCAL_TESTING_MODE) {
        // prev is the previous state of deadChampions
        // [...prev, id] creates a new array that includes all previously dead champions plus the newly marked dead champion
        setDeadChampions((prev) => [...prev, id]);
    } else {
        // Future AWS HTTP fetch call goes here
        console.log('Sending to AWS:', payload);
    }
  };

  // Handle Right Click: Intercept and open custom menu
  // 'const handleContextMenu = (e) =>' is the same as 'def handleContextMenu(e):' in Python. It's defining a function that will be called when the user right-clicks on the champion section.
  const handleContextMenu = (e) => {
    // preventDefault stops the browser's default context menu from appearing
    e.preventDefault();
    if (deadChampions.length === 0) return;

    // Show custom menu at the cursor's position
    setMenuConfig({
        visible: true,
        x: e.pageX,
        y: e.pageY
    });
  };

  // Handle Revive selection from custom menu
  const handleRevive = (id) => {
    // payload structure for AWS communication when reviving a champion
    const payload = { 
        action: 'toggle_champion', 
        champion: id, 
        status: 'alive' 
    };

    if (LOCAL_TESTING_MODE) {
      setDeadChampions((prev) => prev.filter((champId) => champId !== id));
    } else {
      // Future AWS HTTP fetch call goes here
      console.log('Sending to AWS:', payload);
    }

    // After handling the revive action, we want to close the custom context menu
    closeMenu();
  };

  // Function to close the custom context menu
  // '...menuConfig' is using the spread operator to create a new object that has all 
  // the same properties as 'menuConfig', but we are overriding the 'visible' property 
  // to be false. This effectively hides the menu.
  const closeMenu = () => setMenuConfig({ ...menuConfig, visible: false });

  // Close context menu if clicking anywhere else
  // useEffect is a React hook that allows you to perform side effects in function components.
  // adds an event listener for 'click'
  // Once menuConfig changes, the effect will re-run, ensuring that the event listener is 
  // always up-to-date with the latest menuConfig state.
  useEffect(() => {
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [menuConfig]);

  // Render champion cards and custom context menu
  // return is what the component will render to the DOM. It includes a section for 
  // displaying champion cards and conditionally renders a custom context menu when 
  // menuConfig.visible is true.
  return (
    <div className="section champion-section" onContextMenu={handleContextMenu}>
      <div className="section-title">Champions Alive</div>
      <div className="row-container">
        {/* INITIAL_CHAMPIONS.map handles each champion */}
        {/* champ is the current champion object in the iteration */}
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
              {/* <div className="name-plate">{champ.name}</div> */}
            </div>
          );
        })}
      </div>

      {/* Displays when menuConfig.visible is true */}
      {menuConfig.visible && (
        <div
          className="custom-context-menu"
          style={{ top: `${menuConfig.y}px`, left: `${menuConfig.x}px` }}
          onClick={(e) => e.stopPropagation()} // Prevents instant closing
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