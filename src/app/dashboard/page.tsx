'use client';
import { useEffect, useState } from 'react';
import DeploymentsChart from '@/components/DeploymentsChart';
import OKRGauge from '@/components/OKRGauge';
import Logo from '@/components/Logo';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // This is a simplified fetch, add error handling for production
    Promise.all([
      fetch('/api/contact-submissions').then((res) => res.json()),
      fetch('/api/github/deployments').then((res) => res.json()),
      fetch('/api/github/leadtime').then((res) => res.json()),
      fetch('/api/github/failure-rate').then((res) => res.json()),
      fetch('/api/github/restore-time').then((res) => res.json()),
    ]).then(([okr, deploys, lead, fail, restore]) => {
      if (okr && deploys && lead && fail && restore) {
        setMetrics({
          okr,
          deploymentCount: deploys.length,
          averageLeadTimeHours: lead.averageLeadTimeHours,
          changeFailureRatePercent: fail.changeFailureRatePercent,
          averageRestoreTimeHours: restore.averageRestoreTimeHours,
        });
      }
    }).catch(console.error);
  }, []);

  const deploymentChartData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    count: Math.floor(Math.random() * 3),
  })).reverse();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Logo />
        <div>
          <h1>G'dayPulse</h1>
          <p>DORA & OKR Dashboard for futrcrew.com</p>
        </div>
      </header>

      {!metrics && <p className={styles.loading}>Loading metrics...</p>}

      {metrics && (
        <div className={styles.grid_container}>
          <section className={`${styles.grid_container} ${styles.dora_metrics}`}>
            <div className={`${styles.card} ${styles.stat_card}`}>
              <p>Deployments This Week</p>
              <p>{metrics.deploymentCount}</p>
            </div>
            <div className={`${styles.card} ${styles.stat_card}`}>
              <p>Avg Lead Time</p>
              <p>{metrics.averageLeadTimeHours}<span className={styles.unit}>hrs</span></p>
            </div>
            <div className={`${styles.card} ${styles.stat_card}`}>
              <p>Change Failure Rate</p>
              <p>{metrics.changeFailureRatePercent}<span className={styles.unit}>%</span></p>
            </div>
            <div className={`${styles.card} ${styles.stat_card}`}>
              <p>Time to Restore</p>
              <p>{metrics.averageRestoreTimeHours}<span className={styles.unit}>hrs</span></p>
            </div>
          </section>

          <section className={`${styles.card} ${styles.chart_card}`}>
            <DeploymentsChart data={deploymentChartData} />
          </section>

          <section className={`${styles.grid_container} ${styles.okr_section}`}>
            <div className={`${styles.card} ${styles.okr_card}`}>
              <h2>OKR: Contact Form</h2>
              <ul>
                <li><strong>Baseline:</strong> {metrics.okr.baseline ?? 'Not set'}</li>
                <li><strong>Current:</strong> {metrics.okr.submissionCount}</li>
                <li><strong>Target:</strong> {metrics.okr.target ?? 'N/A'}</li>
              </ul>
            </div>
            <div className={`${styles.card} ${styles.gauge_container}`}>
              <OKRGauge progress={metrics.okr.progress} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
} 