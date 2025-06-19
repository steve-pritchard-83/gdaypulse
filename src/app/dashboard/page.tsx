'use client';
import { useState, useEffect } from 'react';
import DeploymentsChart from '@/components/DeploymentsChart';
import OKRGauge from '@/components/OKRGauge';
import Logo from '@/components/Logo';
import styles from './Dashboard.module.css';
import CommitHistory from '@/components/CommitHistory';
import DeploymentHistory from '@/components/DeploymentHistory';

// Define a comprehensive type for all metrics
interface Metrics {
  deploymentFrequency: { chartData: { date: string; count: number }[] };
  leadTime: { average: number };
  changeFailureRate: { rate: number };
  timeToRestore: { average: number };
  okr: { baseline: number; target: number; current: number; progress: number };
  commits: any[];
  deployments: any[];
  weeklyCommitCount: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllMetrics() {
      try {
        const [
          deploymentsRes,
          leadTimeRes,
          failureRateRes,
          restoreTimeRes,
          okrRes,
          commitsRes,
          deploymentHistoryRes,
          weeklyCommitsRes
        ] = await Promise.all([
          fetch('/api/github/deployments'),
          fetch('/api/github/leadtime'),
          fetch('/api/github/failure-rate'),
          fetch('/api/github/restore-time'),
          fetch('/api/contact-submissions'),
          fetch('/api/github/commits'),
          fetch('/api/github/deployment-history'),
          fetch('/api/github/weekly-commits')
        ]);

        if (!deploymentsRes.ok || !leadTimeRes.ok || !failureRateRes.ok || !restoreTimeRes.ok || !okrRes.ok || !commitsRes.ok || !deploymentHistoryRes.ok || !weeklyCommitsRes.ok) {
          throw new Error('Failed to fetch one or more metrics');
        }

        const deploymentsData = await deploymentsRes.json();
        const leadTimeData = await leadTimeRes.json();
        const failureRateData = await failureRateRes.json();
        const restoreTimeData = await restoreTimeRes.json();
        const okrData = await okrRes.json();
        const commitsData = await commitsRes.json();
        const deploymentHistoryData = await deploymentHistoryRes.json();
        const weeklyCommitsData = await weeklyCommitsRes.json();
        
        const totalDeployments = deploymentsData.chartData.reduce((acc: number, d: {count: number}) => acc + d.count, 0);

        setMetrics({
          deploymentFrequency: { ...deploymentsData, total: totalDeployments },
          leadTime: leadTimeData,
          changeFailureRate: failureRateData,
          timeToRestore: restoreTimeData,
          okr: okrData,
          commits: commitsData.commits,
          deployments: deploymentHistoryData.deployments,
          weeklyCommitCount: weeklyCommitsData.weeklyCommitCount
        });
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllMetrics();
  }, []);

  if (loading) {
    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <Logo />
                <h1 className={styles.title}>G&apos;dayPulse</h1>
                <p className={styles.subtitle}>DORA & OKR Dashboard for futrcrew.com</p>
            </header>
            <div className={styles.loading}>Loading Dashboard...</div>
        </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading dashboard: {error}</div>;
  }
  
  if (!metrics) {
    return <div className={styles.error}>No metrics data available.</div>;
  }

  const { deploymentFrequency, leadTime, changeFailureRate, timeToRestore, okr, commits, deployments, weeklyCommitCount } = metrics;
  const weeklyDeployments = deploymentFrequency.chartData.slice(-7).reduce((acc: number, d: { count: number; }) => acc + d.count, 0);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <Logo />
        <h1 className={styles.title}>G&apos;dayPulse</h1>
        <p className={styles.subtitle}>DORA & OKR Dashboard for futrcrew.com</p>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.doraMetricsColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Deployments This Week</h2>
            <p className={styles.metric}>{weeklyDeployments}</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Commits This Week</h2>
            <p className={styles.metric}>{weeklyCommitCount}</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Avg Lead Time</h2>
            <p className={styles.metric}>{leadTime.average.toFixed(0)} <span className={styles.unit}>hrs</span></p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Change Failure Rate</h2>
            <p className={styles.metric}>{changeFailureRate.rate.toFixed(0)}<span className={styles.unit}>%</span></p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Time to Restore</h2>
            <p className={styles.metric}>{timeToRestore.average.toFixed(0)} <span className={styles.unit}>hrs</span></p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.doraChartCard}`}>
           <DeploymentsChart data={deploymentFrequency.chartData} />
        </div>

        <div className={styles.okrCard}>
            <h2 className={styles.cardTitle}>Objective: Boost Engagement</h2>
            {okr && (
                <ul>
                    <li>Baseline Submissions (Last Month): <span>{okr.baseline}</span></li>
                    <li>Target Submissions (This Month): <span>{okr.target}</span></li>
                    <li>Current Submissions (This Month): <span>{okr.current}</span></li>
                </ul>
            )}
        </div>

        <div className={styles.okrGaugeCard}>
             <OKRGauge value={okr?.progress ?? 0} />
        </div>

        <div className={`${styles.card} ${styles.historyCard}`}>
          <CommitHistory commits={commits} />
        </div>
        <div className={`${styles.card} ${styles.historyCard}`}>
          <DeploymentHistory deployments={deployments} />
        </div>
      </div>
    </div>
  );
} 