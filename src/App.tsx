import React from 'react';
import './App.css';
import {WorldMapConnected} from './components/WorldMap/WorldMap';
import  {TimeSelectorConnected}  from './components/TimeSelector/TimeSelector';

const App: React.FC = () => {
  return (
    <section>
      <WorldMapConnected/>
      <div id="time-selector">
        <TimeSelectorConnected></TimeSelectorConnected>
      </div>
    </section>
  );
}

export default App;
