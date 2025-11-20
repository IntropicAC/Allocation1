import React from 'react';
import styles from './AboutPage.module.css';

function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.pageTitle}>About This System</h1>
            <p className={styles.heroSubtitle}>
              Built from real-world experience on the frontlines of healthcare staffing
            </p>
          </div>
        </section>

        {/* Problem & Solution Side by Side */}
        <div className={styles.problemSolutionGrid}>
          <section className={styles.problemCard}>
            <div className={styles.cardIcon}>⚠️</div>
            <h2 className={styles.cardTitle}>The Problem</h2>
            <div className={styles.problemList}>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>45-60 minutes per shift spent on manual allocation</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Staff put on the same observations repeatedly</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Breaks forgotten or observations missed</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Inexperienced staff paired on high-risk observations</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Unfair workload distribution causing complaints</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Last-minute sickness or any observation changes means starting over completely</p>
              </div>
            </div>
          </section>

          <section className={styles.solutionCard}>
            <div className={styles.cardIcon}>✨</div>
            <h2 className={styles.cardTitle}>The Solution</h2>
            <div className={styles.solutionList}>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>⚡</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Under 10 Minutes</h3>
                  <p className={styles.solutionItemText}>Generate compliant allocations instantly</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🎯</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Automated Constraints</h3>
                  <p className={styles.solutionItemText}>Handles skill mix, observation distribution, policy and requirements. All automatically</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>⚖️</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Fair Distribution</h3>
                  <p className={styles.solutionItemText}>Balanced workload across all staff members</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🔒</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Privacy First</h3>
                  <p className={styles.solutionItemText}>All data stays on your device</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🔄</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Instant Adaptation</h3>
                  <p className={styles.solutionItemText}>Regenerate instantly when staffing or observations levels change</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* How It Works Timeline */}
        <section className={styles.howItWorks}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>1</div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Input Your Data</h3>
                <p className={styles.timelineText}>
                  Enter patient observations and available staff with their roles and constraints
                </p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>2</div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Optimization Algorithm</h3>
                <p className={styles.timelineText}>
                  Advanced algorithms process all constraints to find the optimal allocation
                </p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>3</div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Review & Adjust</h3>
                <p className={styles.timelineText}>
                  See your allocation instantly. Make manual adjustments with drag-and-drop if needed
                </p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineNumber}>4</div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Print & Handover</h3>
                <p className={styles.timelineText}>
                  Generate a clean, professional allocation sheet ready for handover
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className={styles.developer}>
          <div className={styles.developerContent}>
            <div className={styles.developerText}>
              <h2 className={styles.sectionTitle}>Built by Healthcare Staff, for Healthcare Staff</h2>
              <p className={styles.text}>
                I'm Alex, a Senior Healthcare Assistant and Security Lead with 6 years of frontline 
                experience. I've lived through countless shifts dealing with the allocation struggle - 
                the stress, the wasted time, the complaints, and the risks when things aren't right.
              </p>
              <p className={styles.text}>
                This system combines healthcare experience with programming expertise to solve a real 
                problem I encountered daily. Every feature exists because it addresses an actual 
                challenge faced by nurses doing this work.
              </p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>6+</div>
                <div className={styles.statLabel}>Years Experience</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>30-60</div>
                <div className={styles.statLabel}>Minutes Saved</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Policy Compliant</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className={styles.vision}>
          <h2 className={styles.sectionTitle}>The Vision</h2>
          <p className={styles.visionText}>
            This system is designed to become a comprehensive staffing safety tool that doesn't just 
            save time - it actively reduces clinical risk, improves staff morale, and helps wards 
            maintain the highest standards of care.
          </p>
          <div className={styles.futureFeatures}>
            <div className={styles.featureTag}>Patient Preferences</div>
            <div className={styles.featureTag}>Fatigue Tracking</div>
            <div className={styles.featureTag}>Historical Analysis</div>
            <div className={styles.featureTag}>Policy Integration</div>
            <div className={styles.featureTag}>CQC Requirements</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;