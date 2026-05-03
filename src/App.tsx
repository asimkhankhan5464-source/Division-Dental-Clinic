/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  User, 
  Smile, 
  ShieldCheck, 
  Award, 
  Zap, 
  Menu, 
  X,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  LogOut,
  LogIn,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  createBooking, 
  testConnection, 
  syncUserProfile, 
  getUserBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  loginWithEmail,
  signupWithEmail,
  getBookingsByDate
} from './lib/firebaseUtils';

const AdminPortal = ({ user, isAdmin }: { user: FirebaseUser | null, isAdmin: boolean }) => {
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    fullName: '',
    phoneNumber: '',
    userEmail: '',
    service: 'General Consultation',
    date: '',
    time: '09:00 AM',
    notes: ''
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAll();
    }
  }, [isAdmin]);

  const handleManualBooking = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createBooking({
        ...newBooking,
        status: 'confirmed'
      });
      setIsAddingBooking(false);
      setNewBooking({
        fullName: '',
        phoneNumber: '',
        userEmail: '',
        service: 'General Consultation',
        date: '',
        time: '09:00 AM',
        notes: ''
      });
      await fetchAll();
    } catch (err) {
      alert('Failed to create manual booking');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    console.log('Admin changing status:', { id, newStatus });
    try {
      await updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('handleStatusChange error:', err);
      alert('Failed to update status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-brand-teal text-brand-teal flex items-center justify-center font-display text-4xl italic mx-auto mb-6">D</div>
          <h2 className="font-display text-3xl text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Authorized Personnel Only</p>
          
          <div className="flex flex-col gap-4 mt-8">
            {!user && (
              <button 
                onClick={() => {
                  const authBtn = document.querySelector('[data-signin-btn]') as HTMLButtonElement;
                  if (authBtn) authBtn.click();
                }}
                className="bg-brand-teal text-white px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-900 transition-all"
              >
                Sign In to Continue
              </button>
            )}
            <button 
              onClick={() => window.location.hash = ''} 
              className="text-brand-teal font-black text-[10px] uppercase tracking-widest border-b border-brand-teal mx-auto w-fit"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-[100px]">
      <nav className="bg-white border-b border-slate-200 py-6 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="text-brand-teal font-display text-2xl italic border border-brand-teal w-8 h-8 flex items-center justify-center text-sm">D</div>
          <span className="font-display text-xl">Dental <span className="italic text-brand-accent">Management</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hidden md:block">{user?.email}</span>
          <button 
            onClick={() => { signOut(auth); window.location.hash = ''; }}
            className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 flex items-center gap-2"
          >
           <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display tracking-tight text-slate-900">Patient Dashboard</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-2">Manage appointments & requests</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsAddingBooking(true)}
              className="flex-1 md:flex-none justify-center bg-slate-900 text-white px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2"
            >
              Add New Booking
            </button>
            <div className="bg-white p-4 border border-slate-200 hidden sm:flex gap-8">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-display">{bookings.length}</p>
              </div>
              <div className="w-[1px] bg-slate-100 h-10"></div>
              <div>
                <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Pending</p>
                <p className="text-2xl font-display text-brand-accent">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center uppercase tracking-widest text-xs font-bold text-slate-400 animate-pulse">Syncing Records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Patient Details</th>
                    <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500 text-center">Service</th>
                    <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Appointment</th>
                    <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500 text-center">Status</th>
                    <th className="text-right px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6 min-w-[200px]">
                        <div className="font-semibold text-slate-900">{booking.fullName || booking.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{booking.userEmail || booking.email}</div>
                      </td>
                      <td className="px-6 py-6 text-center italic text-sm text-slate-600 min-w-[150px]">
                        {booking.service}
                      </td>
                      <td className="px-6 py-6 font-mono text-xs min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-brand-teal" /> {booking.date || booking.appointmentDate || 'TBD'}
                        </div>
                        <div className="flex items-center gap-2 mt-1 opacity-60">
                          <Clock className="w-3 h-3" /> {booking.time || booking.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-3 text-[8px] uppercase tracking-widest font-bold">
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="bg-brand-teal text-white px-4 py-2 hover:bg-slate-900 transition-colors uppercase tracking-widest font-bold text-[9px]"
                            >
                              Approve
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="border border-red-100 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest font-bold text-[9px]"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && bookings.length === 0 && <div className="py-20 text-center text-slate-400 text-xs italic">No clinical records found.</div>}
        </div>
      </main>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {isAddingBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl p-8 md:p-12 shadow-2xl relative overflow-y-auto max-h-[90vh] rounded-3xl"
            >
              <button 
                onClick={() => setIsAddingBooking(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 p-2"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="font-display text-3xl mb-2">Create Record</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-10">Manual patient entry</p>

              <form onSubmit={handleManualBooking} className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Patient Name</label>
                  <input 
                    type="text" 
                    required
                    value={newBooking.fullName}
                    onChange={e => setNewBooking({...newBooking, fullName: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newBooking.userEmail}
                    onChange={e => setNewBooking({...newBooking, userEmail: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newBooking.phoneNumber}
                    onChange={e => setNewBooking({...newBooking, phoneNumber: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Clinical Service</label>
                  <select 
                    value={newBooking.service}
                    onChange={e => setNewBooking({...newBooking, service: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm h-[54px] rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  >
                    <option>General Consultation</option>
                    <option>Cleaning & Checkup</option>
                    <option>Cosmetic Treatment</option>
                    <option>Emergency Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Appointment Date</label>
                  <input 
                    type="date" 
                    required
                    value={newBooking.date}
                    onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Time Slot</label>
                  <select 
                    value={newBooking.time}
                    onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border p-4 text-sm h-[54px] rounded-xl focus:bg-white focus:border-brand-teal outline-none transition-all"
                  >
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[11px] uppercase tracking-widest font-bold hover:bg-brand-teal transition-all">
                    Finalize Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
// --- Components ---

const AuthModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: (type: 'login' | 'signup' | 'admin') => void }) => {
  const [authType, setAuthType] = useState<'login' | 'signup' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('Attempting Google Login...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google Login Success:', result.user.email);
      
      const adminEmails = ['asimmidadkhel@gmail.com'];
      const isUserAdmin = adminEmails.includes(result.user.email || '');
      
      if (authType === 'admin' && !isUserAdmin) {
        await auth.signOut();
        throw new Error('This Google account is not authorized as an admin.');
      }
      
      onSuccess?.(authType === 'admin' ? 'admin' : 'login');
      onClose();
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Login popup blocked. Please enable popups in browser settings.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add your Vercel URL to "Authorized Domains" in Firebase Console.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login window was closed before completion.');
      } else {
        setError(`Google login error: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (authType === 'login' || authType === 'admin') {
        await loginWithEmail(email, password);
        const adminEmails = ['asimmidadkhel@gmail.com'];
        if (authType === 'admin' && !adminEmails.includes(auth.currentUser?.email || '')) {
          await auth.signOut();
          throw new Error('This account is not authorized as an admin.');
        }
      } else {
        await signupWithEmail(email, password, name);
      }
      onSuccess?.(authType);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you haven\'t created an account yet, please use the "Sign Up" tab first.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="bg-white w-full max-w-2xl p-6 md:p-12 shadow-2xl relative rounded-[2rem] md:rounded-[3rem] overflow-hidden mx-4 max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-300 hover:text-slate-900 transition-colors p-2 z-20"
            >
              <X className="w-6 h-6 md:w-8 md:w-8" />
            </button>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative">
              <div className="md:w-1/2 flex flex-col justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-brand-teal text-brand-teal flex items-center justify-center font-display text-xl md:text-2xl italic mb-6 md:mb-8 bg-white">D</div>
                <h2 className="font-display text-3xl md:text-4xl text-slate-900 mb-3 md:mb-4 tracking-tight leading-tight">
                  {authType === 'admin' ? 'Authorized Access' : (authType === 'login' ? 'Reserved Welcome' : 'Join the Studio')}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 md:mb-8 font-light italic">
                  Experience a higher standard of clinical care in a curated environment designed for your serenity.
                </p>
                
                <div className="space-y-4">
                  <div className="flex bg-slate-50 p-1 rounded-2xl">
                    <button 
                      onClick={() => setAuthType('login')}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all ${authType === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setAuthType('signup')}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all ${authType === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                  {authType === 'admin' ? (
                    <div className="text-center py-2">
                       <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Clinical Administrator Portal</p>
                       <button onClick={() => setAuthType('login')} className="text-[9px] text-slate-400 underline mt-1">Return to Patient Login</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAuthType('admin')}
                      className="w-full py-2 text-[8px] uppercase tracking-widest text-slate-300 hover:text-red-400 transition-colors"
                    >
                      Administrator Login
                    </button>
                  )}
                </div>
              </div>

              <div className="md:w-1/2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-50 md:pl-12">
                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                  {authType === 'signup' && (
                    <div>
                      <label className="block text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 md:mb-2 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border-slate-100 border p-3.5 md:p-4 text-sm rounded-xl md:rounded-2xl focus:bg-white focus:border-brand-teal outline-none transition-all placeholder:text-slate-300" 
                        placeholder="e.g. Julian Henderson"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 md:mb-2 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 border p-3.5 md:p-4 text-sm rounded-xl md:rounded-2xl focus:bg-white focus:border-brand-teal outline-none transition-all placeholder:text-slate-300"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 md:mb-2 ml-1">Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 border p-3.5 md:p-4 text-sm rounded-xl md:rounded-2xl focus:bg-white focus:border-brand-teal outline-none transition-all placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                  </div>

                  {error && <p className="text-red-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-center mt-2">{error}</p>}

                  <button 
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] uppercase tracking-widest font-bold hover:bg-brand-teal transition-all shadow-lg flex items-center justify-center active:scale-[0.98]"
                  >
                    {isLoading ? 'Authenticating...' : (authType === 'login' ? 'Sign In' : (authType === 'admin' ? 'Admin Login' : 'Create Account'))}
                  </button>

                  {(authType !== 'admin' || true) && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
                        <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold"><span className="bg-white px-4 text-slate-300">or</span></div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full border border-slate-100 flex items-center justify-center gap-3 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                        {authType === 'admin' ? 'Login Admin with Google' : 'Continue with Google'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ user, isAdmin, onSignInClick }: { user: FirebaseUser | null, isAdmin: boolean, onSignInClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Services', href: '#services' },
    { name: 'Results', href: '#results' },
    { name: 'Philosophy', href: '#about' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-4 bg-white shadow-sm' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={`w-8 h-8 border flex items-center justify-center font-display text-xl italic transition-all ${isScrolled ? 'border-brand-teal text-brand-teal' : 'border-brand-teal text-brand-teal'}`}>
            D
          </div>
          <p className={`font-display text-xl tracking-tight leading-none transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            Division <span className="italic text-brand-accent">Dental</span>
          </p>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {menuItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className={`text-[11px] uppercase font-bold tracking-widest transition-all hover:text-brand-accent ${isScrolled ? 'text-slate-600' : 'text-slate-900'}`}
            >
              {item.name}
            </a>
          ))}
          
          <div className="flex items-center gap-6 ml-4">
            {user ? (
               <div className="flex items-center gap-6">
                  {isAdmin && (
                    <a href="#admin" className={`text-[11px] uppercase tracking-widest font-bold text-brand-teal hover:text-brand-accent transition-colors`}>
                       Admin Portal
                    </a>
                  )}
                  <a href="#my-bookings" className={`text-[11px] uppercase tracking-widest font-bold hover:text-brand-accent transition-colors ${isScrolled ? 'text-slate-600' : 'text-slate-900'}`}>
                     My Dashboard
                  </a>
                  <button 
                    onClick={() => signOut(auth)}
                    className="text-[11px] uppercase tracking-widest font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Log Out
                  </button>
               </div>
            ) : (
              <button 
                onClick={onSignInClick}
                data-signin-btn
                className={`text-[11px] uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-xl transition-all ${isScrolled ? 'bg-slate-900 text-white hover:bg-brand-teal' : 'bg-brand-teal text-white hover:bg-slate-900'}`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className={`lg:hidden p-3 rounded-xl ${isScrolled ? 'text-slate-900 bg-slate-50' : 'text-brand-teal bg-white/10'}`}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden bg-slate-900 flex flex-col pt-safe px-8 pb-12"
          >
            <div className="flex justify-between items-center py-8 mb-12">
              <span className="font-display text-2xl text-white">Division <span className="text-brand-accent italic">Dental</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex flex-col gap-10 flex-1">
              {menuItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-display text-white"
                >
                  {item.name}
                </a>
              ))}
              {user && (
                <a href="#my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-display text-brand-teal">Account Dashboard</a>
              )}
            </div>

            <div className="pt-10 border-t border-white/10 space-y-4">
              {user ? (
                <button 
                  onClick={() => { signOut(auth); setIsMobileMenuOpen(false); }}
                  className="w-full bg-white/5 text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Logout Session
                </button>
              ) : (
                <button 
                  onClick={() => { onSignInClick(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-brand-accent text-slate-900 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Identication
                </button>
              )}
              <a href="#book" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-brand-teal text-white text-center py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                Book Appointment
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-32 overflow-hidden bg-brand-soft">
      <div className="absolute top-[20%] left-[-5%] w-[30%] h-[40%] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1 pt-12 lg:pt-0"
        >
          <div className="inline-flex items-center gap-4 mb-8">
            <span className="w-12 h-[1px] bg-brand-accent"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-teal/60">Professional Excellence since 2009</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-medium text-slate-900 leading-tight tracking-tight mb-8">
            Advanced Care <br />
            <span className="italic text-brand-teal">for a Brighter</span> <br />
            Future.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
            Leading the way in premium dental care in Chicago. Combining masterful technique with a serene environment for your comfort.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-stretch md:items-center">
            <motion.a 
              href="#book" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-teal text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all text-center shadow-lg hover:shadow-xl"
            >
              Book Appointment
            </motion.a>
            <a 
              href="#services" 
              className="text-[11px] uppercase font-bold tracking-widest text-slate-400 hover:text-brand-teal transition-colors text-center py-4"
            >
              Our Services
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative aspect-square overflow-hidden rounded-[3rem] shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=2070&auto=format&fit=crop" 
              alt="Sophisticated Dental Studio" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="absolute -bottom-8 -left-8 bg-white p-6 md:p-10 shadow-xl rounded-3xl border border-slate-50 hidden md:block">
            <div className="flex items-center gap-1 mb-2 text-brand-accent">
               <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
            </div>
            <p className="font-display text-xl text-slate-900 leading-tight">
              "Amazing care and <br /> beautiful results."
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-4 font-bold">Verified Patient</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TrustSignals = () => {
  const stats = [
    { value: '5000+', label: 'Clinical Treatments' },
    { value: '★★★★★', label: 'Patient Reviews' },
    { value: '15+', label: 'Years Experience' },
    { value: 'Premier', label: 'Studio Standards' },
  ];

  return (
    <section className="py-12 md:py-16 bg-brand-soft relative z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-between items-center gap-y-12 gap-x-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center md:items-start flex-1 min-w-[140px] md:border-l border-slate-100 md:pl-8 first:border-none">
              <h3 className={`text-4xl md:text-5xl font-display italic text-brand-teal mb-2 leading-none ${stat.value.includes('★') ? 'text-brand-accent h-10 md:h-12 flex items-center' : ''}`}>{stat.value}</h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    { 
      title: 'General Dentistry', 
      desc: 'Comprehensive checkups, cleanings, and preventative care for all ages.',
      icon: <Smile className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Cosmetic Dentistry', 
      desc: 'Expert veneers, bonding, and aesthetic solutions for a perfect smile.',
      icon: <Award className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Teeth Whitening', 
      desc: 'Safe, effective in-office whitening for noticeably brighter results.',
      icon: <Zap className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Dental Implants', 
      desc: 'Permanent, natural-looking tooth replacements to restore function.',
      icon: <CheckCircle2 className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Orthodontics', 
      desc: 'Modern Invisalign and braces for perfectly aligned dental health.',
      icon: <ShieldCheck className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Emergency Care', 
      desc: 'Same-day emergency dental appointments for immediate relief.',
      icon: <Phone className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=600&auto=format&fit=crop'
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Our Services</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Professional treatments delivered with precision and care in our modern boutique studio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {services.map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-[2rem] overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-500 group"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-teal shadow-sm mb-6 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-display font-medium text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {service.desc}
                </p>
                <button className="text-brand-teal font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8 leading-tight">Crafting Smiles <br /> with Precision.</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              At Division Dental, we believe dentistry is an art form. Our studio combines years of clinical expertise with the latest dental technologies to provide a level of care that is both comprehensive and personal.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-4xl font-display text-brand-teal mb-2">15+</p>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-display text-brand-accent mb-2">10k</p>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Smiles Created</p>
              </div>
            </div>
            <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-teal transition-all shadow-lg text-center w-full md:w-auto">
              Meet Our Team
            </button>
          </motion.div>
          <div className="relative">
             <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" alt="Our Practice" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
             <div className="absolute -bottom-10 -right-10 bg-brand-teal text-white p-10 rounded-3xl shadow-xl hidden md:block">
               <p className="font-display text-3xl mb-1 italic">Quality Care</p>
               <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Guaranteed Results</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    { title: 'Digital Precision', desc: 'Surgical planning with advanced 3D scanning and sub-millimeter clinical accuracy.' },
    { title: 'Boutique Space', desc: 'A curated environment where sensory comfort and clinical rigor find internal harmony.' },
    { title: 'Master Artistry', desc: 'Bespoke restorative techniques that balance biological health with aesthetic vision.' },
    { title: 'Concierge Care', desc: 'Same-day urgent availability with personalized attention and tailored treatments.' },
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 translate-x-1/3 blur-[100px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-20 md:mb-32">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-[1px] bg-brand-accent"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Beyond The Chair</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-display font-medium text-white mb-10 tracking-tight leading-[0.85] italic">The Studio <br /><span className="text-brand-teal font-light not-italic">Philosophy</span></h2>
          <p className="text-xl md:text-2xl text-slate-400 font-light italic leading-relaxed opacity-80">
            We operate at a higher clinical standard, where every patient journey is a curated experience defined by technological rigor and artistic intent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {reasons.map((reason, i) => (
            <div key={i} className="flex flex-col border-t border-white/10 pt-12 group hover:border-brand-accent transition-colors duration-700">
              <span className="text-[10px] font-black text-brand-accent tracking-[0.5em] mb-8 group-hover:translate-x-2 transition-transform">CASE 0{i + 1}</span>
              <h3 className="text-2xl font-display text-white mb-6 italic tracking-tight">{reason.title}</h3>
              <p className="text-slate-400 font-light italic leading-relaxed text-base opacity-70 group-hover:opacity-100 transition-opacity">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Results = () => {
  return (
    <section id="results" className="py-20 md:py-32 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Exceptional Results.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Witness the transformation of our patients' smiles through our advanced cosmetic and restorative procedures.
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-widest text-brand-teal border-b border-brand-teal pb-2">View Gallery</button>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {[1, 2].map((item) => (
            <div key={item} className="group relative overflow-hidden rounded-[3rem]">
              <div className="relative aspect-video">
                <img 
                  src={item === 1 ? 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?q=80&w=1200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop'} 
                  alt="Smile Result" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-8 left-8">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-accent mb-2">Cosmetic Veneers</p>
                  <h4 className="text-2xl font-display">Complete Smile Restoration</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    { name: 'Sarah Miller', text: 'The most calming dental experience I’ve ever had. Dr. Sarah and her team are true artists who actually care about your comfort.', rating: 5 },
    { name: 'David Chen', text: 'A beautifully curated office. The technology is impressive, but the personal attention is what truly sets them apart.', rating: 5 },
    { name: 'Robert Jackson', text: 'They’ve completely changed my perception of dentistry. Precision, care, and a beautiful result. Highly recommend.', rating: 5 },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Patient Stories</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">Hear from those who have experienced the Division Dental difference.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-8">
        {reviews.map((review, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all duration-500"
          >
            <div>
              <div className="flex items-center gap-1 mb-6 text-brand-accent">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 text-lg leading-relaxed italic mb-8 italic">"{review.text}"</p>
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <p className="font-bold text-slate-900">{review.name}</p>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Quote className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const BookingSection = ({ user, onBookingSuccess, onAuthRequired }: { user: FirebaseUser | null, onBookingSuccess?: () => void, onAuthRequired: () => void }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    service: 'General Consultation',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const businessHours = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      if (!formData.date) {
        setOccupiedSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const bookingsOnDate = await getBookingsByDate(formData.date);
        const times = (bookingsOnDate || [])
          .filter((b: any) => b.status !== 'cancelled')
          .map((b: any) => b.time);
        setOccupiedSlots(times);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchOccupiedSlots();
  }, [formData.date]);

  const isSunday = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getUTCDay() === 0; // Using UTC to avoid timezone shifts
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (isSunday(formData.date)) {
      setSubmitStatus('error');
      setErrorMessage('We are closed on Sundays. Please select another date.');
      return;
    }

    if (!formData.time) {
      setSubmitStatus('error');
      setErrorMessage('Please select a preferred time slot.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      await createBooking(formData);
      setSubmitStatus('success');
      setFormData({
        fullName: '',
        phoneNumber: '',
        service: 'General Consultation',
        date: '',
        time: ''
      });
      setOccupiedSlots([]);
      
      if (onBookingSuccess) {
        setTimeout(() => {
          onBookingSuccess();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
      try {
        const parsed = JSON.parse(error.message);
        setErrorMessage(parsed.error || 'Request failed. Please try again.');
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book" className="py-20 md:py-32 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-slate-900 rounded-[3rem] overflow-hidden lg:flex shadow-2xl">
          <div className="lg:w-1/2 p-10 md:p-20 text-white flex flex-col justify-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 italic">Reserve Your <br /> Consultation.</h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light italic">
              Our studio is open to new patients looking for premium, personalized dental care. Complete the form and we'll contact you shortly.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-teal">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Call Us</p>
                  <p className="text-white">+1 872-829-2940</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-teal">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Email Us</p>
                  <p className="text-white">care@divisiondental.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-10 md:p-20 bg-brand-teal flex flex-col justify-center">
            {!user ? (
               <div className="text-center p-8 md:p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-3xl font-display text-white mb-6 italic">Access Booking</h3>
                  <p className="text-brand-soft text-sm mb-10 opacity-70">Please sign in to schedule your appointment and manage your records.</p>
                  <button 
                    onClick={onAuthRequired}
                    className="bg-white text-brand-teal px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white w-full"
                  >
                    Authenticate
                  </button>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-white/10 border-white/20 border p-4 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/20 focus:border-white outline-none transition-all" 
                      placeholder="e.g. Julian Henderson" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-white/10 border-white/20 border p-4 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/20 focus:border-white outline-none transition-all" 
                      placeholder="(312) 555-0199" 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 ml-1">Service</label>
                    <select 
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full bg-white/10 border-white/20 border p-4 text-white h-[58px] rounded-2xl focus:bg-white/20 focus:border-white outline-none transition-all cursor-pointer"
                    >
                      <option className="text-slate-900">General Consultation</option>
                      <option className="text-slate-900">Cleaning & Checkup</option>
                      <option className="text-slate-900">Cosmetic Work</option>
                      <option className="text-slate-900">Emergency Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 ml-1">Preferred Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})}
                      className="w-full bg-white/10 border-white/20 border p-4 text-white rounded-2xl focus:bg-white/20 focus:border-white outline-none transition-all" 
                    />
                    {isSunday(formData.date) && (
                      <p className="text-[10px] text-red-300 mt-2 ml-1 font-bold italic">Closed on Sundays</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Available Hourly Slots (9 AM - 5 PM)</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {businessHours.map((time) => {
                      const isOccupied = occupiedSlots.includes(time);
                      const isSelected = formData.time === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isOccupied || isLoadingSlots || !formData.date || isSunday(formData.date)}
                          onClick={() => setFormData({...formData, time})}
                          className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${
                            isSelected 
                              ? 'bg-white text-brand-teal border-white shadow-lg scale-105' 
                              : isOccupied 
                                ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                                : 'bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/40'
                          }`}
                        >
                          {isOccupied ? 'Booked' : time}
                        </button>
                      );
                    })}
                  </div>
                  {formData.date && !isSunday(formData.date) && occupiedSlots.length === businessHours.length && (
                    <p className="text-center text-[10px] text-red-300 font-bold uppercase tracking-widest">No slots available for this day.</p>
                  )}
                </div>
                
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl hover:bg-brand-accent hover:text-slate-900 active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? 'Processing...' : 'Request Appointment'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>

                {submitStatus === 'success' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/10 rounded-2xl text-center border border-white/20">
                    <p className="text-white text-sm font-bold uppercase tracking-widest">Request Received. We will call you shortly.</p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/20 rounded-2xl text-center border border-red-500/20">
                    <p className="text-white text-sm italic">{errorMessage}</p>
                  </motion.div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-8">Visit Our Clinic</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <MapPin className="w-6 h-6 text-brand-teal flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-lg">Address</p>
                <p className="text-slate-600">2632 W Division St, <br />Chicago, IL 60622</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="w-6 h-6 text-brand-teal flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-lg">Working Hours</p>
                <div className="text-slate-600">
                  <p>Mon - Sat: 9:00 AM - 5:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex gap-4">
            <a href="#" className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-teal transition-colors border border-slate-100">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-teal transition-colors border border-slate-100">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-teal transition-colors border border-slate-100">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="h-96 rounded-3xl overflow-hidden shadow-lg border border-white">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.214476046757!2d-87.69532572347334!3d41.90334866340854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd2be6759b1f5%3A0xe54d8a1c97f48e2!2s2632%20W%20Division%20St%2C%20Chicago%2C%20IL%2060622!5e0!3m2!1sen!2sus!4v1714343100000!5m2!1sen!2sus" 
            className="w-full h-full grayscale border-0 opacity-80 hover:opacity-100 transition-opacity duration-700" 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 border border-brand-accent flex items-center justify-center text-brand-teal font-display text-2xl italic">
                D
              </div>
              <span className="font-display text-2xl tracking-tight text-white">
                Division <span className="font-light italic text-brand-accent">Dental Studio</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Leading the way in premium dental care in Chicago. Modern technology, gentle care, and brilliant results.
            </p>
            <div className="text-slate-500 text-xs flex flex-col gap-2">
               <span className="flex items-center gap-2"><MapPin className="w-3 h-3"/> 2632 W Division St, Chicago, IL 60622</span>
               <span className="flex items-center gap-2"><Phone className="w-3 h-3"/> +1 872-829-2940</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#services" className="hover:text-brand-teal">Our Services</a></li>
              <li><a href="#about" className="hover:text-brand-teal">Meet Our Team</a></li>
              <li><a href="#results" className="hover:text-brand-teal">Smile Results</a></li>
              <li><a href="#book" className="hover:text-brand-teal">Book Appointment</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>General Dentistry</li>
              <li>Cosmetic Dentistry</li>
              <li>Dental Implants</li>
              <li>Teeth Whitening</li>
              <li>Emergency Care</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-slate-400 mb-4 text-sm">Subscribe for dental health tips and exclusive offers.</p>
            <div className="flex border-b border-slate-700 pb-2">
              <input type="email" placeholder="Your email" className="bg-transparent outline-none flex-grow text-sm" />
              <button className="text-brand-teal hover:text-brand-teal-light"><ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
          <p>© 2024 Division Dental Clinic. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#admin" className="text-slate-600 hover:text-slate-400 transition-colors">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppWidget = () => {
  return (
    <a 
      href="https://wa.me/18728292940" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 bg-brand-teal text-white p-4 rounded-full shadow-2xl shadow-brand-teal/40 hover:scale-110 transition-transform flex items-center justify-center"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
};

const UserBookings = ({ user }: { user: FirebaseUser | null }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const fetch = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserBookings();
      if (data) {
        setBookings(data);
      }
    } catch (err: any) {
      console.error('UserBookings: fetch error', err);
      try {
        const parsedError = JSON.parse(err.message);
        setError(parsedError.error || 'Failed to load bookings');
      } catch {
        setError('Failed to load bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCancel = async (id: string) => {
    console.log('User requesting cancellation:', id);
    // Removed confirm as it might be blocked in iframe
    
    const previousBookings = [...bookings];
    // Optimistic update: mark as cancelled instantly in UI
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    setIsCancelling(id);
    
    try {
      console.log('Calling updateBookingStatus for:', id);
      await updateBookingStatus(id, 'cancelled');
      console.log('Cancellation successful for:', id);
      setError('Appointment cancelled successfully.'); // Using error state for success flash
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error('handleCancel error', err);
      setBookings(previousBookings); // Revert UI if server fails
      let msg = 'Failed to cancel appointment. Please try again.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) msg = `Error: ${parsed.error}`;
      } catch (e) {}
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsCancelling(null);
    }
  };

  if (!user) return null;

  return (
    <section id="my-bookings" className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">My Bookings</h2>
            <p className="text-slate-500 max-w-lg">View and manage your consultation requests at Division Dental Studio.</p>
          </div>
          <button 
            onClick={fetch}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> {isLoading ? 'Updating...' : 'Sync Records'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center mb-12 max-w-xl mx-auto">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button onClick={fetch} className="text-xs font-bold uppercase tracking-widest text-red-600 underline">Try again</button>
          </div>
        )}

        {isLoading && bookings.length === 0 ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-t-2 border-brand-teal border-solid rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 && !error ? (
          <div className="bg-white p-12 md:p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-display font-bold text-slate-900 mb-4">No appointments found</h3>
            <p className="text-slate-500 mb-10">You haven't requested any consultations yet.</p>
            <button 
              onClick={() => { window.location.hash = ''; }} 
              className="bg-brand-teal text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg"
            >
              Book Your First Visit
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {bookings.sort((a, b) => {
              const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
              const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
              return dateB - dateA;
            }).map((booking, idx) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-brand-teal group-hover:text-white transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border ${
                    booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 
                    'bg-brand-accent/10 text-brand-teal border-brand-accent/20'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <h4 className="text-2xl font-display font-bold text-slate-900 mb-6">{booking.service}</h4>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-slate-300" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Requested Date & Time</p>
                      <p className="text-slate-700 font-medium">
                        {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="text-brand-teal ml-2">@ {booking.time}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <User className="w-4 h-4 text-slate-300" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Patient Name</p>
                      <p className="text-slate-700 font-medium">{booking.fullName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-between items-center mb-8">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest">Consultation ID</p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">{booking.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] uppercase font-bold text-slate-300 tracking-widest">Requested</p>
                     <p className="text-[10px] text-slate-400">{booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleCancel(booking.id)}
                  disabled={isCancelling === booking.id || booking.status === 'cancelled'}
                  className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    booking.status === 'cancelled' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {isCancelling === booking.id ? 'Processing...' : booking.status === 'cancelled' ? 'Cancelled' : 'Cancel Appointment'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'bookings' | 'admin'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAdmin = user?.email === 'asimmidadkhel@gmail.com';

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncUserProfile(currentUser).catch(err => {
          console.error("Critical error during profile sync:", err);
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL hash for navigation
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#my-bookings') {
        setActiveView('bookings');
      } else if (window.location.hash === '#admin') {
        setActiveView('admin');
      } else {
        setActiveView('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="font-sans text-slate-900 bg-white">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(type) => {
          if (type === 'admin') {
            window.location.hash = '#admin';
            setActiveView('admin');
          }
        }}
      />
      <Navbar user={user} onSignInClick={() => setIsAuthModalOpen(true)} isAdmin={isAdmin} />
      
      <AnimatePresence mode="wait">
        {activeView === 'admin' ? (
           <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminPortal user={user} isAdmin={isAdmin} />
          </motion.div>
        ) : activeView === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Hero />
            <TrustSignals />
            <Services />
            <About />
            <WhyChooseUs />
            <Results />
            <Testimonials />
            <BookingSection 
              user={user} 
              onAuthRequired={() => setIsAuthModalOpen(true)}
              onBookingSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  window.location.hash = '#my-bookings';
                  setActiveView('bookings');
                }, 600);
              }} 
            />
            <Contact />
          </motion.div>
        ) : (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <UserBookings user={user} />
            <div className="bg-white py-12 text-center border-t border-slate-100">
               <button 
                onClick={() => {
                  window.location.hash = '';
                  setActiveView('home');
                }}
                className="text-brand-teal font-bold uppercase tracking-widest text-[10px] hover:text-brand-accent transition-colors flex items-center gap-2 mx-auto"
               >
                 <ArrowRight className="w-3 h-3 rotate-180" /> Back to Home
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
