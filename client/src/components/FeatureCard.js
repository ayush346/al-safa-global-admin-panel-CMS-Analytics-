import React from 'react';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="feature-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="feature-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
};

export default FeatureCard; 