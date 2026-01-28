import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameSetup from './components/GameSetup/GameSetup';
import Game from './components/Game/Game';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameSetup />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
