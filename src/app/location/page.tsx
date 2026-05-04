"use client";
import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Map as MapIcon, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './location.module.css';

export default function LocationPage() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);

  // Funcția care deschide Google Maps extern pentru navigație (ca în poza ta)
  const handleGetDirections = () => {
    const address = encodeURIComponent("123 Beauty Lane, New York, NY 10001");
    // Link corect pentru a deschide direct ruta/navigația
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className={styles.fullPageContainer}>
      {/* Buton Exit */}
      <div className={styles.topHeader}>
        <button onClick={() => router.back()} className={styles.closeBtn}>
          <X size={28} />
        </button>
      </div>

      <div className={styles.contentWrapper}>
        <section className={styles.locationCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.mainTitle}>Visit Our Salon</h2>
              <p className={styles.subTitle}>Experience luxury in person</p>
            </div>
            <div className={styles.badgeIcon}>
              <MapPin size={24} color="#d4a373" />
            </div>
          </div>

          <div className={styles.infoList}>
            {/* Adresa */}
            <div className={styles.infoItem}>
              <div className={styles.iconSquare}><MapPin size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.label}>Address</span>
                <p>123 Beauty Lane, New York, NY 10001</p>
              </div>
            </div>

            {/* Telefon */}
            <div className={styles.infoItem}>
              <div className={styles.iconSquare}><Phone size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.label}>Phone</span>
                <p>(555) 123-4567</p>
              </div>
            </div>

            {/* Program */}
            <div className={styles.infoItem}>
              <div className={styles.iconSquare}><Clock size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.label}>Business Hours</span>
                <div className={styles.scheduleGrid}>
                  <div className={styles.dayLine}>
                    <span>Monday - Friday</span>
                    <span className={styles.time}>9:00 AM - 8:00 PM</span>
                  </div>
                  <div className={styles.dayLine}>
                    <span>Saturday</span>
                    <span className={styles.time}>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className={styles.dayLine}>
                    <span>Sunday</span>
                    <span className={styles.time}>10:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secțiunea de butoane (curățată) */}
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} onClick={handleGetDirections}>
              <Navigation size={20} /> Get Directions
            </button>
            <button className={styles.btnSecondary} onClick={() => setShowMap(true)}>
              <MapIcon size={20} /> View on Map
            </button>
          </div>
        </section>
      </div>

      {/* --- MODALUL CU HARTA (Previzualizare internă) --- */}
      {showMap && (
        <div className={styles.modalOverlay}>
          <div className={styles.mapModal}>
            <div className={styles.mapHeader}>
              <div className={styles.mapHeaderLeft}>
                <MapPin size={18} color="#d4a373" />
                <div>
                  <h3>Bella Beauty Salon</h3>
                  <p>123 Beauty Lane, New York, NY 10001</p>
                </div>
              </div>
              <button className={styles.mapClose} onClick={() => setShowMap(false)}>
                <X size={20}/>
              </button>
            </div>

            <div className={styles.mapIframeContainer}>
              {/* Butonul de deasupra hărții deschide tot navigația externă */}
              <button className={styles.floatingOpenBtn} onClick={handleGetDirections}>
                Open in Maps <ExternalLink size={14} />
              </button>
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617359061895!2d-73.985428!3d40.748441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU0LjQiTiA3M8KwNTknMDcuNSJX!5e0!3m2!1sen!2sro!4v1625500000000!5m2!1sen!2sro"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
              ></iframe>
            </div>

            <div className={styles.mapFooter}>
              <div className={styles.footerInfo}>
                <h4>Bella Beauty Salon</h4>
                <p>123 Beauty Lane, New York, NY 10001</p>
                <p className={styles.footerPhone}>📞 (555) 123-4567</p>
              </div>
              <button className={styles.footerDirectionsBtn} onClick={handleGetDirections}>
                <Navigation size={18} /> Directions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}