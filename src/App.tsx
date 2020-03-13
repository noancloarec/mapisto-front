import React from 'react';
import './App.css';
import { WorldMapConnected } from './components/WorldMap/WorldMap';
import { TimeSelectorConnected } from './components/TimeSelector/TimeSelector';
import { LoadingIconConnected } from './components/LoadingIcon/LoadingIcon';
import { TerritoryPanelConnected } from './components/TerritoryPanel/TerritoryPanel';
import { EditingPanelConnected } from './components/EditingPanel/EditingPanel';

const App: React.FC = () => {
  return (
    <div>

      <section id="world-map">
        <WorldMapConnected />
      </section>
      <section id="time-selector-row">
        <div id="time-selector">
          <TimeSelectorConnected></TimeSelectorConnected>
        </div>
      </section>
      <section id="loading-section">
        <LoadingIconConnected></LoadingIconConnected>
      </section>
      <section id="territory-panel-section">
        <TerritoryPanelConnected></TerritoryPanelConnected>
      </section>
      <section id="editing-panel-section">
        <EditingPanelConnected></EditingPanelConnected>
      </section>
    </div>
  );
}

export default App;
