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

export async function fetchDeployments(limit = 100) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error(
      'Missing GitHub environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN'
    );
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/deployments?per_page=${limit}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch deployments: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCommits(limit = 5) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error(
      'Missing GitHub environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN'
    );
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch commits: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPullRequests(state = 'closed', limit = 100) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error(
      'Missing GitHub environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN'
    );
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=${limit}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch pull requests: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchIssues(state = 'closed', labels = 'bug', per_page = 20) {
    return await fetchFromGitHub(`issues?state=${state}&labels=${labels}&per_page=${per_page}`);
} 