"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Home } from 'lucide-react';
import styles from '../book.module.css';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <main className={`${styles.main} ${styles.centerContent}`}>
        <div className={styles.successIconContainer}>
          <CheckCircle size={80} color="#C5A47E" strokeWidth={1.5} />
        </div>
        
        <h1 className={styles.title}>Booking Confirmed!</h1>
        <p className={styles.subtitle} style={{ textAlign: 'center' }}>
          Thank you for choosing Bella Beauty. We've sent the details to your email.
        </p>

        <button 
          className={styles.continueBtn} 
          onClick={() => router.push('/')}
          style={{ marginTop: '40px' }}
        >
          <Home size={20} style={{ marginRight: '10px' }} />
          Back to Home
        </button>
      </main>
    </div>
  );
}