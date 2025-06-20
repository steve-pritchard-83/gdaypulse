import styles from './Heartbeat.module.css';

const Heartbeat = () => {
  return (
    <div className={styles.heartbeatContainer}>
      <svg
        className={styles.heartbeatSvg}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path
          className={styles.heartbeatPath}
          d="M0 10 H20 L25 5 L30 15 L35 8 L40 12 L45 10 H100"
          fill="none"
          stroke="var(--gday-yellow-darker)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

export default Heartbeat; 