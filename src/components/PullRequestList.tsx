'use client';

import { useState, useEffect } from 'react';
import { components } from '@octokit/openapi-types';
import styles from './History.module.css'; // Reusing styles from History component

type PullRequest = components["schemas"]["pull-request-simple"];

export default function PullRequestList() {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPullRequests() {
            try {
                const res = await fetch('/api/github/pull-requests');
                if (!res.ok) {
                    throw new Error('Failed to fetch pull requests');
                }
                const data = await res.json();
                setPullRequests(data);
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchPullRequests();
    }, []);

    if (loading) return <div>Loading pull requests...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h3 className={styles.title}>Recent Pull Requests</h3>
            <ul className={styles.list}>
                {pullRequests.map((pr) => (
                    <li key={pr.id} className={styles.listItem}>
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            {pr.title}
                        </a>
                        <span className={styles.meta}>
                            #{pr.number} by {pr.user?.login}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
} 