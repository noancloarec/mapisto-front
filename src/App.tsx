import React from 'react';
import './App.css';
import { WorldMapConnected } from './components/WorldMap/WorldMap';
import { TimeSelectorConnected } from './components/TimeSelector/TimeSelector';
import { LoadingIconConnected } from './components/LoadingIcon/LoadingIcon';

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
    </div>
  );
}

export default App;
