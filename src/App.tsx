import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AllMemories from './pages/AllMemories';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memories" element={<AllMemories />} />
      </Routes>
    </Router>
  );
}

export default App;
// Note: The search block for the Hero Section was not found in this file. It likely belongs to pages/Home.jsx.
