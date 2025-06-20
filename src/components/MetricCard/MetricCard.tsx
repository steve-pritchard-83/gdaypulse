'use client';

import { useState, useEffect, ReactNode } from 'react';
import styles from './MetricCard.module.css';
import TrendIndicator from '../TrendIndicator/TrendIndicator';
import Modal from '../Modal/Modal';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.settingsIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.665 1.043.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface MetricCardProps {
  title: string;
  apiEndpoint: string;
  dataKey: string;
  unit?: string;
  precision?: number;
  modalContent?: ReactNode;
  initialGoal?: number; 
}

export default function MetricCard({ title, apiEndpoint, dataKey, unit = '', precision = 0, modalContent, initialGoal }: MetricCardProps) {
  const [value, setValue] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrilldownModalOpen, setIsDrilldownModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [newGoal, setNewGoal] = useState(goal);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiEndpoint);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json();
        
        const keys = dataKey.split('.');
        let result = data;
        for (const key of keys) {
            result = result[key];
        }

        if (typeof result !== 'number') {
            throw new Error(`Data key '${dataKey}' did not resolve to a number.`);
        }

        setValue(result);
        if (data.change !== undefined) {
          setChange(data.change);
        }

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
  }, [apiEndpoint, dataKey]);

  const handleCardClick = () => {
    if (modalContent) {
      setIsDrilldownModalOpen(true);
    }
  };
  
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking settings
    setNewGoal(goal); // Reset input on open
    setIsSettingsModalOpen(true);
  }

  const handleGoalSave = () => {
    setGoal(newGoal);
    setIsSettingsModalOpen(false);
    // Here you would typically save the goal to a persistent store
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonValue}`}></div>
        </div>
      );
    }

    if (error) {
      return <p className={styles.error}>Error: {error}</p>;
    }

    if (value !== null) {
        const progress = goal ? Math.min((value / goal) * 100, 100) : 0;
        return (
            <div>
                <div className={styles.valueContainer}>
                    <p className={styles.value}>
                        {value.toFixed(precision)}
                        {unit && <span className={styles.unit}>{unit}</span>}
                    </p>
                    {change !== null && <TrendIndicator change={change} />}
                </div>
                {goal && (
                    <div>
                        <div className={styles.goalProgressContainer}>
                            <div className={styles.goalProgressBar} style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className={styles.goalText}>Goal: {goal.toFixed(precision)} {unit}</p>
                    </div>
                )}
            </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <div 
        className={`${styles.card} ${modalContent ? styles.clickable : ''}`} 
        onClick={handleCardClick}
      >
        <h2 className={styles.title}>
            <span>{title}</span>
            <span onClick={handleSettingsClick}><SettingsIcon /></span>
        </h2>
        {renderContent()}
      </div>
      
      {modalContent && (
        <Modal isOpen={isDrilldownModalOpen} onClose={() => setIsDrilldownModalOpen(false)}>
          {modalContent}
        </Modal>
      )}

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
        <div className={styles.goalInputContainer}>
            <label htmlFor="goal-input">Set new goal for {title}</label>
            <input 
                id="goal-input"
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
            />
            <button onClick={handleGoalSave}>Save Goal</button>
        </div>
      </Modal>
    </>
  );
} 