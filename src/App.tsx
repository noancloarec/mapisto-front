import React from 'react';
import './App.css';
import { InteractiveMapConnected } from './components/map-components/InteractiveMap/InteractiveMap';
import { TerritoryPanelConnected } from './components/edition-components/TerritoryPanel/TerritoryPanel';
import { EditionPopupConnected } from './components/edition-components/EditionPopup/EditionPopup';
const App: React.FC = () => {
  return (
    <div>
      <section id="main-map">
        <InteractiveMapConnected></InteractiveMapConnected>
      </section>
      <section id="territory-panel-section">
        <TerritoryPanelConnected />
      </section>
      <section id="editing-panel-section">
        <EditionPopupConnected />
      </section>
      <section>

      </section>
    </div>
  );
};

export default App;
