import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  BookOpen, 
  Play,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Globe,
  Search
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    accuracy: 0,
    reasoning: 0,
    discoveries: 0,
    users: 0
  });
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      setStats({
        accuracy: 95,
        reasoning: 87,
        discoveries: 5420,
        users: 1250
      });
    };

    const timer = setTimeout(animateStats, 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Zap,
      title: '⚡ Novel Feedback-Based Knowledge Weight',
      description: 'Revolutionary AI reliability system using wᵢ ← wᵢ - η∂L/∂wᵢ formula. Dynamic weight adjustment based on human feedback makes planet hunting faster and more reliable.',
      color: 'purple'
    },
    {
      icon: Brain,
      title: 'Advanced Reasoning',
      description: 'Enhanced scientific reasoning capabilities using GRPO training for complex astronomical analysis.',
      color: 'blue'
    },
    {
      icon: Target,
      title: 'Exoplanet Specialized',
      description: 'Fine-tuned specifically for exoplanet discovery, classification, and scientific analysis.',
      color: 'green'
    },
    {
      icon: BookOpen,
      title: 'Scientific Accuracy',
      description: 'Trained on verified exoplanet data and peer-reviewed research papers.',
      color: 'orange'
    }
  ];

  const capabilities = [
    'Exoplanet Detection Methods Analysis',
    'Habitable Zone Calculations',
    'Atmospheric Composition Studies',
    'Orbital Mechanics Explanations',
    'Scientific Paper Summarization',
    'Research Question Answering'
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Astrophysicist, MIT',
      content: 'This AI has revolutionized how we approach exoplanet research. The reasoning capabilities are remarkable.',
      avatar: 'SC'
    },
    {
      name: 'Prof. Michael Rodriguez',
      role: 'Planetary Scientist, NASA',
      content: 'The specialized knowledge in exoplanet detection methods is incredibly accurate and helpful.',
      avatar: 'MR'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Research Fellow, ESA',
      content: 'A game-changer for students and researchers. The scientific accuracy is outstanding.',
      avatar: 'EW'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          {/* Space Video/GIF Background */}
          <div className="space-background">
            <video
              className="space-video"
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
            >
              {/* You can replace this with your own space stars video URL or local file */}
              {/* Example: <source src="/videos/space-stars-background.mp4" type="video/mp4" /> */}
              {/* Using the original space stars video */}
              <source src="https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_25fps.mp4" type="video/mp4" />
              {/* Fallback message if video doesn't load */}
              Your browser does not support the video tag.
            </video>
            {/* Fallback GIF/Image background (shown if video fails) */}
            {videoError && (
              <div className="space-gif-fallback">
                <img 
                  src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop" 
                  alt="Space stars background"
                  className="space-gif"
                />
              </div>
            )}
            {/* Overlay for better text readability */}
            <div className="space-overlay"></div>
          </div>
          <div className="starfield">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              <Star size={16} />
              <span>Powered by Advanced AI</span>
            </div>
            
            <h1 className="hero-title">
              Discover the Universe with
              <span className="gradient-text"> Exoplanet AI</span>
            </h1>
            
            <p className="hero-description">
              Advanced AI specialized in exoplanet discovery, analysis, and scientific reasoning. 
              Empowering researchers, students, and space enthusiasts with cutting-edge language models 
              trained on astronomical data and peer-reviewed research.
            </p>
            
            <div className="hero-actions">
              <motion.a
                href="/playground"
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                Try ExpoAI
                <ArrowRight size={16} />
              </motion.a>
              
              <motion.a
                href="/solution"
                className="btn btn-secondary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">{stats.accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.reasoning}%</div>
                <div className="stat-label">Reasoning</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.discoveries.toLocaleString()}</div>
                <div className="stat-label">Discoveries</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.users.toLocaleString()}</div>
                <div className="stat-label">Users</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Why Choose <span className="gradient-text">Exoplanet AI</span>?
            </h2>
            <p className="section-description">
              Our AI model combines cutting-edge technology with specialized astronomical knowledge 
              to deliver unparalleled insights into exoplanet research.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className={`feature-card ${feature.color}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="capabilities section">
        <div className="container">
          <div className="capabilities-content">
            <motion.div
              className="capabilities-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                Advanced <span className="gradient-text">Capabilities</span>
              </h2>
              <p className="section-description">
                Our specialized AI model excels in various aspects of exoplanet research 
                and astronomical analysis.
              </p>
              
              <div className="capabilities-list">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={capability}
                    className="capability-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle size={20} className="capability-icon" />
                    <span>{capability}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.a
                href="/playground"
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Capabilities
                <ArrowRight size={16} />
              </motion.a>
            </motion.div>

            <motion.div
              className="capabilities-visual"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="visual-card">
                <div className="visual-header">
                  <div className="visual-dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                  </div>
                  <span>Exoplanet Analysis Dashboard</span>
                </div>
                <div className="visual-content">
                  <div className="analysis-item">
                    <Search size={24} />
                    <div>
                      <div className="analysis-title">Transit Method</div>
                      <div className="analysis-desc">Detecting planetary transits</div>
                    </div>
                  </div>
                  <div className="analysis-item">
                    <Globe size={24} />
                    <div>
                      <div className="analysis-title">Habitable Zone</div>
                      <div className="analysis-desc">Calculating optimal distance</div>
                    </div>
                  </div>
                  <div className="analysis-item">
                    <TrendingUp size={24} />
                    <div>
                      <div className="analysis-title">Atmospheric Analysis</div>
                      <div className="analysis-desc">Composition detection</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Trusted by <span className="gradient-text">Researchers</span>
            </h2>
            <p className="section-description">
              See what leading scientists and researchers say about Exoplanet AI.
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Ready to Explore the <span className="gradient-text">Universe</span>?
            </h2>
            <p className="cta-description">
              Join thousands of researchers, students, and space enthusiasts 
              using Exoplanet AI to advance astronomical knowledge.
            </p>
            <div className="cta-actions">
              <motion.a
                href="/playground"
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                Start Exploring
              </motion.a>
              <motion.a
                href="/community"
                className="btn btn-outline btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users size={20} />
                Join Community
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
