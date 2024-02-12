// App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import HomePage from "./HomePage";
import GamePage from "./GamePage"; // Import the GamePage component
import app from "./firebase"; // Assuming your firebase.js exports the initialized app

function App() {
  return (
    <Router basename="/nimgame">
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/game/:gameId" element={<GamePage />} /> {/* New route for GamePage */}
      </Routes>
    </Router>
  );
}

export default App;
