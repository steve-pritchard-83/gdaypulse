import styles from './History.module.css';

interface Deployment {
  id: number;
  sha: string;
  environment: string;
  date: string;
  creator: string;
}

interface Props {
  deployments: Deployment[];
}

export default function DeploymentHistory({ deployments }: Props) {
    if (!deployments || deployments.length === 0) {
        return (
          <div className={styles.historyCard}>
            <h2 className={styles.cardTitle}>Deployment History</h2>
            <p>No recent deployments found.</p>
          </div>
        );
      }

  return (
    <div className={styles.historyCard}>
      <h2 className={styles.cardTitle}>Deployment History</h2>
      <ul className={styles.historyList}>
        {deployments.map((deploy) => (
          <li key={deploy.id} className={styles.historyItem}>
            <div className={styles.itemHeader}>
              <span className={styles.sha}>{deploy.sha}</span>
              <span className={styles.environment}>{deploy.environment}</span>
            </div>
            <p className={styles.message}>
              Deployed by <span className={styles.author}>{deploy.creator}</span>
            </p>
            <time className={styles.date}>
              {new Date(deploy.date).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
} 