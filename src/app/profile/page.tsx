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

  // --- STĂRI PENTRU RATING ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

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

        const { data: apts } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_email', user.email)
          .order('appointment_date', { ascending: false });
        
        if (apts) setAppointments(apts);
      } catch (err) {
        // Comentat pentru a preveni erori stricte de linting la build
        // console.error("Error fetching data:", err);
      } finally { setLoading(false); }
    }
    getData();
  }, [router]);

  // --- TRIMITERE RATING ---
  const handleSubmitReview = async () => {
    if (rating === 0) return alert("Selectează o notă!");
    try {
      const { error: reviewError } = await supabase.from('reviews').insert([{
        user_email: userData.email,
        rating: rating,
        comment: comment,
        service_name: selectedApt.service_name,
        created_at: new Date()
      }]);

      if (reviewError) throw reviewError;

      const { error: aptError } = await supabase
        .from('appointments')
        .update({ reviewed: true })
        .eq('id', selectedApt.id);

      if (aptError) throw aptError;

      setAppointments(prev => 
        prev.map(a => a.id === selectedApt.id ? { ...a, reviewed: true } : a)
      );
      
      setShowReviewModal(false);
      setRating(0);
      setComment('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e: any) { 
      alert("Eroare la trimiterea feedback-ului: " + e.message); 
    }
  };

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
      {showSuccessToast && <div className={styles.toast}><CheckCircle2 size={18} /> Success!</div>}

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
          <div className={styles.appointmentsWrapper}>
            {appointments.length > 0 ? appointments.map(apt => (
              <div key={apt.id} className={styles.aptRow}>
                <div className={styles.aptDate}>
                  <span>{new Date(apt.appointment_date).getDate()}</span>
                </div>
                <div className={styles.aptDetails}>
                  <h4>{apt.service_name}</h4>
                  <p>{apt.appointment_time || apt.apoiment_time}</p>
                </div>
                
                <div className={styles.aptStatusArea}>
                  {apt.status === 'completed' ? (
                    apt.reviewed ? (
                      <div className={styles.aptStatus} style={{ color: '#c59d71', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Rated
                      </div>
                    ) : (
                      <button 
                        className={styles.reviewBtn}
                        onClick={() => { setSelectedApt(apt); setShowReviewModal(true); }}
                      >
                        <Star size={14} fill="currentColor" /> Rate
                      </button>
                    )
                  ) : (
                    <div className={styles.aptStatus}>{apt.status || 'Upcoming'}</div>
                  )}
                </div>
              </div>
            )) : (
              <p style={{textAlign: 'center', padding: '20px', color: '#999'}}>No visits found.</p>
            )}
          </div>
        </section>
      </main>

      {/* --- MODAL PENTRU RATING --- */}
      {showReviewModal && (
        <div className={styles.overlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Rate Service</h3>
              <button onClick={() => setShowReviewModal(false)}><X /></button>
            </div>
            <div className={styles.reviewBody}>
              <p>Cum a fost vizita pentru <strong>{selectedApt?.service_name}</strong>?</p>
              <div className={styles.starsContainer} style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Star 
                      size={32} 
                      fill={(hover || rating) >= star ? "#c59d71" : "transparent"} 
                      color={(hover || rating) >= star ? "#c59d71" : "#ddd"} 
                    />
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Spune-ne părerea ta despre acest serviciu..." 
                className={styles.reviewInput}
                style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className={styles.saveBtn} onClick={handleSubmitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITARE PROFIL */}
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
                <input type="tel" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label><MapPin size={16} /> Address</label>
                <input type="text" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} />
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

      {/* ==========================================================================
         MODAL MEMBERSHIP RESTRUCTURAT ȘI CORIJAT PENTRU ALINIERE PREMIUM
         ========================================================================== */}
      {showMembershipModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMembershipModal(false)}>
          <div className={styles.membershipCard} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowMembershipModal(false)}><X size={20} /></button>
            
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Membership Tiers</h2>
              <p className={styles.modalSubtitle}>Earn 1 point for every $1 spent at Bella Beauty</p>
            </header>

            <div className={styles.tiersContainer}>
              {/* Bronze */}
              <div className={`${styles.tierRow} ${styles.bronzeTier}`}>
                <div className={styles.tierBadge} style={{ color: '#a87c51' }}><Award size={22} fill="currentColor" /></div>
                <div className={styles.tierInfo}>
                  <h3>Bronze Member</h3>
                  <span>0 - 499 points</span>
                </div>
              </div>

              {/* Silver */}
              <div className={`${styles.tierRow} ${styles.silverTier}`}>
                <div className={styles.tierBadge} style={{ color: '#bdc3c7' }}><Award size={22} fill="currentColor" /></div>
                <div className={styles.tierInfo}>
                  <h3>Silver Member</h3>
                  <span>500 - 1499 points</span>
                </div>
              </div>

              {/* Gold */}
              <div className={`${styles.tierRow} ${styles.goldTier}`}>
                <div className={styles.tierBadge} style={{ color: '#d4af37' }}><Trophy size={22} fill="currentColor" /></div>
                <div className={styles.tierInfo}>
                  <h3>Gold Member</h3>
                  <span>1500+ points</span>
                </div>
              </div>
            </div>

            <button className={styles.gotItBtn} onClick={() => setShowMembershipModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}