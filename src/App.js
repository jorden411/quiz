import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './home/home';
import Quiz from './quiz/quiz';
import Leaderboard from './leaderboard/leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
