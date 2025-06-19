import { components } from '@octokit/openapi-types';

type Deployment = components["schemas"]["deployment"];
type Commit = components["schemas"]["commit"];
type PullRequest = components["schemas"]["pull-request"];
type Issue = components["schemas"]["issue"];

async function fetchFromGitHub(endpoint: string) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText} - ${errorBody}`);
  }
  return await res.json();
}

export async function fetchDeployments(limit = 100): Promise<Deployment[]> {
  return await fetchFromGitHub(`deployments?per_page=${limit}`);
}

export async function fetchCommits(limit = 100): Promise<Commit[]> {
  return await fetchFromGitHub(`commits?per_page=${limit}`);
}

export async function fetchPullRequests(state = 'closed', limit = 100): Promise<PullRequest[]> {
  return await fetchFromGitHub(`pulls?state=${state}&per_page=${limit}`);
}

export async function fetchIssues(state = 'closed', labels = 'bug', per_page = 20): Promise<Issue[]> {
    return await fetchFromGitHub(`issues?state=${state}&labels=${labels}&per_page=${per_page}`);
} 