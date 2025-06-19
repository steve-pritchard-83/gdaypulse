async function fetchFromGitHub(endpoint: string) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchDeployments() {
  return await fetchFromGitHub('deployments');
}

export async function fetchPullRequests(state = 'closed', per_page = 20) {
    return await fetchFromGitHub(`pulls?state=${state}&per_page=${per_page}`);
}

export async function fetchIssues(state = 'closed', labels = 'bug', per_page = 20) {
    return await fetchFromGitHub(`issues?state=${state}&labels=${labels}&per_page=${per_page}`);
} 