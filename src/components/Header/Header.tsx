'use client';

import Logo from '@/components/Logo';
import Heartbeat from '@/components/Heartbeat';
import Navbar from '@/components/Navbar';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
        <Heartbeat />
        <div className={styles.logoContainer}>
            <Logo className={styles.logo}/>
        </div>
        <div className={styles.titleContainer}>
            <h1 className={styles.title}>G&apos;dayPulse</h1>
            <p className={styles.subtitle}>DORA & OKR Dashboard for futrcrew.com</p>
        </div>
        <Navbar />
    </header>
  );
} 