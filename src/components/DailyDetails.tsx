'use client';

import { useState, useEffect } from 'react';
import { components } from '@octokit/openapi-types';
import styles from './History.module.css'; // Reusing styles

type Commit = components["schemas"]["commit"];
type Deployment = components["schemas"]["deployment"];

// Type guard to check if an item is a Commit
function isCommit(item: Commit | Deployment): item is Commit {
    return (item as Commit).sha !== undefined && (item as Commit).commit !== undefined;
}

interface DailyDetailsProps {
    date: string;
    type: 'commits' | 'deployments';
}

export default function DailyDetails({ date, type }: DailyDetailsProps) {
    const [items, setItems] = useState<(Commit | Deployment)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/github/${type}-on-date?date=${date}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${type}`);
                }
                const data = await res.json();
                setItems(data);
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
        fetchData();
    }, [date, type]);

    if (loading) return <div>Loading details...</div>;
    if (error) return <div>Error: {error}</div>;
    
    if (items.length === 0) return <div>No {type} on this day.</div>

    return (
        <div>
            <h3 className={styles.title}>{type.charAt(0).toUpperCase() + type.slice(1)} on {new Date(date).toLocaleDateString()}</h3>
            <ul className={styles.list}>
                {items.map((item) => {
                    if (isCommit(item)) { // It's a Commit
                        return (
                            <li key={item.sha} className={styles.listItem}>
                                <a href={item.html_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    {item.commit.message.split('\n')[0]}
                                </a>
                                <span className={styles.meta}>
                                    by {item.commit.author?.name}
                                </span>
                            </li>
                        );
                    } else { // It's a Deployment
                        return (
                            <li key={item.id} className={styles.listItem}>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    {item.environment} deployment
                                </a>
                                <span className={styles.meta}>
                                    via {item.creator?.login}
                                </span>
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
} 