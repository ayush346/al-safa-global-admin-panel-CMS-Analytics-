import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './DivisionCard.css';

const DivisionCard = ({ title, description, icon, color, link }) => {
  return (
    <motion.div 
      className="division-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="division-icon" style={{ color }}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={link} className="division-link">
        Learn More →
      </Link>
    </motion.div>
  );
};

export default DivisionCard; 