"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import styles from './register.module.css';

export default function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Creăm utilizatorul în sistemul de Autentificare
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            full_name: formData.fullName, 
            phone: formData.phone 
          } 
        }
      });
      
      if (authError) throw authError;

      if (authData.user) {
        // 2. Creăm rândul în tabelul 'profile' (pentru pagina de profil)
        const { error: profileError } = await supabase
          .from('profile')
          .insert([
            { 
              email: formData.email, 
              full_name: formData.fullName, 
              phone: formData.phone,
              points: 0,
              address: "",
              birthday: ""
            }
          ]);

        if (profileError) {
          console.error("Eroare profil:", profileError.message);
        }

        // 3. Redirecționăm direct la profil
        // Dacă Email Confirmation e ON, va trebui să verifice mail-ul mai întâi.
        // Dacă e OFF, va fi logat instant.
        router.push('/profile');
      }
    } catch (error: any) {
      alert("Eroare: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <div className={styles.logoBadge}><span>✨</span></div>
        <h1 className={styles.title}>Join Bella Beauty</h1>
        <p className={styles.subtitle}>Create your account and start your journey</p>
      </div>

      <div className={styles.registerCard}>
        <div className={styles.rewardsBanner}>
          <div className={styles.rewardsIcon}>🎁</div>
          <div className={styles.rewardsText}>
            <h4>Start Earning Rewards Today!</h4>
            <p>Join now and earn 1 point for every $1 spent.</p>
          </div>
        </div>

        <form onSubmit={handleSignUp} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}><User size={14}/> Full Name</label>
            <input 
              type="text" 
              placeholder="Emma Thompson" 
              className={styles.input} 
              required
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><Mail size={14}/> Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className={styles.input} 
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><Phone size={14}/> Phone Number</label>
            <input 
              type="tel" 
              placeholder="(555) 123-4567" 
              className={styles.input} 
              required
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><Lock size={14}/> Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create a strong password" 
                className={styles.input} 
                required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.createBtn} disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}