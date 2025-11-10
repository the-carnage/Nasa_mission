import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Community from './pages/Community';
import Solution from './pages/Solution';
import Formulas from './pages/Formulas';
import Playground from './pages/Playground';
import ExoplanetVisualizer from './pages/exoplanetVisualizer';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
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
            <Route path="/exoplanetVisualizer" element={<ExoplanetVisualizer />} />
          </Routes>
        </motion.main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
