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
                <p>30-60 minutes per shift wasted on manual allocation</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Error-prone process dependent on individual memory</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Staff repeatedly assigned same observations</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Poor skill mix - inexperienced staff paired on high-risk obs</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Unfair workload distribution causing staff complaints</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Last-minute changes mean starting allocation from scratch</p>
              </div>
              <div className={styles.problemItem}>
                <span className={styles.bulletPoint}>•</span>
                <p>Unnecessary extra staffing "just to make obs work"</p>
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
                  <h3 className={styles.solutionItemTitle}>Under 5 Minutes</h3>
                  <p className={styles.solutionItemText}>Generate compliant allocations instantly</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🎯</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Automated Constraints</h3>
                  <p className={styles.solutionItemText}>Skill mix, gender pairing, observation distribution - all automatic</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>⚖️</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Fair Distribution</h3>
                  <p className={styles.solutionItemText}>Balanced workload preventing burnout and complaints</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🔒</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Privacy First</h3>
                  <p className={styles.solutionItemText}>All data stays on your device - fully secure</p>
                </div>
              </div>
              <div className={styles.solutionItem}>
                <div className={styles.solutionIcon}>🔄</div>
                <div>
                  <h3 className={styles.solutionItemTitle}>Instant Adaptation</h3>
                  <p className={styles.solutionItemText}>Regenerate immediately when staffing changes</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Financial Impact Section - NEW */}
        <section className={styles.financialImpact}>
          <div className={styles.impactHeader}>
            <h2 className={styles.sectionTitle}>Financial Impact Per Ward</h2>
            <p className={styles.impactSubtitle}>Conservative estimates based on real-world usage</p>
          </div>
          
          <div className={styles.savingsGrid}>
            <div className={styles.savingsCard}>
              <div className={styles.savingsIcon}>💰</div>
              <h3 className={styles.savingsTitle}>Avoiding Extra HCA Shifts</h3>
              <div className={styles.savingsAmount}>£6,240</div>
              <p className={styles.savingsText}>
                Preventing 1 unnecessary HCA shift every 2 weeks (26/year at £240/shift)
              </p>
            </div>

            <div className={styles.savingsCard}>
              <div className={styles.savingsIcon}>⏰</div>
              <h3 className={styles.savingsTitle}>Nurse Time Saved</h3>
              <div className={styles.savingsAmount}>£10,000</div>
              <p className={styles.savingsText}>
                50 minutes saved per shift = 36.5 Band 6 hours/month freed for patient care
              </p>
            </div>

            <div className={styles.savingsCard}>
              <div className={styles.savingsIcon}>🛡️</div>
              <h3 className={styles.savingsTitle}>Incident Reduction</h3>
              <div className={styles.savingsAmount}>£5,000+</div>
              <p className={styles.savingsText}>
                Better skill mix reduces violence, self-harm, and restraint incidents
              </p>
            </div>

            <div className={styles.savingsCard}>
              <div className={styles.savingsIcon}>👥</div>
              <h3 className={styles.savingsTitle}>Staff Retention</h3>
              <div className={styles.savingsAmount}>£4,000+</div>
              <p className={styles.savingsText}>
                Fair allocations reduce burnout - avoiding one HCA replacement saves £4-6k
              </p>
            </div>
          </div>

          <div className={styles.totalSavings}>
            <div className={styles.totalSavingsContent}>
              <h3 className={styles.totalSavingsTitle}>Total Annual Savings Per Ward</h3>
              <div className={styles.totalSavingsAmount}>£25,000 - £35,000</div>
              <p className={styles.totalSavingsNote}>Higher-acuity wards may save considerably more</p>
            </div>
          </div>
        </section>

        {/* Non-Financial Benefits - NEW */}
        <section className={styles.nonFinancialBenefits}>
          <h2 className={styles.sectionTitle}>Beyond the Numbers</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>Clinical Safety</h3>
              <p className={styles.benefitText}>Fewer allocation errors and better skill mix protection</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>Staff Wellbeing</h3>
              <p className={styles.benefitText}>Reduced stress and improved morale through fair distribution</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>CQC Compliance</h3>
              <p className={styles.benefitText}>Supports "Safe" and "Well-Led" domains with audit trails</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>Trauma-Informed Care</h3>
              <p className={styles.benefitText}>Gender-appropriate pairing for sensitive observations</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>Consistency</h3>
              <p className={styles.benefitText}>Same quality across all shifts and staff members</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3 className={styles.benefitTitle}>Rapid Response</h3>
              <p className={styles.benefitText}>Instant reallocation for last-minute sickness or changes</p>
            </div>
          </div>
        </section>

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
                  Advanced constraint programming processes all requirements to find the optimal allocation
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
                <div className={styles.statNumber}>50</div>
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
            save time and money - it actively reduces clinical risk, improves staff morale, and helps 
            wards maintain the highest standards of care while supporting CQC compliance.
          </p>
          <div className={styles.futureFeatures}>
            <div className={styles.featureTag}>Patient Preferences</div>
            <div className={styles.featureTag}>Fatigue Tracking</div>
            <div className={styles.featureTag}>Historical Analysis</div>
            <div className={styles.featureTag}>Policy Integration</div>
            <div className={styles.featureTag}>CQC Requirements</div>
            <div className={styles.featureTag}>Multi-Ward Management</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;