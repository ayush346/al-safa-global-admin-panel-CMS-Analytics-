import React from 'react';
import { motion } from 'framer-motion';
import './TestimonialSection.css';

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Ahmed Al Mansouri",
      position: "Project Manager",
      company: "Dubai Construction Co.",
      text: "Al Safa Global has been our trusted partner for over 5 years. Their quality and reliability are unmatched."
    },
    {
      name: "Sarah Johnson",
      position: "Procurement Director",
      company: "Marine Solutions Ltd.",
      text: "Excellent service and competitive pricing. They always deliver on time and exceed our expectations."
    },
    {
      name: "Mohammed Hassan",
      position: "Operations Manager",
      company: "Industrial Systems UAE",
      text: "The team at Al Safa Global understands our industry needs perfectly. Highly recommended!"
    }
  ];

  return (
    <section className="testimonial-section">
      <div className="container">
        <motion.div 
          className="section-header text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>What Our Clients Say</h2>
          <p className="section-subtitle">
            Trusted by businesses across multiple industries
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
            >
              <p className="testimonial-text" lang="en">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <h4>{testimonial.name}</h4>
                <p>{testimonial.position}, {testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 