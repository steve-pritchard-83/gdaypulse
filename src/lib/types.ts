export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface Deployment {
  id: number;
  sha: string;
  environment: string;
  date: string;
  creator: string;
}

// Define a comprehensive type for all metrics
export interface Metrics {
  deploymentFrequency: { chartData: { date: string; count: number }[], total: number };
  leadTime: { average: number };
  changeFailureRate: { rate: number };
  timeToRestore: { average: number };
  okr: {
    baseline: number;
    target: number;
    current: number;
    progress: number;
    chartData: { date: string; count: number }[];
  };
  commits: Commit[];
  deployments: Deployment[];
  weeklyCommitCount: number;
} 