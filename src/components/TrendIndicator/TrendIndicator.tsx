import styles from './TrendIndicator.module.css';

interface TrendIndicatorProps {
  change: number;
}

const ArrowUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

const ArrowDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const Dash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);


export default function TrendIndicator({ change }: TrendIndicatorProps) {
  const roundedChange = Math.round(change);
  
  if (roundedChange === 0) {
    return (
      <div className={`${styles.trend} ${styles.neutral}`}>
        <Dash />
        <span>No Change</span>
      </div>
    );
  }

  const isUp = roundedChange > 0;
  const trendClass = isUp ? styles.up : styles.down;
  const ArrowComponent = isUp ? ArrowUp : ArrowDown;

  return (
    <div className={`${styles.trend} ${trendClass}`}>
      <ArrowComponent />
      <span>{Math.abs(roundedChange)}%</span>
    </div>
  );
} 