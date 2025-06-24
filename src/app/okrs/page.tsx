'use client'
import { motion } from "framer-motion";
import styles from '../dashboard/Dashboard.module.css';
import okrStyles from './OKRs.module.css';

/**
 * Mock OKR dashboard – replace placeholder numbers with real-time data feeds.
 */
const okrs = [
  {
    id: 1,
    title: "Grow online booking revenue",
    krs: [
      { label: "Conversion rate", value: 7.2, target: 7.9, unit: "%", higherIsBetter: true },
      { label: "Average order value", value: 212, target: 230, unit: "$", higherIsBetter: true },
      { label: "Cart abandonment", value: 51, target: 43, unit: "%", higherIsBetter: false },
    ],
  },
  {
    id: 2,
    title: "Deliver a lightning‑fast experience",
    krs: [
      { label: "LCP (p75)", value: 2.9, target: 2.5, unit: "s", higherIsBetter: false },
      { label: "INP (p75)", value: 250, target: 200, unit: "ms", higherIsBetter: false },
      { label: "Mobile Lighthouse score", value: 79, target: 85, unit: "", higherIsBetter: true },
    ],
  },
  {
    id: 3,
    title: "Keep the lights on",
    krs: [
      { label: "Uptime", value: 99.91, target: 99.95, unit: "%", higherIsBetter: true },
      { label: "MTTR", value: 42, target: 30, unit: "min", higherIsBetter: false },
      { label: "Change failure rate", value: 12, target: 10, unit: "%", higherIsBetter: false },
    ],
  },
  {
    id: 4,
    title: "Embed AI into every sprint",
    krs: [
      { label: "AI commits / sprint", value: 3.2, target: 5, unit: "avg", higherIsBetter: true },
      { label: "AI suggestions merged", value: 27, target: 40, unit: "%", higherIsBetter: true },
      { label: "Guide usefulness score", value: 3.6, target: 4, unit: "/5", higherIsBetter: true },
    ],
  },
  {
    id: 5,
    title: "Accelerate delivery velocity",
    krs: [
      { label: "Deploy freq (per wk)", value: 2, target: 5, unit: "", higherIsBetter: true },
      { label: "Lead time (days)", value: 4.6, target: 2, unit: "d", higherIsBetter: false },
      { label: "Sprint commitment", value: 82, target: 90, unit: "%", higherIsBetter: true },
    ],
  },
  {
    id: 6,
    title: "Delight guests",
    krs: [
      { label: "Digital NPS", value: 37, target: 42, unit: "", higherIsBetter: true },
      { label: "App‑store rating", value: 4.2, target: 4.5, unit: "/5", higherIsBetter: true },
      { label: "Support tickets", value: 910, target: 820, unit: "#", higherIsBetter: false },
    ],
  },
  {
    id: 7,
    title: "Empower park managers",
    krs: [
      { label: "PMS processing time", value: 145, target: 116, unit: "s", higherIsBetter: false },
      { label: "Feature adoption", value: 62, target: 80, unit: "%", higherIsBetter: true },
      { label: "Manager CSAT", value: 3.8, target: 4, unit: "/5", higherIsBetter: true },
    ],
  },
  {
    id: 8,
    title: "Make data drive every decision",
    krs: [
      { label: "Dash shipped", value: 1, target: 1, unit: "#", higherIsBetter: true },
      { label: "PRDs with insights", value: 74, target: 90, unit: "%", higherIsBetter: true },
      { label: "Insight lead‑time", value: 2.8, target: 1, unit: "d", higherIsBetter: false },
    ],
  },
  {
    id: 9,
    title: "Cut cost, raise quality",
    krs: [
      { label: "Cost per booking", value: 0.53, target: 0.48, unit: "$", higherIsBetter: false },
      { label: "Critical security incidents", value: 0, target: 0, unit: "#", higherIsBetter: false },
      { label: "Test coverage", value: 68, target: 75, unit: "%", higherIsBetter: true },
    ],
  },
  {
    id: 10,
    title: "Keep the team thriving",
    krs: [
      { label: "eNPS", value: 38, target: 50, unit: "", higherIsBetter: true },
      { label: "Maker‑focus hrs", value: 9.6, target: 12, unit: "h", higherIsBetter: true },
      { label: "Tech‑debt backlog", value: 118, target: 100, unit: "sp", higherIsBetter: false },
    ],
  },
];

const calcPercent = (value: number, target: number, higherIsBetter: boolean) => {
  if (value === null || target === null) return 0;
  
  if (higherIsBetter) {
    // For "higher is better", progress is the ratio of value to target.
    // Cap at 110% to allow for overachievement visualization but keep it reasonable.
    return Math.min((value / target) * 100, 110);
  } else {
    // For "lower is better", progress is more complex.
    // A perfect score is when value equals target.
    // If value is higher than target, it's bad, progress should be < 100.
    // Let's define 0 progress as being 2x the target or more.
    if (value >= target * 2) return 0;
    // Progress from 0 (at 2*target) to 100 (at target)
    return Math.min(( (target * 2 - value) / target) * 100, 110);
  }
};


const ProgressBar = ({ value, higherIsBetter }: { value: number, higherIsBetter: boolean }) => {
  const bgColor = value >= 100 ? okrStyles.progressComplete : okrStyles.progressInProgress;
  return (
    <div className={okrStyles.progressBarContainer}>
      <div className={`${okrStyles.progressBar} ${bgColor}`} style={{ width: `${value}%` }} />
    </div>
  );
};

export default function OKRDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.mainGrid}>
        {okrs.map((okr) => (
          <motion.div
            key={okr.id}
            className={okrStyles.okrCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: okr.id * 0.05 }}
          >
            <h2 className={okrStyles.okrTitle}>{okr.id}. {okr.title}</h2>
            <div className={okrStyles.krsContainer}>
              {okr.krs.map((kr, idx) => {
                const pct = calcPercent(kr.value, kr.target, kr.higherIsBetter);
                return (
                  <div key={idx} className={okrStyles.kr}>
                    <div className={okrStyles.krHeader}>
                      <span className={okrStyles.krLabel}>{kr.label}</span>
                      <span className={okrStyles.krValue}>
                        {kr.value}{kr.unit} / {kr.target}{kr.unit}
                      </span>
                    </div>
                    <ProgressBar value={pct} higherIsBetter={kr.higherIsBetter} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 