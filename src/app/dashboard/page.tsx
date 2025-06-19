'use client';
import { useEffect, useState } from 'react';
import DeploymentsChart from '@/components/DeploymentsChart';
import OKRGauge from '@/components/OKRGauge';
import Logo from '@/components/Logo';
import styles from './Dashboard.module.css';
import CommitHistory from '@/components/CommitHistory';
import DeploymentHistory from '@/components/DeploymentHistory';

interface Deployment {
  date: string;
  count: number;
}

interface Commit {
    sha: string;
    message: string;
    author: string;
    date: string;
}

interface DeploymentHistoryItem {
    id: number;
    sha: string;
    environment: string;
    date: string;
    creator: string;
}

interface Metrics {
  deploymentFrequency: Deployment[];
  averageLeadTimeHours: string;
  changeFailureRatePercent: string;
  averageRestoreTimeHours: string;
  submissions: number;
  commits: Commit[];
  deployments: DeploymentHistoryItem[];
}

const DashboardPage = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await Promise.all([
          fetch('/api/github/deployments'),
          fetch('/api/github/leadtime'),
          fetch('/api/github/failure-rate'),
          fetch('/api/github/restore-time'),
          fetch('/api/contact-submissions'),
          fetch('/api/github/commits'),
          fetch('/api/github/deployment-history'),
        ]);

        const data = await Promise.all(res.map((r) => r.json()));

        if (res.some((r) => !r.ok)) {
          const errorMessages = data.map(d => d.message).join(', ');
          throw new Error(`Failed to fetch: ${errorMessages}`);
        }

        const combinedMetrics = data.reduce(
          (acc, current) => ({ ...acc, ...current }),
          {}
        ) as Metrics;

        setMetrics(combinedMetrics);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Logo />
        <div>
          <h1>G&apos;dayPulse</h1>
          <p>DORA & OKR Dashboard for futrcrew.com</p>
        </div>
      </header>

      {loading && <p className={styles.loading}>Loading metrics...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {metrics && (
        <div className={styles.mainGrid}>
          <section className={`${styles.card} ${styles.dora_metrics}`}>
            <div className={`${styles.card} ${styles.stat_card}`}>
              <p>Deployments This Week</p>
              <p>{metrics.deploymentFrequency.length}</p>
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
            <DeploymentsChart data={metrics.deploymentFrequency} />
          </section>

          <section className={`${styles.grid_container} ${styles.okr_section}`}>
            <div className={`${styles.card} ${styles.okr_card}`}>
              <h2>OKR: Contact Form</h2>
              <ul>
                <li><strong>Baseline:</strong> {metrics.submissions}</li>
                <li><strong>Current:</strong> {metrics.submissions}</li>
                <li><strong>Target:</strong> {1000}</li>
              </ul>
            </div>
            <div className={`${styles.card} ${styles.gauge_container}`}>
              <OKRGauge
                progress={(metrics.submissions / 1000) * 100}
              />
            </div>
          </section>

          <div className={styles.historyCard}>
            <CommitHistory commits={metrics.commits} />
          </div>
          <div className={styles.historyCard}>
            <DeploymentHistory deployments={metrics.deployments} />
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage; 