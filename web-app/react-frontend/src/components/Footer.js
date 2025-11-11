import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Brain,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'API Documentation', href: '/docs' },
      { name: 'ExpoAI', href: '/playground' },
      { name: 'Pricing', href: '/pricing' },
    ],
    community: [
      { name: 'Discord', href: 'https://discord.gg/exoplanet-llm', external: true },
      { name: 'GitHub', href: 'https://github.com/your-username/exoplanet-llm', external: true },
      { name: 'Blog', href: '/blog' },
      { name: 'Newsletter', href: '/newsletter' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Research Papers', href: '/research' },
      { name: 'Support', href: '/support' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'License', href: '/license' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/your-username/exoplanet-llm' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/exoplanet_llm' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/exoplanet-llm' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@exoplanet-llm.com' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main footer content */}
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <Star className="star-icon" />
                <Brain className="brain-icon" />
              </div>
              <span className="logo-text">
                <span className="logo-main">ExoPlanet</span>
                <span className="logo-sub">AI</span>
              </span>
            </Link>
            <p className="footer-description">
              Advanced AI system developed for astronomical discovery and exoplanet research. 
              Supporting NASA, ESA, and international space agencies with cutting-edge 
              machine learning for planetary science and astrophysics.
            </p>
            <div className="footer-badges" style={{marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
              <span style={{fontSize: '0.75rem', padding: '4px 12px', background: 'rgba(11, 61, 145, 0.2)', border: '1px solid rgba(11, 61, 145, 0.4)', borderRadius: '20px', color: '#66FCF1', fontWeight: '600'}}>NASA COLLABORATION</span>
              <span style={{fontSize: '0.75rem', padding: '4px 12px', background: 'rgba(11, 61, 145, 0.2)', border: '1px solid rgba(11, 61, 145, 0.4)', borderRadius: '20px', color: '#66FCF1', fontWeight: '600'}}>ESA PARTNER</span>
            </div>
            <div className="footer-social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-links">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer-column">
                <h3 className="footer-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <ul className="footer-list">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-link"
                        >
                          {link.name}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <Link to={link.href} className="footer-link">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest updates on exoplanet discoveries and AI advancements
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Exoplanet AI Research Initiative. In collaboration with NASA, ESA, and international space agencies.<br/>
              <span style={{fontSize: '0.75rem', marginTop: '0.5rem', display: 'block', opacity: '0.7'}}>Educational and research purposes. Not for commercial spacecraft navigation.</span>
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">
                Privacy
              </Link>
              <Link to="/terms" className="footer-bottom-link">
                Terms
              </Link>
              <Link to="/cookies" className="footer-bottom-link">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="footer-bg">
        <div className="footer-star star-1"></div>
        <div className="footer-star star-2"></div>
        <div className="footer-star star-3"></div>
        <div className="footer-star star-4"></div>
        <div className="footer-star star-5"></div>
      </div>
    </footer>
  );
};

export default Footer;
