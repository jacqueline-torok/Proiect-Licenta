"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, DollarSign, Calendar as CalendarIcon, 
  Star, ChevronLeft, ChevronRight, LogOut,
  Search, Mail, Phone, MoreVertical, CheckCircle2, Clock 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../../lib/supabase';
import styles from './admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  
  // --- STĂRI DE SECURITATE ---
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers'>('dashboard');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); 

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, avgRating: 0 });
  const [realPopularServices, setRealPopularServices] = useState<any[]>([]);
  const [realRevenueTrend, setRealRevenueTrend] = useState<any[]>([]);

  // --- EFFECT 1: VERIFICARE STRICTĂ ROL ADMIN ---
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Citim coloana 'role' din tabela profile pentru user-ul curent
        const { data: profile, error } = await supabase
          .from('profile')
          .select('role')
          .eq('email', user.email)
          .single();

        if (error || !profile || profile.role !== 'admin') {
          alert("Acces restricționat! Această zonă este dedicată exclusiv administratorilor.");
          router.push('/'); 
          return;
        }

        // Dacă a trecut de verificare, îi permitem accesul
        setIsAdmin(true);
        // Încărcăm datele abia după ce știm sigur că este Admin
        fetchAdminData();
      } catch (err) {
        router.push('/');
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAdmin();
  }, [router]);

  useEffect(() => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    setWeekDays(days);
  }, [selectedDate]);

  const changeWeek = (direction: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + (direction * 7));
    setSelectedDate(next);
  };

  const getCustomerStats = (email: string) => {
    if (!email) return { totalVisits: 0, avgRating: 0, lastVisit: 'N/A', nextApt: 'None', favService: 'N/A', activity: [] };
    const cleanEmail = email.toLowerCase().trim();
    const customerApts = appointments.filter(apt => apt.user_email?.toLowerCase().trim() === cleanEmail);
    const customerReviews = reviews.filter(rev => rev.user_email?.toLowerCase().trim() === cleanEmail);
    const completedApts = customerApts.filter(apt => apt.status?.toLowerCase() === 'completed');
    const lastVisitDate = completedApts.length > 0 ? new Date(completedApts[0].appointment_date).toLocaleDateString() : 'N/A';
    const upcoming = customerApts.filter(apt => apt.status !== 'completed' && new Date(apt.appointment_date) >= new Date()).sort((a,b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    const serviceCounts: any = {};
    customerApts.forEach(a => { serviceCounts[a.service_name] = (serviceCounts[a.service_name] || 0) + 1; });
    const fav = Object.keys(serviceCounts).length > 0 ? Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b) : 'N/A';
    
    const activity = [
      ...completedApts.slice(0, 3).map(a => ({ 
        text: `A vizitat salonul pentru ${a.service_name}`, 
        date: a.appointment_date, 
        icon: <CheckCircle2 size={14}/>, 
        color: '#c5a47e' 
      })),
      ...customerReviews.slice(0, 3).map(r => ({ 
        text: `A lăsat ${r.rating}★: "${r.comment || 'Fără comentariu'}"`, 
        date: r.created_at, 
        icon: <Star size={14}/>, 
        color: '#ff85a1' 
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { totalVisits: completedApts.length, avgRating: Number((customerReviews.length > 0 ? (customerReviews.reduce((acc, curr) => acc + curr.rating, 0) / customerReviews.length) : 0).toFixed(1)), lastVisit: lastVisitDate, nextApt: upcoming.length > 0 ? new Date(upcoming[0].appointment_date).toLocaleDateString() : 'None', favService: fav, activity };
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
      fetchAdminData(); 
    } catch (err: any) { alert(err.message); }
  };

  async function fetchAdminData() {
    try {
      const [profilesRes, appointmentsRes, reviewsRes] = await Promise.all([
        supabase.from('profile').select('*').order('full_name', { ascending: true }),
        supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesRes.data && appointmentsRes.data) {
        setCustomers(profilesRes.data);
        if (!selectedCustomer) setSelectedCustomer(profilesRes.data[0]);

        const appointmentsWithNames = appointmentsRes.data.map(apt => {
          const profile = profilesRes.data.find(p => p.email === apt.user_email);
          return { ...apt, full_name: profile ? profile.full_name : "Anonymous Client" };
        });
        setAppointments(appointmentsWithNames);

        const serviceCounts: { [key: string]: number } = {};
        const monthlyRevenue: { [key: string]: number } = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0 };

        appointmentsRes.data.forEach((apt: any) => {
          const name = apt.service_name || "Unknown";
          serviceCounts[name] = (serviceCounts[name] || 0) + 1;
          if (apt.appointment_date) {
            const date = new Date(apt.appointment_date);
            const monthName = date.toLocaleString('en-US', { month: 'short' });
            if (monthlyRevenue[monthName] !== undefined) monthlyRevenue[monthName] += 50; 
          }
        });

        setRealPopularServices(Object.keys(serviceCounts).map(name => ({ name, value: serviceCounts[name] })).sort((a, b) => b.value - a.value).slice(0, 5));
        setRealRevenueTrend(Object.keys(monthlyRevenue).map(month => ({ name: month, value: monthlyRevenue[month] })));
        setStats(prev => ({ ...prev, totalRevenue: profilesRes.data.reduce((acc, curr) => acc + (curr.points || 0), 0) }));
      }

      if (reviewsRes.data) {
        setReviews(reviewsRes.data); 
        const totalRating = reviewsRes.data.reduce((acc, curr) => acc + curr.rating, 0);
        setStats(prev => ({ ...prev, avgRating: Number(reviewsRes.data.length > 0 ? (totalRating / reviewsRes.data.length).toFixed(1) : 0) }));
      }
    } catch (err) { console.error(err); }
  };

  const dailyAppointments = appointments.filter(apt => {
    const d = new Date(apt.appointment_date);
    return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  }).sort((a,b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));

  // --- BARIERĂ VIZUALĂ: Împiedică randarea elementelor dacă userul nu este verificat ca admin ---
  if (checkingAccess) {
    return <div className={styles.loader}>Securing connection...</div>;
  }

  if (!isAdmin) {
    return null; 
  }

  return (
    <div className={styles.adminWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}><div className={styles.logoIcon}>✨</div><div><h1>Bella Beauty</h1><span>Admin Portal</span></div></div>
        <nav className={styles.sideNav}>
          <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /> Dashboard</button>
          <button className={`${styles.navItem} ${activeTab === 'customers' ? styles.active : ''}`} onClick={() => setActiveTab('customers')}><Users size={20} /> Customers</button>
        </nav>
        <button className={styles.exitBtn} onClick={() => router.push('/')}><LogOut size={18} /> Exit Admin</button>
      </aside>

      <main className={styles.mainContent}>
        {activeTab === 'dashboard' ? (
          <div className={styles.tabFadeIn}>
             <div className={styles.statsGrid}>
               <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign color="#c5a47e" />} />
               <StatCard title="Total Appointments" value={appointments.length.toString()} icon={<CalendarIcon color="#ff85a1" />} />
               <StatCard title="Total Clients" value={customers.length.toString()} icon={<Users color="#c5a47e" />} />
               <StatCard title="Average Rating" value={stats.avgRating.toString()} icon={<Star color="#ff85a1" />} />
             </div>

             <section className={styles.scheduleSection} style={{ marginBottom: '30px' }}>
               <header className={styles.calendarHeader}>
                 <div><h3>Today's Schedule</h3><p>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                 <div className={styles.calendarNav}><button onClick={() => changeWeek(-1)}><ChevronLeft size={18}/></button><button onClick={() => changeWeek(1)}><ChevronRight size={18}/></button></div>
               </header>
               <div className={styles.weekBar}>
                 {weekDays.map((day, i) => {
                   const isSelected = day.getDate() === selectedDate.getDate() && day.getMonth() === selectedDate.getMonth();
                   return (
                     <div key={i} className={`${styles.dayCard} ${isSelected ? styles.activeDay : ''}`} onClick={() => setSelectedDate(day)}>
                       <span className={styles.dayName}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                       <span className={styles.dayNum}>{day.getDate()}</span>
                     </div>
                   );
                 })}
               </div>
               <div className={styles.appointmentsList}>
                 {dailyAppointments.length > 0 ? dailyAppointments.map((apt) => (
                   <AppointmentRow key={apt.id} apt={apt} onComplete={(id: string) => updateAppointmentStatus(id, 'completed')} />
                 )) : <p className={styles.emptyText}>No appointments for this day.</p>}
               </div>
             </section>

             <div className={styles.chartCard} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Revenue Trend (Real-time)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realRevenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#c5a47e" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: "#c5a47e", strokeWidth: 2, stroke: "#fff" }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Popular Services (Real-time)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={realPopularServices} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 60 }} 
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10}
                    interval={0}        
                    angle={-45}         
                    textAnchor="end"   
                    height={60}        
                  />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: '#fdf5f0' }} />
                  <Bar 
                    dataKey="value" 
                    fill="#fbd4ca" 
                    radius={[10, 10, 0, 0]} 
                    barSize={30} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className={`${styles.customersLayout} ${styles.tabFadeIn}`}>
             <div className={styles.customersListSide}>
                <div className={styles.searchBox}><Search size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div>
                <div className={styles.scrollableList}>
                  {customers.filter(c => c.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                    const cs = getCustomerStats(c.email);
                    return (
                      <div key={c.id} className={`${styles.customerCardSmall} ${selectedCustomer?.id === c.id ? styles.selected : ''}`} onClick={() => setSelectedCustomer(c)}>
                        <h4>{c.full_name}</h4>
                        <div className={styles.cardFooter}>{renderStars(cs.avgRating)}<span>{c.points} pts</span></div>
                      </div>
                    );
                  })}
                </div>
             </div>
             <div className={styles.customerDetailsSide}>
                {selectedCustomer && (() => {
                  const cs = getCustomerStats(selectedCustomer.email);
                  return (
                    <div className={styles.detailsContent}>
                      <div className={styles.detailsHeader}><h2>{selectedCustomer.full_name}</h2><div className={styles.contactInfoLine}><span><Mail size={14}/> {selectedCustomer.email}</span></div></div>
                      <div className={styles.detailsStatsGrid}>
                        <DetailStat icon={<CalendarIcon size={18}/>} value={cs.totalVisits.toString()} label="Total Visits" />
                        <DetailStat icon={<DollarSign size={18}/>} value={`$${selectedCustomer.points}`} label="Total Spent" />
                        <DetailStat icon={<Star size={18}/>} value={<div style={{display:'flex', alignItems:'center', gap:'8px'}}><strong>{cs.avgRating}</strong>{renderStars(cs.avgRating)}</div>} label="Rating" />
                        <DetailStat icon={<Clock size={18}/>} value={cs.lastVisit} label="Last Visit" />
                      </div>
                      <div className={styles.infoRow}>
                        <div className={styles.infoBox}><h3>Appointment Info</h3><div className={styles.infoRowItem}><span>Next</span><strong>{cs.nextApt}</strong></div><div className={styles.infoRowItem}><span>Favorite</span><strong>{cs.favService}</strong></div></div>
                        <div className={styles.infoBox}>
                        <h3>Recent Activity</h3>
                        <div className={styles.activityList}>
                            {cs.activity.map((act, i) => (
                            <div key={i} className={styles.activityRow} style={{ marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ color: act.color, marginTop: '2px' }}>{act.icon}</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{act.text}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#bbb' }}>
                                    {new Date(act.date).toLocaleDateString('ro-RO')}
                                </span>
                                </div>
                            </div>
                            ))}
                            {cs.activity.length === 0 && (
                            <p style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic' }}>
                                Nu există activitate recentă pentru acest client.
                            </p>
                            )}
                        </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className={styles.statCard}><div className={styles.iconBox}>{icon}</div><div className={styles.statBody}><span className={styles.statValue}>{value}</span><span className={styles.statTitle}>{title}</span></div></div>
  );
}

function AppointmentRow({ apt, onComplete }: { apt: any, onComplete: (id: string) => void }) {
  const isCompleted = apt.status?.toLowerCase() === 'completed';
  return (
    <div className={`${styles.aptItem} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.aptTimeColumn}><strong>{apt.appointment_time}</strong><span>60 min</span></div>
      <div className={styles.aptInfoColumn}><h4>{apt.full_name}</h4><p>{apt.service_name}</p></div>
      <div className={styles.aptActionColumn}>
        <span className={`${styles.statusBadge} ${styles[apt.status?.toLowerCase().replace(' ', '_') || 'upcoming']}`}>{apt.status || 'Upcoming'}</span>
        {!isCompleted && <button onClick={() => onComplete(apt.id)} className={styles.checkBtn}><CheckCircle2 size={20} color="#c5a47e"/></button>}
      </div>
    </div>
  );
}

function DetailStat({ icon, value, label }: any) {
  return (
    <div className={styles.detailStatBox}><div className={styles.statIconWrapper}>{icon}</div><div className={styles.statValueBig}>{value}</div><span className={styles.statLabelSmall}>{label}</span></div>
  );
}

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} fill={star <= rounded ? "#c5a47e" : "transparent"} color={star <= rounded ? "#c5a47e" : "#e0e0e0"} />
      ))}
    </div>
  );
}