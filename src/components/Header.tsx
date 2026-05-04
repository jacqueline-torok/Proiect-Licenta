"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { User, LogOut, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // VERIFICARE: Dacă avem user ȘI user.email
      if (user && user.email) {
        const { data: profile } = await supabase
          .from('profile')
          .select('full_name')
          .eq('email', user.email) // Acum TypeScript știe sigur că email-ul există
          .maybeSingle();
        
        setUserName(profile?.full_name || user.email.split('@')[0]);
      } else {
        setUserName(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'white',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={20} color="#c5a47e" />
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold', color: '#1a1a1a' }}>Bella Beauty</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {userName ? (
          <>
            <Link href="/profile" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              textDecoration: 'none',
              color: '#1a1a1a',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: '#fdfaf8',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #f9f0ec'
            }}>
              <User size={16} color="#c5a47e" />
              {userName}
            </Link>
            <button onClick={handleLogout} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888',
              display: 'flex',
              alignItems: 'center'
            }}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link href="/login" style={{
            textDecoration: 'none',
            color: '#c5a47e',
            fontSize: '0.9rem',
            fontWeight: 700
          }}>Sign In</Link>
        )}
      </div>
    </header>
  );
}