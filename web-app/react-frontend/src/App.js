import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Community from './pages/Community';
import Solution from './pages/Solution';
import Formulas from './pages/Formulas';
import Playground from './pages/Playground';
import Visualizer from './pages/Visualizer';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="App">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/solution" element={<Solution />} />
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/visualizer" element={<Visualizer />} />
        </Routes>
      </motion.main>
      {isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
