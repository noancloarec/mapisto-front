import React from 'react';
import './App.css';
import { MapistoMap } from './components/map-components/WorldMap/WorldMap';
import { MapistoState } from './interfaces/mapistoState';
import { ViewBoxLike } from '@svgdotjs/svg.js';
const App: React.FC = () => {
  return (
    <div>
      {/* <section id="world-map">
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
      </section> */}
    </div>
  );
};

export default App;
