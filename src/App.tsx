import React from 'react';
import './App.css';
import { WorldMapConnected } from './components/WorldMap/WorldMap';
import { TimeSelectorConnected } from './components/TimeSelector/TimeSelector';

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
    </div>
  );
}

export default App;
