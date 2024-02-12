import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import HomePage from "./HomePage";
import GamePage from "./GamePage"; // Import the GamePage component

// Component to display information on the base domain
function BaseInfo() {
  return (
    <div>
      <h1>Nim Game Base URL</h1>
      <p>This is the base URL for the Nim Game application.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BaseInfo />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/game/:gameId" element={<GamePage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
