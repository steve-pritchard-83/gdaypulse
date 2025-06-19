import styles from './History.module.css';

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface Props {
  commits: Commit[];
}

export default function CommitHistory({ commits }: Props) {
  if (!commits || commits.length === 0) {
    return (
      <div className={styles.historyCard}>
        <h2 className={styles.cardTitle}>Recent Commits</h2>
        <p>No recent commits found.</p>
      </div>
    );
  }

  return (
    <div className={styles.historyCard}>
      <h2 className={styles.cardTitle}>Recent Commits</h2>
      <ul className={styles.historyList}>
        {commits.map((commit) => (
          <li key={commit.sha} className={styles.historyItem}>
            <div className={styles.itemHeader}>
              <span className={styles.sha}>{commit.sha}</span>
              <span className={styles.author}>{commit.author}</span>
            </div>
            <p className={styles.message}>{commit.message}</p>
            <time className={styles.date}>
              {new Date(commit.date).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
} 