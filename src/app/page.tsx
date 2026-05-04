import styles from './page.module.css';
import { Sparkles, Calendar, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Sparkles className={styles.sparkleIcon} size={48} strokeWidth={1.5} />
        <h1 className={styles.title}>Bella Beauty Salon</h1>
        <p className={styles.subtitle}>
          Experience luxury beauty services with our elegant booking and management system
        </p>
      </div>

      {/* --- BUTOANELE DE AUTH ADĂUGATE AICI --- */}
      <div className={styles.authButtons}>
        <Link href="/login" className={styles.signInBtn}>
          <LogIn size={18} />
          Sign In
        </Link>
        <Link href="/register" className={styles.signUpBtn}>
          <UserPlus size={18} />
          Sign Up
        </Link>
      </div>

      <div className={styles.cardsContainer}>
        {/* Card 1 */}
        <Link href="/services" className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.pinkBg}`}>
            <Calendar size={32} color="#2D2D2D" />
          </div>
          <h2 className={styles.cardTitle}>Book Appointment</h2>
          <p className={styles.cardDescription}>
            Browse services and schedule your beauty session
          </p>
        </Link>

        {/* Card 2 */}
        <Link href="/admin" className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.orangeBg}`}>
            <LayoutDashboard size={32} color="#C5A47E" />
          </div>
          <h2 className={styles.cardTitle}>Admin Dashboard</h2>
          <p className={styles.cardDescription}>
            Manage appointments, customers, and revenue
          </p>
        </Link>
      </div>
    </main>
  );
}