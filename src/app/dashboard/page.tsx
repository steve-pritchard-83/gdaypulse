'use client';
import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import styles from './Dashboard.module.css';
import CommitHistory from '@/components/CommitHistory';
import DeploymentHistory from '@/components/DeploymentHistory';
import OKRChart from '@/components/OKRChart';
import CircularProgress from '@/components/CircularProgress';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import Heartbeat from '@/components/Heartbeat';
import MetricCard from '@/components/MetricCard/MetricCard';
import PullRequestList from '@/components/PullRequestList';
import CodeOwnershipChart from '@/components/CodeOwnershipChart';
import { Metrics } from '@/lib/types';

export default function Dashboard() {
  const [legacyMetrics, setLegacyMetrics] = useState<Partial<Metrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLegacyMetrics() {
      try {
        const [
          okrRes,
          visitorOkrRes,
          commitsRes,
          deploymentHistoryRes,
          deploymentFrequencyRes,
          dailyCommitsRes,
        ] = await Promise.all([
          fetch('/api/contact-submissions'),
          fetch('/api/google-analytics/visitors'),
          fetch('/api/github/commits'),
          fetch('/api/github/deployment-history'),
          fetch('/api/github/deployments'),
          fetch('/api/github/daily-commits'),
        ]);

        if (!okrRes.ok) throw new Error('Failed to fetch legacy metrics');

        const okrData = await okrRes.json();
        const visitorOkrData = await visitorOkrRes.json();
        const commitsData = await commitsRes.json();
        const deploymentHistoryData = await deploymentHistoryRes.json();
        const deploymentFrequencyData = await deploymentFrequencyRes.json();
        const dailyCommitsData = await dailyCommitsRes.json();

        setLegacyMetrics({
          okr: okrData.okr,
          visitorOkr: visitorOkrData.okr,
          commits: commitsData.commits,
          deployments: deploymentHistoryData.deployments,
          deploymentFrequency: deploymentFrequencyData,
          dailyCommits: dailyCommitsData,
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

    fetchLegacyMetrics();
  }, []);

  const { okr, visitorOkr, commits, deployments, deploymentFrequency, dailyCommits } = legacyMetrics;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
            <Logo className={styles.logo}/>
        </div>
        <Heartbeat />
        <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 className={styles.title}>G&apos;dayPulse</h1>
            <p className={styles.subtitle}>DORA & OKR Dashboard for futrcrew.com</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.okrCard}>
            <h2 className={styles.cardTitle}>Objective: Boost Enquiries 10% this Month</h2>
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && <div className={styles.error}>Error</div>}
            {okr && <div className={styles.okrContainer}>
                <OKRChart data={okr} />
                <CircularProgress progress={okr.progress} />
            </div>}
        </div>
        
        <div className={styles.okrCard}>
            <h2 className={styles.cardTitle}>Objective: Increase Visitors 10% this Month</h2>
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && <div className={styles.error}>Error</div>}
            {visitorOkr && <div className={styles.okrContainer}>
                <OKRChart data={visitorOkr} />
                <CircularProgress progress={visitorOkr.progress} />
            </div>}
        </div>

        <div className={styles.doraMetricsColumn}>
          <MetricCard title="Deployments This Week" apiEndpoint="/api/github/weekly-summary" dataKey="weeklyDeploymentCount" initialGoal={10} />
          <MetricCard title="Commits This Week" apiEndpoint="/api/github/weekly-summary" dataKey="weeklyCommitCount" initialGoal={50} />
          <MetricCard title="Avg PR Size" apiEndpoint="/api/github/pr-size" dataKey="average" unit="lines" initialGoal={100} />
          <MetricCard title="Time to First Review" apiEndpoint="/api/github/review-time" dataKey="average" unit="hrs" initialGoal={12} />
          <MetricCard title="Code Churn" apiEndpoint="/api/github/code-churn" dataKey="rate" unit="%" initialGoal={15} />
          <MetricCard 
            title="Avg Lead Time" 
            apiEndpoint="/api/github/leadtime" 
            dataKey="average" 
            unit="hrs" 
            modalContent={<PullRequestList />}
            initialGoal={24}
          />
          <MetricCard title="Change Failure Rate" apiEndpoint="/api/github/failure-rate" dataKey="rate" unit="%" initialGoal={5} />
          <MetricCard title="Time to Restore" apiEndpoint="/api/github/restore-time" dataKey="average" unit="hrs" initialGoal={8} />
        </div>

        <div className={`${styles.card} ${styles.doraChartCard}`}>
           {loading && <div className={styles.loading}>Loading Chart...</div>}
           {error && <div className={styles.error}>Error loading chart</div>}
           {deploymentFrequency && dailyCommits && (
            <TimeSeriesChart
                    title="Deployments vs. Commits Over Time"
                    series={[
                    {
                        name: 'Deployments',
                        dataKey: 'deploymentCount',
                        color: '#fcd34d',
                        data: deploymentFrequency.chartData,
                    },
                    {
                        name: 'Commits',
                        dataKey: 'commitCount',
                        color: '#f3f4f6',
                        data: dailyCommits.chartData,
                    },
                    ]}
                />
           )}
        </div>

        <div className={`${styles.card} ${styles.historyCard}`}>
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && <div className={styles.error}>Error</div>}
            {commits && <CommitHistory commits={commits} />}
        </div>
        <div className={`${styles.card} ${styles.historyCard}`}>
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && <div className={styles.error}>Error</div>}
            {deployments && <DeploymentHistory deployments={deployments} />}
        </div>

        <div className={`${styles.card} ${styles.fullWidthCard}`}>
            <CodeOwnershipChart />
        </div>
      </div>
    </div>
  );
} 