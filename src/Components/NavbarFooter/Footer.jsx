import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { FaUtensils, FaInstagram, FaTwitter, FaFacebook, FaPinterest, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';

const Footer = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const footerRef = useRef(null);

  useEffect(() => {
    const createParallaxEffect = () => {
      const handleMouseMove = (e) => {
        if (!footerRef.current) return;
        
        const footer = footerRef.current;
        const shapes = footer.querySelectorAll('.prg-footer-shape');
        
        shapes.forEach(shape => {
          const speed = shape.getAttribute('data-speed');
          const x = (window.innerWidth - e.pageX * speed) / 100;
          const y = (window.innerHeight - e.pageY * speed) / 100;
          
          shape.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
      };

      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    };
    
    createParallaxEffect();
  }, []);

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <footer 
      ref={footerRef}
      className={`prg-footer ${isDarkMode ? 'prg-footer-dark' : 'prg-footer-light'}`}
    >
      {/* 3D Floating Shapes */}
      <div className="prg-footer-shapes">
        <div className="prg-footer-shape prg-footer-shape-1" data-speed="2"></div>
        <div className="prg-footer-shape prg-footer-shape-2" data-speed="5"></div>
        <div className="prg-footer-shape prg-footer-shape-3" data-speed="3"></div>
        <div className="prg-footer-shape prg-footer-shape-4" data-speed="4"></div>
      </div>

      <div className="prg-footer-content-wrapper">
        <motion.div 
          className="prg-footer-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={footerVariants}
        >
          <motion.div className="prg-footer-brand" variants={itemVariants}>
            <div className="prg-footer-logo">
              <FaUtensils className="prg-footer-logo-icon" />
              <h2 className="prg-footer-logo-text">RecipeGen</h2>
            </div>
            <p className="prg-footer-tagline">
              Personalized recipes based on what's in your fridge. 
              AI-powered cooking solutions tailored just for you.
            </p>
            <div className="prg-footer-social">
              <a href="#" className="prg-footer-social-link">
                <FaInstagram />
              </a>
              <a href="#" className="prg-footer-social-link">
                <FaTwitter />
              </a>
              <a href="#" className="prg-footer-social-link">
                <FaFacebook />
              </a>
              <a href="#" className="prg-footer-social-link">
                <FaPinterest />
              </a>
              <a href="#" className="prg-footer-social-link">
                <FaYoutube />
              </a>
            </div>
          </motion.div>

          <div className="prg-footer-links-container">
            <motion.div className="prg-footer-links" variants={itemVariants}>
              <h3 className="prg-footer-heading">Features</h3>
              <ul className="prg-footer-list">
                <li><a href="#">Inventory Scanner</a></li>
                <li><a href="#">Meal Planning</a></li>
                <li><a href="#">Shopping Lists</a></li>
                <li><a href="#">Nutrition Analysis</a></li>
                <li><a href="#">Recipe Saving</a></li>
              </ul>
            </motion.div>

            <motion.div className="prg-footer-links" variants={itemVariants}>
              <h3 className="prg-footer-heading">Company</h3>
              <ul className="prg-footer-list">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Partners</a></li>
              </ul>
            </motion.div>

            {/* <motion.div className="prg-footer-links" variants={itemVariants}>
              <h3 className="prg-footer-heading">Resources</h3>
              <ul className="prg-footer-list">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Cooking Guides</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Recipe Index</a></li>
                <li><a href="#">Ingredient Database</a></li>
              </ul>
            </motion.div> */}
          </div>

          <motion.div className="prg-footer-newsletter" variants={itemVariants}>
            <h3 className="prg-footer-heading">Stay Updated</h3>
            <p>Subscribe to get recipes and cooking tips delivered to your inbox.</p>
            <form className="prg-footer-form">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="prg-footer-input"
                aria-label="Email subscription"
              />
              <button type="submit" className="prg-footer-button">
                Subscribe
              </button>
            </form>
            <div className="prg-footer-contact">
              <div className="prg-footer-contact-item">
                <MdEmail />
                <span>support@recipegen.com</span>
              </div>
              <div className="prg-footer-contact-item">
                <MdPhone />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="prg-footer-bottom">
        <div className="prg-footer-bottom-content">
          <p className="prg-footer-copyright">
            &copy; {new Date().getFullYear()} RecipeGen. All rights reserved.
          </p>
          <div className="prg-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;