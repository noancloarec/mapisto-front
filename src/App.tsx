import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import { VideoPlayer } from './components/video-components/video-player/VideoPlayer';
import { HomePage } from './components/pages/HomePage/HomePage';
import { EditTerritoryPage } from './components/pages/EditTerritoryPage/EditTerritoryPage';
import { EditStatePage } from './components/pages/EditStatePage/EditStatePage';
import { Scene } from './entities/Scene';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path='/edit_territory/:territory_id'>
          <EditTerritoryPage />
        </Route>
        <Route path='/edit_state/:state_id'>
          <EditStatePage />
        </Route>
        <Route path="/movie/:state_id">
          <VideoPage />
        </Route>
      </Switch>
    </Router >
  );
};

const VideoPage: React.FC = () => {
  const { state_id } = useParams<{ state_id: string }>();
  const setPageTitle = (scenery: Scene[]) => {
    // Settings the document title with the last name of the state
    const state = scenery[0].territories.find(t => t.mpState.stateId === +state_id).mpState;
    const title = state.representations[state.representations.length - 1].name;
    document.title = `${title} - Every year`;
  };
  return (
    <VideoPlayer stateId={parseInt(state_id, 10)}
      onSceneryLoaded={setPageTitle}
    />
  );
};

export default App;
