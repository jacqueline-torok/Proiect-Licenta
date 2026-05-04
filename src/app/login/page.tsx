"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert("Eroare la autentificare: " + error.message);
        setLoading(false);
      } else if (data.user) {
        router.refresh(); 
        // Redirecționare către pagina de servicii/booking
        router.push('/services'); 
      }
    } catch (err) {
      alert("A apărut o eroare neașteptată.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <div className={styles.logoBadge}>✨</div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue your beauty journey</p>
      </div>

      <div className={styles.loginCard}>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}><Mail size={14} /> Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><Lock size={14} /> Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.signInBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}