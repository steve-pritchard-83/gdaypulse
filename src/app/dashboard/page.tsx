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
import { Metrics } from '@/lib/types';

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
          prSizeRes,
          reviewTimeRes,
          churnRes,
          okrRes,
          visitorOkrRes,
          commitsRes,
          deploymentHistoryRes,
          weeklyCommitsRes,
          dailyCommitsRes
        ] = await Promise.all([
          fetch('/api/github/deployments'),
          fetch('/api/github/leadtime'),
          fetch('/api/github/failure-rate'),
          fetch('/api/github/restore-time'),
          fetch('/api/github/pr-size'),
          fetch('/api/github/review-time'),
          fetch('/api/github/code-churn'),
          fetch('/api/contact-submissions'),
          fetch('/api/google-analytics/visitors'),
          fetch('/api/github/commits'),
          fetch('/api/github/deployment-history'),
          fetch('/api/github/weekly-commits'),
          fetch('/api/github/daily-commits')
        ]);

        if (!deploymentsRes.ok || !leadTimeRes.ok || !failureRateRes.ok || !restoreTimeRes.ok || !prSizeRes.ok || !reviewTimeRes.ok || !churnRes.ok || !okrRes.ok || !visitorOkrRes.ok || !commitsRes.ok || !deploymentHistoryRes.ok || !weeklyCommitsRes.ok || !dailyCommitsRes.ok) {
          throw new Error('Failed to fetch one or more metrics');
        }

        const deploymentsData = await deploymentsRes.json();
        const leadTimeData = await leadTimeRes.json();
        const failureRateData = await failureRateRes.json();
        const restoreTimeData = await restoreTimeRes.json();
        const prSizeData = await prSizeRes.json();
        const reviewTimeData = await reviewTimeRes.json();
        const churnData = await churnRes.json();
        const okrData = await okrRes.json();
        const visitorOkrData = await visitorOkrRes.json();
        const commitsData = await commitsRes.json();
        const deploymentHistoryData = await deploymentHistoryRes.json();
        const weeklyCommitsData = await weeklyCommitsRes.json();
        const dailyCommitsData = await dailyCommitsRes.json();
        
        const totalDeployments = deploymentsData.chartData.reduce((acc: number, d: {count: number}) => acc + d.count, 0);

        setMetrics({
          deploymentFrequency: { ...deploymentsData, total: totalDeployments },
          dailyCommits: dailyCommitsData,
          leadTime: leadTimeData,
          changeFailureRate: failureRateData,
          timeToRestore: restoreTimeData,
          averagePrSize: prSizeData,
          timeToFirstReview: reviewTimeData,
          codeChurn: churnData,
          okr: okrData.okr,
          visitorOkr: visitorOkrData.okr,
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
                <div>
                    <Logo className={styles.logo}/>
                </div>
                <Heartbeat />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className={styles.title}>G&apos;dayPulse</h1>
                    <p className={styles.subtitle}>DORA & OKR Dashboard for futrcrew.com</p>
                </div>
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

  const { deploymentFrequency, dailyCommits, leadTime, changeFailureRate, timeToRestore, averagePrSize, timeToFirstReview, codeChurn, okr, visitorOkr, commits, deployments, weeklyCommitCount } = metrics;
  const weeklyDeployments = deploymentFrequency.chartData.slice(-7).reduce((acc: number, d: { count: number; }) => acc + d.count, 0);

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
            <div className={styles.okrContainer}>
                {okr && <OKRChart data={okr} />}
                {okr && <CircularProgress progress={okr.progress} />}
            </div>
        </div>
        
        <div className={styles.okrCard}>
            <h2 className={styles.cardTitle}>Objective: Increase Visitors 10% this Month</h2>
            <div className={styles.okrContainer}>
                {visitorOkr && <OKRChart data={visitorOkr} />}
                {visitorOkr && <CircularProgress progress={visitorOkr.progress} />}
            </div>
            {/* Placeholder for a future visitor trend chart */}
        </div>

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
            <h2 className={styles.cardTitle}>Avg PR Size</h2>
            <p className={styles.metric}>{averagePrSize.average.toFixed(0)} <span className={styles.unit}>lines</span></p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Time to First Review</h2>
            <p className={styles.metric}>{timeToFirstReview.average.toFixed(0)} <span className={styles.unit}>hrs</span></p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Code Churn</h2>
            <p className={styles.metric}>{codeChurn.rate.toFixed(0)}<span className={styles.unit}>%</span></p>
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
           <TimeSeriesChart
                title="Deployments vs. Commits Over Time"
                series={[
                {
                    name: 'Deployments',
                    dataKey: 'deployments',
                    color: '#fcd34d',
                    data: deploymentFrequency.chartData,
                },
                {
                    name: 'Commits',
                    dataKey: 'commits',
                    color: '#f3f4f6',
                    data: dailyCommits.chartData,
                },
                ]}
            />
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