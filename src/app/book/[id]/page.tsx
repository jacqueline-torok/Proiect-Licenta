"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import { SERVICES } from '../constants'; 
import styles from '../[id]/book.module.css';
import { supabase } from  '../../../lib/supabase'; 
import { useEffect, useState } from 'react';

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Opțional: trimite-l la login dacă nu e logat
        // router.push('/login');
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);;
  
  // Găsim serviciul folosind ID-ul din URL
  const service = SERVICES.find(s => s.id === params.id);

  if (!service) {
    return (
      <div className={styles.container}>
        <p>Service not found</p>
        <button onClick={() => router.push('/services')}>Back to Services</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navigation Header */}
      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.iconBtn}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.logo}>
          <Star size={20} fill="#C5A47E" color="#C5A47E" />
          <span className={styles.logoText}>Bella Beauty</span>
        </div>
        <button onClick={() => router.push('/')} className={styles.exitBtn}>
          Exit
        </button>
      </nav>

      {/* Progress Stepper (3 linii de sus) */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepper}>
          <div className={`${styles.step} ${styles.activeStep}`}></div>
          <div className={styles.step}></div>
          <div className={styles.step}></div>
        </div>
      </div>

      <main className={styles.main}>
        <header className={styles.contentHeader}>
          <h1 className={styles.title}>Select Service</h1>
          <p className={styles.subtitle}>Choose the service you'd like to book</p>
        </header>

        {/* Cardul Serviciului (Design-ul din imagine) */}
        <div className={styles.selectedServiceCard}>
          <span className={styles.categoryTag}>{service.category}</span>
          <h2 className={styles.serviceName}>{service.title}</h2>
          
          <div className={styles.cardFooter}>
            <div className={styles.durationInfo}>
              <Clock size={18} className={styles.clockIcon} />
              <span>{service.duration}</span>
            </div>
            <div className={styles.priceTag}>
              {service.price}
            </div>
          </div>
        </div>

        {/* Butonul de Continuare - MODIFICAT */}
        <div className={styles.footerAction}>
          <button 
            className={styles.continueBtn}
            onClick={() => router.push(`/book/${params.id}/date`)} // Trimite la pasul Calendar
          >
            Continue to Date
          </button>
        </div>
      </main>
    </div>
  );
}