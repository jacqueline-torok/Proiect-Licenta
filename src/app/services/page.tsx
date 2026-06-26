"use client";

import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';
import { Star, Clock, Home as HomeIcon, User, MapPin } from 'lucide-react';
import styles from './services.module.css';

const SERVICES = [
  { id: 1, category: "Hair Services", title: "Hair Styling & Cut", rating: 4.9, duration: "60 min", price: "$75", image: "/services/hairservices.jpg" },
  { id: 2, category: "Nail Services", title: "Luxury Manicure & Pedicure", rating: 5, duration: "90 min", price: "$65", image: "/services/nailservices.jpg" },
  { id: 3, category: "Facial & Skincare", title: "Signature Facial Treatment", rating: 4.8, duration: "75 min", price: "$95", image: "/services/facial&skincare.jpg" },
  { id: 4, category: "Makeup", title: "Professional Makeup Session", rating: 4.9, duration: "45 min", price: "$85", image: "/services/makeup.jpg" },
  { id: 5, category: "Massage & Wellness", title: "Relaxation Massage", rating: 5, duration: "60 min", price: "$80", image: "/services/massage.jpg" },
  { id: 6, category: "Body Treatment", title: "Full Body Waxing", rating: 4.7, duration: "90 min", price: "$120", image: "/services/bodytreatment.jpg" }
];

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Star className={styles.logoIcon} size={20} fill="#C5A47E" color="#C5A47E" />
          <span>Bella Beauty</span>
        </Link>
        <Link href="/" className={styles.exitBtn}>Exit</Link>
      </nav>

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Indulge in Luxury</h1>
        <p className={styles.heroSubtitle}>Premium beauty services tailored just for you</p>
      </header>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.list}>
          {SERVICES.map((service) => (
            <Link 
              href={`/book/${service.id}`} 
              key={service.id} 
              className={styles.serviceCard}
            >
              <div className={styles.imageContainer}>
                <Image src={service.image} alt={service.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.serviceDetails}>
                <span className={styles.category}>{service.category}</span>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <div className={styles.meta}>
                  <div className={styles.rating}><Star size={14} fill="#C5A47E" color="#C5A47E" /><span>{service.rating}</span></div>
                  <div className={styles.duration}><Clock size={14} /><span>{service.duration}</span></div>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{service.price}</span>
                  <div className={styles.selectBtnSmall}>Book</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Tab Bar folosind Link pentru stabilitate */}
      <div className={styles.tabBar}>
        <Link href="/services" className={`${styles.tabItem} ${styles.activeTab}`}>
          <HomeIcon size={24} />
          <span>Services</span>
        </Link>

        <Link href="/location" className={styles.navItem}>
          <MapPin size={24} />
          <span>Location</span>
        </Link>

        <Link href="/profile" className={styles.tabItem}>
          <User size={24} />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
}