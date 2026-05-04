"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowLeft, Star } from 'lucide-react';
import styles from '../book.module.css';
// Importăm supabase
import { supabase } from '../../../../lib/supabase';

export default function ChooseDatePage() {
  const router = useRouter();
  const { id } = useParams();

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const [viewDate, setViewDate] = useState(new Date()); // Pornim cu luna curentă
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);

  // --- LOGICA SUPABASE: Verificăm zilele ocupate ---
  useEffect(() => {
    async function checkAvailability() {
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
      const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('booking_date')
        .gte('booking_date', firstDay)
        .lte('booking_date', lastDay);

      if (data) {
        // Aici poți adăuga logică: dacă o zi are mai mult de X programări, o adaugi în fullyBookedDates
        // Momentan doar pregătim terenul
        const dates = data.map(ap => ap.booking_date);
        setFullyBookedDates(dates);
      }
    }
    checkAvailability();
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en-US', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.iconBtn}><ArrowLeft size={24} /></button>
        <div className={styles.logo}>
          <Star size={20} fill="#C5A47E" color="#C5A47E" /><span className={styles.logoText}>Bella Beauty</span>
        </div>
        <button onClick={() => router.push('/')} className={styles.exitBtn}>Exit</button>
      </nav>

      <main className={styles.main}>
        <header className={styles.contentHeader}>
          <h1 className={styles.title}>Choose Date</h1>
          <p className={styles.subtitle}>Select your preferred appointment date</p>
        </header>

        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <button className={styles.navArrow} onClick={() => changeMonth(-1)}><ChevronLeft size={20} /></button>
            <span className={styles.currentMonth}>{monthName} {year}</span>
            <button className={styles.navArrow} onClick={() => changeMonth(1)}><ChevronRight size={20} /></button>
          </div>

          <div className={styles.calendarGrid}>
            {weekDays.map(day => <div key={day} className={styles.dayLabel}>{day}</div>)}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

            {daysArray.map(day => {
              const currentDate = new Date(year, month, day);
              const isPast = currentDate < today;
              const isToday = currentDate.getTime() === today.getTime();
              const isSelected = selectedDate?.getTime() === currentDate.getTime();
              
              // Formatăm data curentă pentru a verifica dacă e în lista de ocupate
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isFull = fullyBookedDates.includes(dateKey);

              return (
                <button 
                  key={day} 
                  disabled={isPast || isFull}
                  className={`
                    ${styles.dayButton} 
                    ${isSelected ? styles.selectedDay : ''} 
                    ${isToday ? styles.todayHighlight : ''}
                    ${(isPast || isFull) ? styles.disabledDay : ''} 
                  `}
                  onClick={() => setSelectedDate(currentDate)}
                >
                  {day}
                  {isFull && <span className={styles.fullDot}>•</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={() => router.back()}>Back</button>
          
          <button 
            className={styles.continueBtnSmall} 
            disabled={!selectedDate}
            onClick={() => {
              if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                
                router.push(`/book/${id}/time?date=${dateString}`);
              }
            }}
          >
            Continue to Time
          </button>
        </div>
      </main>
    </div>
  );
}