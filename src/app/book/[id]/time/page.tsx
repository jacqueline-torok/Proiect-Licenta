"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Sun, CloudSun, Moon, CalendarDays } from 'lucide-react';
import { supabase } from '../../../../lib/supabase'; 
import { SERVICES } from '../../constants'; 
import styles from '../book.module.css';

export default function ChooseTimePage() {
  const router = useRouter();
  const { id } = useParams(); // Preluat ca string din URL (ex: "1")
  const searchParams = useSearchParams();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // --- STARE PENTRU ORELE DEJA REZERVATE ---
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);

  const dateParam = searchParams.get('date');
  
  const formattedDate = dateParam 
    ? new Date(dateParam).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Select a date";

  // --- DETERMINAREA DINAMICĂ A PROGRAMULUI (După orarul Bella Beauty) ---
  // 0 = Duminică, 1 = Luni, ..., 6 = Sâmbătă
  const selectedDayOfWeek = dateParam ? new Date(dateParam).getDay() : 1;

  let timeSlots = {
    morning: ["09:00", "09:30", "10:00", "11:30"],
    afternoon: ["13:00", "14:30", "15:00", "16:30"],
    evening: ["18:00", "18:30", "19:00"]
  };

  // Modificăm structura de sloturi în funcție de zi
  if (selectedDayOfWeek === 6) {
    // SÂMBĂTĂ: 9:00 AM - 7:00 PM (Ultimul slot începe la 18:30)
    timeSlots = {
      morning: ["09:00", "09:30", "10:00", "11:30"],
      afternoon: ["13:00", "14:30", "15:00", "16:30"],
      evening: ["18:00", "18:30"]
    };
  } else if (selectedDayOfWeek === 0) {
    // DUMINICĂ: 10:00 AM - 6:00 PM (Ultimul slot începe înainte de 18:00)
    timeSlots = {
      morning: ["10:00", "10:30", "11:30"],
      afternoon: ["13:00", "14:30", "15:00", "16:30"],
      evening: [] // Închis seara
    };
  }

  // Găsim serviciul și prețul acestuia din constants
  const currentService = SERVICES.find(s => s.id === id);
  const serviceDisplayName = currentService ? currentService.title : "Salon Service";

  // --- LOGICA SUPABASE: Descărcăm orele luate strict pentru acest service_id ---
  useEffect(() => {
    async function checkAvailability() {
      if (!dateParam || !id) return;

      const numericServiceId = parseInt(id as string, 10);

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateParam)
        .eq('service_id', numericServiceId); 

      if (data && !error) {
        const formattedHours = data.map(apt => apt.appointment_time.substring(0, 5));
        setOccupiedHours(formattedHours);
      }
    }
    checkAvailability();
  }, [dateParam, id]);

  const handleBooking = async () => {
    if (!selectedTime || !dateParam) {
      alert("Please select both a date and a time slot.");
      return;
    }
    
    const priceString = currentService?.price || "$0";
    const priceValue = parseInt(priceString.replace(/[^0-9]/g, '')) || 0;

    setIsBooking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser || !currentUser.email) {
        alert("Session expired. Please log in again.");
        router.push('/login');
        return;
      }

      const numericServiceId = parseInt(id as string, 10);

      const { error: bookingError } = await supabase
        .from('appointments')
        .insert([
          {
            user_email: currentUser.email,
            service_id: numericServiceId,  
            service_name: serviceDisplayName,
            appointment_date: dateParam,
            appointment_time: selectedTime,
            status: 'confirmed'
          }
        ]);

      if (bookingError) throw bookingError;

      const { data: profile } = await supabase
        .from('profile')
        .select('points')
        .eq('email', currentUser.email)
        .single();

      const currentPoints = profile?.points || 0;
      const newPoints = currentPoints + priceValue;

      await supabase
        .from('profile')
        .update({ points: newPoints })
        .eq('email', currentUser.email);

      router.push(`/book/${id}/success`);

    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className={styles.container}>
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
          {timeSlots.morning.length > 0 && (
            <>
              <div className={styles.timeGroupLabel}><Sun size={18} /> Morning</div>
              <div className={styles.timeGrid}>
                {timeSlots.morning.map(time => {
                  const isOccupied = occupiedHours.includes(time);
                  return (
                    <button 
                      key={time} 
                      disabled={isOccupied}
                      className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''} ${isOccupied ? styles.timeOccupied : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time} {isOccupied ? '(Ocupat)' : ''}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          
          {/* Afternoon */}
          {timeSlots.afternoon.length > 0 && (
            <>
              <div className={styles.timeGroupLabel}><CloudSun size={18} /> Afternoon</div>
              <div className={styles.timeGrid}>
                {timeSlots.afternoon.map(time => {
                  const isOccupied = occupiedHours.includes(time);
                  return (
                    <button 
                      key={time} 
                      disabled={isOccupied}
                      className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''} ${isOccupied ? styles.timeOccupied : ''}`} 
                      onClick={() => setSelectedTime(time)}
                    >
                      {time} {isOccupied ? '(Ocupat)' : ''}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Evening */}
          {timeSlots.evening.length > 0 && (
            <>
              <div className={styles.timeGroupLabel}><Moon size={18} /> Evening</div>
              <div className={styles.timeGrid}>
                {timeSlots.evening.map(time => {
                  const isOccupied = occupiedHours.includes(time);
                  return (
                    <button 
                      key={time} 
                      disabled={isOccupied}
                      className={`${styles.timeButton} ${selectedTime === time ? styles.selectedTime : ''} ${isOccupied ? styles.timeOccupied : ''}`} 
                      onClick={() => setSelectedTime(time)}
                    >
                      {time} {isOccupied ? '(Ocupat)' : ''}
                    </button>
                  );
                })}
              </div>
            </>
          )}
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