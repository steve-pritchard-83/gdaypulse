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
  dailyCommits: { chartData: { date: string; count: number }[] };
  leadTime: { average: number };
  changeFailureRate: { rate: number };
  timeToRestore: { average: number };
  averagePrSize: { average: number };
  timeToFirstReview: { average: number };
  codeChurn: { rate: number };
  okr: {
    baseline: number;
    target: number;
    current: number;
    progress: number;
    chartData: { date: string; count: number }[];
  };
  visitorOkr: {
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