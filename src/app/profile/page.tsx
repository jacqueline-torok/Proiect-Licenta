"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, LogOut, Mail, Phone, MapPin, Calendar, 
  Edit3, Info, X, Heart, Clock, Star, Trophy, Award, Gift, CheckCircle2, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [userData, setUserData] = useState({
    name: "", 
    email: "", 
    phone: "", 
    address: "", 
    birthday: "", 
    points: 0, 
    totalSpent: 0
  });
  const [appointments, setAppointments] = useState<any[]>([]);

  const favorites = [
    { id: 'facial-signature', category: "Facial", title: "Signature Facial", price: "$95", image: "/services/facial&skincare.jpg" },
    { id: 'massage-relaxation', category: "Massage", title: "Relaxation Massage", price: "$80", image: "/services/massage.jpg" }
  ];

  const points = userData.points;
  const isBronze = points >= 0;
  const isSilver = points >= 500;
  const isGold = points >= 1500;

  let currentTierClass = styles.bronzeTier;
  let tierName = "Bronze Member";
  let nextTierGoal = 500;
  
  if (isGold) {
    currentTierClass = styles.goldTier;
    tierName = "Gold Member";
    nextTierGoal = 1500;
  } else if (isSilver) {
    currentTierClass = styles.silverTier;
    tierName = "Silver Member";
    nextTierGoal = 1500;
  }

  const progressPercentage = isGold ? 100 : isSilver ? 50 + ((points - 500) / 1000) * 50 : (points / 500) * 50;

  useEffect(() => {
    async function getData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { data: profile } = await supabase.from('profile').select('*').eq('email', user.email).maybeSingle();
        if (profile) {
          setUserData({
            name: profile.full_name || "Client", 
            email: user.email || "", 
            points: profile.points || 0,
            phone: profile.phone || "", 
            address: profile.address || "", 
            birthday: profile.birthday || "", 
            totalSpent: profile.points || 0
          });
        }
        const { data: apts } = await supabase.from('appointments').select('*').eq('user_email', user.email).order('appointment_date', { ascending: true }).limit(2);
        if (apts) setAppointments(apts);
      } finally { setLoading(false); }
    }
    getData();
  }, [router]);

  const handleSaveUpdate = async () => {
    try {
      const { error } = await supabase.from('profile').upsert({ 
        email: userData.email, 
        full_name: userData.name, 
        phone: userData.phone, 
        address: userData.address, 
        birthday: userData.birthday 
      }, { onConflict: 'email' });
      
      if (error) throw error;
      
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.container}>
      {showSuccessToast && <div className={styles.toast}><CheckCircle2 size={18} /> Profile updated</div>}

      <nav className={styles.nav}>
        <button onClick={() => router.back()} className={styles.navBtn}>←</button>
        <span className={styles.navTitle}>Bella Profile</span>
        <button className={styles.navBtn} onClick={() => supabase.auth.signOut().then(() => router.push('/'))}><LogOut size={18} /></button>
      </nav>

      <main className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.avatarBox}>
            <div className={styles.avatar}>{userData.name.substring(0, 2).toUpperCase()}</div>
            <button className={styles.editBadge} onClick={() => setIsEditing(true)}><Edit3 size={14} /></button>
          </div>
          <h2 className={styles.userName}>{userData.name}</h2>
          <p className={styles.userEmail}>{userData.email}</p>
        </section>

        <section className={`${styles.loyaltyCard} ${currentTierClass}`}>
          <div className={styles.cardHeader}>
            <span className={styles.brand}>BELLA BEAUTY</span>
            <button className={styles.infoBtn} onClick={() => setShowMembershipModal(true)}><Info size={20} /></button>
          </div>
          <div className={styles.cardMain}>
            <span className={styles.pointsLarge}>{userData.points}</span>
            <div className={styles.tierTag}>{tierName}</div>
          </div>
          <div className={styles.cardFooter}>
            <span>Spent: ${userData.totalSpent}</span>
            <span className={styles.ratio}>$1 = 1 Point</span>
          </div>
          <Trophy className={styles.bgTrophy} size={120} />
        </section>

        <section className={styles.trackerBox}>
          <div className={styles.trackerText}>
            <span>Tier Progress</span>
            <span className={styles.accentText}>{isGold ? "Max Level" : `${nextTierGoal - points} pts to next`}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }}></div>
            <div className={`${styles.dot} ${isBronze ? styles.dotOn : ''}`} style={{ left: '0%' }}><Award size={14} /></div>
            <div className={`${styles.dot} ${isSilver ? styles.dotOn : ''}`} style={{ left: '50%' }}><Award size={14} /></div>
            <div className={`${styles.dot} ${isGold ? styles.dotOn : ''}`} style={{ left: '100%' }}><Trophy size={14} /></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.secHeader}><h3>Favorites</h3><Heart size={18} fill="#c59d71" color="#c59d71" /></div>
          <div className={styles.favGrid}>
            {favorites.map(fav => (
              <div key={fav.id} className={styles.favCard}>
                <div className={styles.favImg}><Image src={fav.image} alt={fav.title} fill style={{objectFit:'cover'}} /></div>
                <div className={styles.favInfo}>
                  <h4>{fav.title}</h4>
                  <div className={styles.favPriceRow}>
                    <span>{fav.price}</span>
                    <button className={styles.bookBtn} onClick={() => router.push(`/book/${fav.id}`)}>Book <ChevronRight size={12}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.secHeader}><h3>Visits</h3><Calendar size={18} color="#888" /></div>
          {appointments.map(apt => (
            <div key={apt.id} className={styles.aptRow}>
              <div className={styles.aptDate}><span>{new Date(apt.appointment_date).getDate()}</span></div>
              <div className={styles.aptDetails}><h4>{apt.service_name}</h4><p>{apt.appointment_time}</p></div>
              <div className={styles.aptStatus}>{apt.status}</div>
            </div>
          ))}
        </section>
      </main>

      {/* MODAL EDITARE PROFIL - ACTUALIZAT */}
      {isEditing && (
        <div className={styles.overlay} onClick={() => setIsEditing(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Edit Profile</h3>
              <button onClick={() => setIsEditing(false)}><X /></button>
            </div>
            <div className={styles.form}>
              <div className={styles.inputGroup}>
                <label><User size={16} /> Full Name</label>
                <input type="text" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label><Mail size={16} /> Email Address</label>
                <input type="email" value={userData.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className={styles.inputGroup}>
                <label><Phone size={16} /> Phone Number</label>
                <input type="tel" placeholder="(555) 000-0000" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label><MapPin size={16} /> Address</label>
                <input type="text" placeholder="Street, City, Country" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label><Calendar size={16} /> Birthday</label>
                <input type="date" value={userData.birthday} onChange={e => setUserData({...userData, birthday: e.target.value})} />
              </div>
              <button className={styles.saveBtn} onClick={handleSaveUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MEMBERSHIP */}
      {showMembershipModal && (
        <div className={styles.overlay} onClick={() => setShowMembershipModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}><h3>Membership</h3><button onClick={() => setShowMembershipModal(false)}><X /></button></div>
            <div className={styles.howBox}><h4>How it works</h4><p>1$ spent = 1 Loyalty Point. Unlock tiers for luxury rewards.</p></div>
            <div className={styles.tierList}>
              <div className={styles.tItem}><div className={styles.tIcon} style={{background:'#a87c51'}}><Award size={16}/></div><div><h5>Bronze</h5><p>0-499 points</p></div></div>
              <div className={styles.tItem}><div className={styles.tIcon} style={{background:'#bdc3c7'}}><Award size={16}/></div><div><h5>Silver</h5><p>500-1499 points</p></div></div>
              <div className={styles.tItem}><div className={styles.tIcon} style={{background:'#d4af37'}}><Award size={16}/></div><div><h5>Gold</h5><p>1500+ points</p></div></div>
            </div>
            <button className={styles.saveBtn} onClick={() => setShowMembershipModal(false)}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
}