import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Star, Brain, Users, Calculator, Play } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Star },
        { name: 'Playground', path: '/playground', icon: Play },
            { name: 'Formulas', path: '/formulas', icon: Calculator },

    { name: 'Solution', path: '/solution', icon: Brain },

      { name: 'Community', path: '/community', icon: Users },
    {name : "exoplanetVisualizer" , path : "/exoplanetVisualizer" , icon : Calculator}]

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Star className="star-icon" />
            <Brain className="brain-icon" />
          </div>
          <span className="logo-text">
            <span className="logo-main">Exoplanet</span>
            <span className="logo-sub">LLM</span>
          </span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`navbar-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="navbar-actions">
          <a
            href="https://github.com/ManmathX/Nasa_mission"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            View on GitHub
          </a>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
