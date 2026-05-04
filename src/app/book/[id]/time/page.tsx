"use client";
import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Sun, CloudSun, Moon, CalendarDays } from 'lucide-react';
import { supabase } from '../../../../lib/supabase'; 
import { SERVICES } from '../../constants'; 
import styles from '../book.module.css';

export default function ChooseTimePage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const dateParam = searchParams.get('date');
  
  const formattedDate = dateParam 
    ? new Date(dateParam).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Select a date";

  const timeSlots = {
    morning: ["09:00", "09:30", "10:00", "11:30"],
    afternoon: ["13:00", "14:30", "15:00", "16:30"],
    evening: ["18:00", "18:30", "19:00"]
  };

  const handleBooking = async () => {
    if (!selectedTime || !dateParam) {
      alert("Please select both a date and a time slot.");
      return;
    }

    // 1. Găsim serviciul și prețul acestuia
    const currentService = SERVICES.find(s => s.id === id);
    const serviceDisplayName = currentService ? currentService.title : "Salon Service";
    
    // Extragem prețul ca număr (ex: din "$95" scoatem 95)
    const priceString = currentService?.price || "$0";
    const priceValue = parseInt(priceString.replace(/[^0-9]/g, '')) || 0;

    setIsBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        alert("Session expired. Please log in again.");
        router.push('/login');
        return;
      }

      // 2. Inserăm programarea
      const { error: bookingError } = await supabase
        .from('appointments')
        .insert([
          {
            user_email: user.email,
            service_id: id,
            service_name: serviceDisplayName,
            appointment_date: dateParam,
            appointment_time: selectedTime,
            status: 'confirmed'
          }
        ]);

      if (bookingError) throw bookingError;

      // 3. ACTUALIZĂM PUNCTELE (1$ = 1 Punct)
      // Mai întâi luăm punctele actuale ale utilizatorului
      const { data: profile } = await supabase
        .from('profile')
        .select('points')
        .eq('email', user.email)
        .single();

      const currentPoints = profile?.points || 0;
      const newPoints = currentPoints + priceValue;

      // Actualizăm profilul cu noul total
      const { error: profileError } = await supabase
        .from('profile')
        .update({ points: newPoints })
        .eq('email', user.email);

      if (profileError) console.error("Could not update points:", profileError.message);

      // 4. Mergem la pagina de succes
      router.push(`/book/${id}/success`);

    } catch (error: any) {
      console.error("Booking error:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ... restul codului rămâne identic cu cel de data trecută ... */}
      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.iconBtn}><ArrowLeft size={24} /></button>
        <div className={styles.logo}>
          <Star size={20} fill="#C5A47E" color="#C5A47E" />
          <span className={styles.logoText}>Bella Beauty</span>
        </div>
        <button onClick={() => router.push('/')} className={styles.exitBtn}>Exit</button>
      </nav>

      <main className={styles.main}>
        <header className={styles.contentHeader}>
          <h1 className={styles.title}>Choose Time</h1>
          <p className={styles.subtitle}>Select a convenient time slot</p>
        </header>

        <div className={styles.selectedDateBadge}>
          <CalendarDays size={20} className={styles.calendarIconGold} />
          <span>{formattedDate}</span>
        </div>

        <section className={styles.timeSection}>
           {/* Morning */}
           <div className={styles.timeGroupLabel}><Sun size={18} /> Morning</div>
          <div className={styles.timeGrid}>
            {timeSlots.morning.map(time => (
              <button 
                key={time} 
                className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          
          {/* Afternoon */}
          <div className={styles.timeGroupLabel}><CloudSun size={18} /> Afternoon</div>
          <div className={styles.timeGrid}>
            {timeSlots.afternoon.map(time => (
              <button key={time} className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>
            ))}
          </div>

          {/* Evening */}
          <div className={styles.timeGroupLabel}><Moon size={18} /> Evening</div>
          <div className={styles.timeGrid}>
            {timeSlots.evening.map(time => (
              <button key={time} className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>
            ))}
          </div>
        </section>

        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={() => router.back()}>Back</button>
          <button 
            className={styles.continueBtnSmall} 
            disabled={!selectedTime || isBooking}
            onClick={handleBooking}
          >
            {isBooking ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </main>
    </div>
  );
}