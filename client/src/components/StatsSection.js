import React from 'react';
import { motion } from 'framer-motion';
import './StatsSection.css';
import { useContent } from '../context/ContentContext';

const StatsSection = ({ stats }) => {
  const { home = {} } = useContent();
  const liveStats = Array.isArray(home.stats) && home.stats.length > 0 ? home.stats : stats;
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid" data-cms-list="home.stats">
          {liveStats.map((stat, index) => (
            <motion.div
              key={`stat-${index}`}
              className="stat-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <span data-cms-field="number" style={{ display: 'none' }}>{stat.number}</span>
              <span data-cms-field="label" style={{ display: 'none' }}>{stat.label}</span>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection; 