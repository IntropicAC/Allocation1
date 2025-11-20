import React, { useState } from 'react';
import styles from './ContactPage.module.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    category: 'feedback',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In production, you'd send this to your backend/email service
    console.log('Form submitted:', formData);
    
    setSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        organization: '',
        category: 'feedback',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.pageTitle}>Get in Touch</h1>
          <p className={styles.intro}>
            Have feedback, found a bug, or want to suggest a feature? I'd love to hear from you.
          </p>
        </section>

        {/* Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Contact Info */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Why Contact Me?</h2>
            
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>💡</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Feature Suggestions</h3>
                <p className={styles.infoText}>
                  Have an idea that would make allocations easier? Let me know what features 
                  would help your team.
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🐛</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Report Issues</h3>
                <p className={styles.infoText}>
                  Found a bug or something not working as expected? Report it so I can fix it quickly.
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⭐</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>General Feedback</h3>
                <p className={styles.infoText}>
                  Share your experience using the system. Your feedback helps make this tool better 
                  for everyone.
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🏥</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Implementation Inquiries</h3>
                <p className={styles.infoText}>
                  Interested in implementing this at your healthcare facility? Get in touch to discuss 
                  integration and customization.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Send a Message</h2>
            
            {submitted ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Message Sent!</h3>
                <p className={styles.successText}>
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <div className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.input}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="organization">Organization (Optional)</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    className={styles.input}
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Hospital/Ward name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    className={styles.select}
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="implementation">Implementation Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                  />
                </div>

                <button 
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <section className={styles.additionalInfo}>
          <h2 className={styles.sectionTitle}>Response Time</h2>
          <p className={styles.text}>
            I typically respond within 24-48 hours. For urgent issues affecting patient safety, 
            please also contact your ward management immediately.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ContactPage;