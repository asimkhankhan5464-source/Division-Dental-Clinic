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
  LogIn
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
  signupWithEmail
} from './lib/firebaseUtils';

const AdminPortal = () => {
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'General Consultation',
    appointmentDate: '',
    timeSlot: '09:00 AM',
    notes: ''
  });

  const handleManualBooking = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createBooking({
        ...newBooking,
        userEmail: newBooking.email, // Override userEmail for manual booking
        status: 'confirmed'
      });
      setIsAddingBooking(false);
      setNewBooking({
        name: '',
        phone: '',
        email: '',
        service: 'General Consultation',
        appointmentDate: '',
        timeSlot: '09:00 AM',
        notes: ''
      });
      await fetchAll();
    } catch (err) {
      alert('Failed to create manual booking');
    }
  };

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email === 'asimkhankhan3236@gmail.com') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
    if (isAdminLoggedIn) {
      fetchAll();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await loginWithEmail(email, password);
      if (auth.currentUser?.email === 'asimkhankhan3236@gmail.com') {
        setIsAdminLoggedIn(true);
      } else {
        setAuthError('Unauthorized access.');
        await auth.signOut();
      }
    } catch (err: any) {
      setAuthError('Invalid credentials.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateBookingStatus(id, newStatus);
      await fetchAll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 border-2 border-brand-teal text-brand-teal flex items-center justify-center font-display text-4xl italic mx-auto mb-6">D</div>
            <h2 className="font-display text-3xl text-slate-900 tracking-tight">Admin Portal</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest mt-2 font-bold">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-0 p-4 text-sm focus:ring-1 focus:ring-brand-teal outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Security Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-0 p-4 text-sm focus:ring-1 focus:ring-brand-teal outline-none" 
                required 
              />
            </div>
            {authError && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{authError}</p>}
            <button className="w-full bg-brand-teal text-white py-5 text-xs uppercase tracking-[0.4em] font-black hover:bg-slate-900 transition-all shadow-xl shadow-brand-teal/10"> Authenticate </button>
            <button 
              type="button"
              onClick={() => window.location.hash = ''}
              className="w-full text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:text-brand-teal"
            >
              Return to Website
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 py-6 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="text-brand-teal font-display text-2xl italic border border-brand-teal w-8 h-8 flex items-center justify-center text-sm">D</div>
          <span className="font-display text-xl">Dental <span className="italic text-brand-accent">Management</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{auth.currentUser?.email}</span>
          <button 
            onClick={() => { auth.signOut(); setIsAdminLoggedIn(false); }}
            className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 flex items-center gap-2"
          >
           <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-display tracking-tight text-slate-900">Patient Dashboard</h1>
            <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-bold mt-2">Manage clinical requests & appointments</p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsAddingBooking(true)}
              className="bg-slate-900 text-white px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-brand-teal transition-all"
            >
              Add New Booking
            </button>
            <div className="bg-white p-4 border border-slate-200 flex gap-8">
            <div>
              <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Total Requests</p>
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

      {isLoading ? (
          <div className="py-20 text-center uppercase tracking-widest text-xs font-bold text-slate-400 animate-pulse">Synchronizing Records...</div>
        ) : (
          <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Patient Details</th>
                  <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Appointment</th>
                  <th className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                  <th className="text-right px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-semibold text-slate-900">{booking.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{booking.userEmail}</div>
                      <div className="text-[10px] font-mono text-slate-400">{booking.phone}</div>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-brand-teal" /> {booking.appointmentDate}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-brand-teal" /> {booking.timeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-1 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2 text-[8px] uppercase tracking-widest font-bold">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="bg-brand-teal text-white px-4 py-2 hover:bg-slate-900 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="border border-red-100 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          {booking.status === 'cancelled' ? 'Delete Permanently' : 'Cancel'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <div className="py-20 text-center text-slate-400 text-xs italic">No clinical records found.</div>}
          </div>
        )}
      </main>

      {/* Add Booking Modal */}
      <AnimatePresence>
        {isAddingBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsAddingBooking(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="font-display text-3xl mb-2">Create Record</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-10">Manual patient entry</p>

              <form onSubmit={handleManualBooking} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Patient Name</label>
                  <input 
                    type="text" 
                    required
                    value={newBooking.name}
                    onChange={e => setNewBooking({...newBooking, name: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newBooking.email}
                    onChange={e => setNewBooking({...newBooking, email: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newBooking.phone}
                    onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Clinical Service</label>
                  <select 
                    value={newBooking.service}
                    onChange={e => setNewBooking({...newBooking, service: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  >
                    <option>General Consultation</option>
                    <option>Cosmetic Treatment</option>
                    <option>Dental Implants</option>
                    <option>Orthodontics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Appointment Date</label>
                  <input 
                    type="date" 
                    required
                    value={newBooking.appointmentDate}
                    onChange={e => setNewBooking({...newBooking, appointmentDate: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Time Slot</label>
                  <select 
                    value={newBooking.timeSlot}
                    onChange={e => setNewBooking({...newBooking, timeSlot: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm"
                  >
                    <optgroup label="Morning">
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                    </optgroup>
                    <optgroup label="Afternoon">
                      <option>01:00 PM</option>
                      <option>02:00 PM</option>
                      <option>03:00 PM</option>
                      <option>04:00 PM</option>
                    </optgroup>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Clinical Notes</label>
                  <textarea 
                    value={newBooking.notes}
                    onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                    className="w-full bg-slate-50 border-0 p-4 text-sm h-24"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="w-full bg-brand-teal text-white py-5 text-xs uppercase tracking-[0.4em] font-black hover:bg-slate-900 transition-all">
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
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess?.('login');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (authType === 'login' || authType === 'admin') {
        await loginWithEmail(email, password);
        if (authType === 'admin' && auth.currentUser?.email !== 'asimkhankhan3236@gmail.com') {
          await auth.signOut();
          throw new Error('Not an authorized admin account.');
        }
      } else {
        await signupWithEmail(email, password, name);
      }
      onSuccess?.(authType);
      onClose();
    } catch (err: any) {
      setError(err.message);
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
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white w-full max-w-[320px] max-h-[85vh] flex flex-col shadow-2xl relative rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white z-10">
              <button 
                onClick={onClose}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-slate-300 hover:text-brand-teal transition-colors group"
              >
                <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <div className="w-7 h-7 border-2 border-brand-teal text-brand-teal flex items-center justify-center font-display text-lg italic rounded-sm">D</div>
              <button 
                onClick={onClose}
                className="text-slate-200 hover:text-red-500 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 hide-scrollbar space-y-5">
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button 
                  onClick={() => { setAuthType('login'); setError(''); }}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${authType === 'login' ? 'bg-white text-brand-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthType('signup'); setError(''); }}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${authType === 'signup' ? 'bg-white text-brand-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sign Up
                </button>
                <button 
                  onClick={() => { setAuthType('admin'); setError(''); }}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-black rounded-lg transition-all ${authType === 'admin' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-300 hover:text-red-400'}`}
                >
                  Admin
                </button>
              </div>

              <motion.div
                key={authType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <h2 className="font-display text-lg text-slate-900 tracking-tight leading-none mb-1.5">
                    {authType === 'admin' ? 'Admin Portal' : (authType === 'login' ? 'Welcome Back' : 'Create Account')}
                  </h2>
                  <p className="text-slate-400 text-[8px] uppercase tracking-widest font-bold">
                    {authType === 'admin' ? 'Authorized Access' : (authType === 'login' ? 'Access your dashboard' : 'Join our community')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {authType === 'signup' && (
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-400 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border-slate-100 border p-3 text-sm focus:bg-white focus:border-brand-teal focus:ring-0 outline-none transition-all rounded-xl placeholder:text-slate-300" 
                        required 
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-400 ml-1">
                      {authType === 'admin' ? 'Admin Email' : 'Email Address'}
                    </label>
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 border p-3 text-sm focus:bg-white focus:border-brand-teal focus:ring-0 outline-none transition-all rounded-xl placeholder:text-slate-300" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-400 ml-1">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 border p-3 text-sm focus:bg-white focus:border-brand-teal focus:ring-0 outline-none transition-all rounded-xl placeholder:text-slate-300" 
                      required 
                    />
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-[8px] uppercase font-bold tracking-widest text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button 
                    disabled={isLoading}
                    className={`group relative w-full ${authType === 'admin' ? 'bg-red-500' : 'bg-slate-900'} text-white py-3.5 text-[9px] uppercase tracking-[0.3em] font-black hover:opacity-90 transition-all shadow-md rounded-xl disabled:opacity-50 mt-2 flex items-center justify-center overflow-hidden`}
                  >
                    <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      {authType === 'admin' ? 'Authenticate' : (authType === 'login' ? 'Sign In' : 'Sign Up Now')}
                    </span>
                    {isLoading && (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                      </motion.div>
                    )}
                  </button>
                </form>
              </motion.div>

              {authType !== 'admin' && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
                    <div className="relative flex justify-center text-[8px] uppercase tracking-widest font-bold"><span className="bg-white px-2 text-slate-200">or</span></div>
                  </div>

                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full border border-slate-100 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] uppercase tracking-widest font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-3.5 h-3.5" alt="Google" />
                    Google
                  </button>
                </>
              )}

              <div className="text-center pt-2">
                <button 
                  onClick={() => { 
                    setAuthType(authType === 'signup' ? 'login' : 'signup'); 
                    setError(''); 
                  }}
                  className="text-[9px] uppercase tracking-widest font-black text-slate-400 hover:text-brand-teal transition-colors"
                >
                  {authType === 'signup' ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ user, onSignInClick }: { user: FirebaseUser | null, onSignInClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Results', href: '#results' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  if (user) {
    navLinks.splice(0, 0, { name: 'My Bookings', href: '#my-bookings' });
  }

  return (
    <>
      {/* Top Bar - Hidden on scroll for focus */}
      <motion.div 
        animate={{ y: isScrolled ? -40 : 0, opacity: isScrolled ? 0 : 1 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-brand-teal text-white/70 py-2 border-b border-white/5 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[9px] uppercase tracking-[0.25em] font-bold">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-brand-accent" /> 2632 W Division St, Chicago</span>
            <span className="flex items-center gap-2"><Phone className="w-3 h-3 text-brand-accent" /> +1 872 829 2940</span>
          </div>
          <div className="flex gap-6">
            <span className="text-white italic capitalize tracking-normal font-medium">Chicago's Premier Dental Studio</span>
          </div>
        </div>
      </motion.div>

      <nav 
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'top-0 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' 
            : 'top-0 md:top-10 py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={`w-11 h-11 border transition-all duration-500 flex items-center justify-center font-display text-2xl italic ${
              isScrolled ? 'border-brand-teal text-brand-teal bg-brand-teal/5' : 'border-white/20 text-white md:bg-white/5'
            }`}>
              D
              <div className="absolute w-11 h-11 border border-brand-accent scale-50 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"></div>
            </div>
            <div className="flex flex-col">
              <span className={`font-display text-2xl tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>
                Division <span className="font-light italic text-brand-accent ml-1">Dental</span>
              </span>
              <span className={`text-[8px] uppercase tracking-[0.5em] font-black -mt-1 opacity-50 ${isScrolled ? 'text-slate-500' : 'text-slate-500 md:text-white'}`}>Studio • Chicago</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 mr-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className={`relative text-[10px] uppercase font-bold tracking-[0.25em] transition-all duration-500 hover:text-brand-accent group ${
                    isScrolled ? 'text-slate-600' : 'text-white'
                  }`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-accent transition-all duration-500 group-hover:w-full"></span>
                </a>
              ))}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200/20 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLogout}
                  className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:text-red-400 ${
                    isScrolled ? 'text-slate-500' : 'text-white/70'
                  }`}
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-brand-accent to-transparent cursor-pointer"
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-slate-100">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              <button 
                onClick={onSignInClick}
                className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:text-brand-accent ${
                  isScrolled ? 'text-slate-600' : 'text-white'
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In / Join
              </button>
            )}

            <a 
              href="#book" 
              className={`relative overflow-hidden px-8 py-4 text-[10px] uppercase font-black tracking-[0.35em] transition-all duration-500 flex items-center gap-3 group ${
                isScrolled 
                  ? 'bg-slate-900 text-white hover:bg-brand-teal shadow-[0_10px_20px_rgba(0,0,0,0.1)]' 
                  : 'bg-white/5 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-slate-900 shadow-xl'
              }`}
            >
              <span className="relative z-10 transition-colors duration-500">Book Appointment</span>
              <motion.div 
                className="absolute inset-0 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ top: '100%' }}
                whileHover={{ top: 0 }}
              />
              <div className="absolute top-0 -left-full w-full h-full bg-white/10 -skew-x-45 transition-all group-hover:left-full duration-1000"></div>
            </a>
          </div>

          {/* Mobile Access */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-accent flex items-center justify-center bg-slate-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                )}
              </div>
            )}
            <button 
              className={`p-2 transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] md:hidden bg-slate-900"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-16">
                  <span className="font-display text-2xl text-white">Division <span className="text-brand-accent italic">Dental</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">
                    <X className="w-8 h-8" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-8">
                  {navLinks.map((link, idx) => (
                    <motion.a 
                      key={link.name} 
                      href={link.href} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-4xl font-display italic text-white hover:text-brand-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>

                <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
                   {!user && (
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSignInClick();
                      }}
                      className="block w-full border border-white/10 text-white text-center py-6 text-xs uppercase font-bold tracking-[0.4em] mb-4 hover:bg-white/5 transition-colors"
                    >
                      Sign In / Sign Up
                    </button>
                   )}
                   <a 
                    href="#book" 
                    className="block w-full bg-brand-teal text-white text-center py-6 text-xs uppercase font-bold tracking-[0.4em]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reserve Consultation
                  </a>
                  
                  <div className="space-y-4">
                    <p className="flex items-center gap-4 text-slate-500 text-xs tracking-widest uppercase font-bold">
                      <Phone className="w-4 h-4 text-brand-accent" /> +1 872 829 2940
                    </p>
                    <p className="flex items-center gap-4 text-slate-500 text-xs tracking-widest uppercase font-bold">
                      <Mail className="w-4 h-4 text-brand-accent" /> care@divisiondental.com
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-slate-900">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-teal/20 skew-x-12 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 blur-[100px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-4 mb-10">
            <span className="w-12 h-[1px] bg-brand-accent"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent/80">Est. 2009 • Chicago, Illinois</span>
          </div>
          
          <h1 className="text-7xl md:text-[120px] font-display font-medium text-white leading-[0.8] tracking-tighter mb-12">
            Artistry <br />
            <span className="italic font-light text-brand-accent">Beyond</span> <br />
            Dentistry
          </h1>
          
          <p className="text-xl text-slate-400 mb-14 max-w-lg leading-relaxed font-light italic">
            A bespoke clinical experience where masterful technique meets modern luxury. Discover the precision of curated dental care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <motion.a 
              href="#book" 
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              className="group relative bg-brand-accent text-slate-900 px-14 py-7 text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-5 w-full sm:w-auto overflow-hidden"
            >
              <span className="relative z-10">Reserve Visit</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </motion.a>
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-white/20"></div>
              <a 
                href="#services" 
                className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 hover:text-white transition-colors"
              >
                Our Specialties
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="relative"
        >
          {/* Framed Image */}
          <div className="relative z-10 p-4 bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="aspect-[4/5] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=2070&auto=format&fit=crop" 
                alt="Sophisticated Dental Studio" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 border-t border-r border-brand-accent/30 hidden xl:block"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 border-b border-l border-brand-accent/30 hidden xl:block"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -bottom-16 -right-10 bg-brand-teal p-12 shadow-2xl hidden lg:block border border-white/5"
          >
            <div className="flex items-center gap-1 mb-4 text-brand-accent">
               <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
            </div>
            <p className="font-display text-2xl font-light italic text-white/90 leading-tight">
              "Redefining what a visit <br /> to the dentist feels like."
            </p>
            <p className="text-[9px] uppercase tracking-[0.4em] text-brand-accent mt-6 font-bold">Premium Patient Care</p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30"
      >
        <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-white">Explore Studio</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
      </motion.div>
    </section>
  );
};

const TrustSignals = () => {
  const stats = [
    { value: '5000+', label: 'Happy Patients' },
    { value: '★★★★★', label: 'Google Rating' },
    { value: '15+', label: 'Years Experience' },
    { value: 'Licensed', label: 'Dental Specialists' },
  ];

  return (
    <section className="py-10 bg-white relative z-20 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-between items-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[200px] last:border-none md:border-r border-slate-100 last:md:border-none py-4">
              <h3 className={`text-4xl font-display italic text-brand-teal mb-2 ${stat.value.includes('★') ? 'text-brand-accent' : ''}`}>{stat.value}</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">{stat.label}</p>
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
      desc: 'Comprehensive checkups, cleanings, and preventative care for a lifetime of healthy smiles.',
      icon: <Smile className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Cosmetic Dentistry', 
      desc: 'Transform your look with veneers, bonding, and other high-end aesthetic dental solutions.',
      icon: <Award className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Teeth Whitening', 
      desc: 'Get a noticeably brighter smile with our professional, safe, and effective in-office whitening.',
      icon: <Zap className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Dental Implants', 
      desc: 'Permanent, natural-looking tooth replacements that restore both function and confidence.',
      icon: <CheckCircle2 className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Orthodontics', 
      desc: 'Modern solutions like Invisalign and fast-acting braces for a perfectly aligned smile.',
      icon: <ShieldCheck className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop'
    },
    { 
      title: 'Emergency Care', 
      desc: 'Urgent dental issues? We offer same-day appointments to relieve pain and fix emergencies.',
      icon: <Phone className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=600&auto=format&fit=crop'
    },
  ];

  return (
    <section id="services" className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-[1px] bg-brand-accent"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Excellence in Care</span>
        </div>
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-6">Our Services</h2>
          <p className="text-slate-500 font-light italic text-lg max-w-xl mx-auto">
            Blending masterful technique with advanced technology for results that are as healthy as they are beautiful.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-x-12 gap-y-20">
          {services.map((service, i) => (
            <motion.div 
              key={i}
              className="flex flex-col group border-l border-transparent hover:border-brand-accent pl-0 hover:pl-8 transition-all duration-500"
            >
              <div className="relative mb-8 overflow-hidden bg-slate-100 aspect-video">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-brand-teal">
                  {service.icon}
                </div>
              </div>
              <h3 className="text-2xl font-display font-medium text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light mb-6 italic">
                {service.desc}
              </p>
              <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 group-hover:text-brand-teal flex items-center gap-2 transition-colors">
                Learn More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="grid grid-cols-2 gap-6 items-end">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" 
              alt="Modern Equipment" 
              className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=1000&auto=format&fit=crop" 
                alt="Smiling Team" 
                className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="bg-brand-teal p-10 text-white">
                <p className="text-5xl font-display italic mb-2 tracking-tighter">15+</p>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Years of Artistry</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-[1px] bg-brand-accent"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Our Heritage</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-8 leading-tight">
            Elevating Dental Care <br />
            <span className="italic font-light text-brand-teal">to an Art Form</span>
          </h2>
          <p className="text-xl text-slate-500 mb-8 leading-relaxed font-light italic">
            At Division Dental Studio, we believe that your visit should be as rewarding as the results. Our boutique Chicago office is designed to provide clinical excellence in a serene, curated environment.
          </p>
          <div className="space-y-6 mb-12">
            {[
              'Specialized cosmetic & general restorative care',
              'Advanced 3D digital imaging & laser technology',
              'Bespoke treatment plans for every unique smile',
              'A commitment to stress-free, painless dentistry'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-[6px] h-[6px] bg-brand-accent rounded-full"></div>
                <span className="text-slate-700 italic font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <motion.a 
            href="#book" 
            whileHover={{ x: 10 }}
            className="inline-flex items-center gap-4 bg-brand-teal text-white px-12 py-6 text-[10px] font-black uppercase tracking-[0.35em] transition-all hover:bg-slate-900 group"
          >
            Reserve Consultation 
            <ArrowRight className="w-4 h-4 text-brand-accent group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    { title: 'Pain-Free Treatment', desc: 'Expert sedation & gentle techniques for complete serenity.' },
    { title: 'Bespoke Technology', desc: 'Precision digital imaging for artisanal accuracy.' },
    { title: 'Transparent Luxury', desc: 'Boutique care that respects your investment & insurance.' },
    { title: 'Concierge Care', desc: 'Same-day urgent availability with personalized attention.' },
  ];

  return (
    <section className="py-24 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-[1px] bg-brand-accent"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Beyond The Chair</span>
        </div>
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-4 tracking-tight italic leading-none">Why Patients Uniquely <br /> Choose Us</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {reasons.map((reason, i) => (
            <div key={i} className="flex flex-col border-t border-slate-200 pt-10">
              <span className="text-[10px] font-bold text-brand-accent tracking-[0.4em] mb-6">0{i + 1}</span>
              <h3 className="text-xl font-display font-medium text-slate-900 mb-4">{reason.title}</h3>
              <p className="text-slate-500 font-light italic leading-relaxed text-sm">
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
    <section id="results" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-[1px] bg-brand-accent"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Artistry in Practice</span>
        </div>
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-6">Smile Portfolios</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden bg-slate-100 aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2070&auto=format&fit=crop" 
                alt="Smile Transformation" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <div>
                <h4 className="font-display text-2xl font-medium text-slate-900">Porcelain Veneers</h4>
                <p className="text-slate-400 italic text-sm">Full Smile Restoration</p>
              </div>
              <button className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">View Case</button>
            </div>
          </div>
          <div className="flex flex-col gap-6 pt-12 md:pt-24">
            <div className="overflow-hidden bg-slate-100 aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=2070&auto=format&fit=crop" 
                alt="Whitening Results" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <div>
                <h4 className="font-display text-2xl font-medium text-slate-900">Artistic Whitening</h4>
                <p className="text-slate-400 italic text-sm">Brightening & Contouring</p>
              </div>
              <button className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">View Case</button>
            </div>
          </div>
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
    <section id="testimonials" className="py-32 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-[1px] bg-brand-accent"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Patient Voices</span>
        </div>
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-display font-medium mb-4">Kind Words</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {reviews.map((review, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-1 mb-8 text-brand-accent">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="font-display text-2xl font-light italic mb-10 leading-relaxed text-slate-200">
                "{review.text}"
              </p>
              <div className="mt-auto pt-8 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">{review.name}</p>
                <p className="text-[9px] uppercase tracking-widest text-brand-accent mt-1">Verified Patient</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BookingSection = ({ user, onBookingSuccess, onAuthRequired }: { user: FirebaseUser | null, onBookingSuccess?: () => void, onAuthRequired: () => void }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    service: 'General Restoration',
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      await createBooking(formData);
      setSubmitStatus('success');
      setFormData({
        fullName: '',
        phoneNumber: '',
        service: 'General Restoration',
        date: ''
      });
      
      // Notify parent of success
      if (onBookingSuccess) {
        setTimeout(() => {
          onBookingSuccess();
        }, 1500); // Small delay to show success state
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
    <section id="book" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-brand-soft border border-slate-100 lg:flex">
          <div className="lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-brand-accent"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Connect with us</span>
            </div>
            <h2 className="text-5xl font-display font-medium text-slate-900 mb-8 leading-tight">Your New Smile <br /> <span className="italic font-light">Starts Here</span></h2>
            <p className="text-lg text-slate-500 mb-12 font-light italic leading-relaxed">
              We invite you to experience the future of dentistry. Reserve your consultation time and let us craft a tailored plan for your oral health.
            </p>
            
            <div className="space-y-10">
              <div className="flex items-start gap-6 border-l border-slate-200 pl-8">
                <div className="bg-brand-teal p-3 text-white">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Direct Line</p>
                  <p className="text-xl font-display font-medium text-slate-900 italic">+1 872-829-2940</p>
                </div>
              </div>
              <div className="flex items-start gap-6 border-l border-slate-200 pl-8">
                <div className="bg-brand-teal p-3 text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Inquiries</p>
                  <p className="text-xl font-display font-medium text-slate-900 italic">care@divisiondental.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-8 md:p-16 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
            {!user ? (
               <div className="text-center py-12 px-8 bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl">
                  <User className="w-12 h-12 text-brand-accent mx-auto mb-6 opacity-50" />
                  <h3 className="text-3xl font-display mb-4 italic">Sign In to Book</h3>
                  <p className="text-slate-400 mb-8 font-light italic">Please sign in with your Google account to manage your appointment requests and clinical records.</p>
                  <button 
                    onClick={onAuthRequired}
                    className="bg-brand-teal text-white px-12 py-5 rounded-none text-sm font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-brand-teal w-full flex items-center justify-center gap-3"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <motion.div 
                    className="border-b border-white/10 relative group"
                    whileFocus={{ borderBottomColor: '#c5a386' }}
                  >
                    <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2 block group-focus-within:text-brand-accent transition-colors">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-transparent outline-none text-base placeholder:text-slate-700 pb-3" 
                      placeholder="Johnathan Doe" 
                    />
                  </motion.div>
                  <motion.div 
                    className="border-b border-white/10 relative group"
                    whileFocus={{ borderBottomColor: '#c5a386' }}
                  >
                    <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2 block group-focus-within:text-brand-accent transition-colors">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-transparent outline-none text-base placeholder:text-slate-700 pb-3" 
                      placeholder="(312) 555-0123" 
                    />
                  </motion.div>
                </div>
                <motion.div 
                  className="border-b border-white/10 relative group"
                  whileFocus={{ borderBottomColor: '#c5a386' }}
                >
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2 block group-focus-within:text-brand-accent transition-colors">Care Specialty</label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-transparent outline-none text-base text-slate-400 appearance-none pb-3 cursor-pointer"
                  >
                    <option className="bg-slate-900">General Restoration</option>
                    <option className="bg-slate-900">Cosmetic Artistry</option>
                    <option className="bg-slate-900">Advanced Whitening</option>
                    <option className="bg-slate-900">Emergency Care</option>
                  </select>
                </motion.div>
                <motion.div 
                  className="border-b border-white/10 relative group"
                  whileFocus={{ borderBottomColor: '#c5a386' }}
                >
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2 block group-focus-within:text-brand-accent transition-colors flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Preferred Date
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-transparent outline-none text-base text-slate-400 pb-3 cursor-pointer [color-scheme:dark]" 
                  />
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#c5a386' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full bg-brand-teal text-white py-8 text-[12px] uppercase tracking-[0.5em] font-black transition-all shadow-2xl disabled:opacity-50 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {isSubmitting ? 'Processing request...' : 'Confirm Appointment'}
                  </span>
                  <div className="absolute inset-0 bg-slate-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                </motion.button>

                {submitStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-teal/20 border border-brand-teal p-4 text-center"
                  >
                    <p className="text-brand-teal font-display italic">Booking request sent successfully!</p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500 p-4 text-center"
                  >
                    <p className="text-red-400 font-display italic">{errorMessage}</p>
                  </motion.div>
                )}

                <p className="text-center text-[9px] text-slate-600 uppercase tracking-[0.2em] italic">
                  Bespoke service. Clinical excellence. Guaranteed response.
                </p>
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
    <section id="contact" className="py-24 bg-slate-50">
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
                  <p>Mon - Fri: 8:00 AM - 7:00 PM</p>
                  <p>Saturday: 9:00 AM - 3:00 PM</p>
                  <p>Sunday: Closed (Emergency only)</p>
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
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#admin" className="text-slate-800 hover:text-slate-700 transition-colors">Admin</a>
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
    // Refresh every 60 seconds
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return;
    
    setIsCancelling(id);
    try {
      await cancelBooking(id);
      await fetch();
    } catch (err: any) {
      console.error('handleCancel error', err);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setIsCancelling(null);
    }
  };

  if (!user) return null;

  return (
    <section id="my-bookings" className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-brand-accent"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Clinical Dashboard</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-6 italic">My Appointments</h2>
            <p className="text-slate-500 font-light italic text-lg leading-relaxed">
              Welcome back, {user.displayName || 'valuable patient'}. Here you can manage your scheduled visits, track treatment history, and view clinical requests.
            </p>
          </div>
          <button 
            onClick={fetch}
            disabled={isLoading}
            className="flex items-center gap-3 bg-white border border-slate-200 px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
          >
            <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Records
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-8 text-center mb-16 max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-bold text-xl">!</span>
            </div>
            <p className="text-red-700 font-display italic text-lg mb-4">Diagnostic Error: {error}</p>
            <button onClick={fetch} className="text-xs font-bold uppercase tracking-widest text-red-600 underline">Retry connection</button>
          </div>
        )}

        {isLoading && bookings.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="w-12 h-12 border-t-2 border-brand-teal border-solid rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-light italic tracking-widest text-xs uppercase">Accessing Secure Vault...</p>
          </div>
        ) : bookings.length === 0 && !error ? (
          <div className="bg-white p-20 text-center border border-slate-100 shadow-2xl max-w-3xl mx-auto relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:bg-brand-teal/10 transition-colors duration-500">
              <Calendar className="w-10 h-10 text-slate-200 group-hover:text-brand-teal transition-colors" />
            </div>
            <h3 className="text-3xl font-display italic mb-6">No Records Found</h3>
            <p className="text-slate-500 italic font-light mb-10 text-lg leading-relaxed max-w-lg mx-auto">
              Our system shows no active appointment requests for your profile. Ready for your next consultation?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  window.location.hash = '';
                }} 
                className="bg-brand-teal text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-900 transition-all shadow-xl hover:shadow-brand-teal/20"
              >
                Schedule First Visit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {bookings.sort((a, b) => {
              const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
              const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
              return dateB - dateA;
            }).map((booking, idx) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-100 shadow-sm relative group flex flex-col p-0 overflow-hidden hover:shadow-2xl transition-all duration-700"
              >
                <div className="h-2 w-full bg-brand-teal/5">
                  <div className={`h-full ${
                    booking.status === 'confirmed' ? 'bg-green-500 w-full' : 
                    booking.status === 'cancelled' ? 'bg-red-500 w-full' : 
                    'bg-amber-400 w-1/3'
                  }`}></div>
                </div>
                
                <div className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-14 h-14 bg-slate-50 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-500">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] uppercase tracking-[0.3em] font-black px-4 py-1.5 rounded-full border ${
                        booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="mt-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest">Status</p>
                    </div>
                  </div>

                  <h4 className="text-3xl font-display font-medium text-slate-900 mb-6 italic">{booking.service}</h4>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-accent">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Scheduled</p>
                        <p className="text-slate-700 italic font-medium">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-accent">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Patient</p>
                        <p className="text-slate-700 italic font-medium">{booking.fullName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-dashed border-slate-100 flex justify-between items-center bg-white mt-auto">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-slate-300 mb-1">ID Ref</p>
                      <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-tighter">CASE-{booking.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-slate-300 mb-1">Request Date</p>
                       <p className="text-xs text-slate-400 italic font-light">{booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      disabled={isCancelling === booking.id || booking.status === 'cancelled'}
                      className={`w-full py-4 text-[9px] uppercase tracking-[0.3em] font-black transition-all border ${
                        booking.status === 'cancelled'
                        ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
                      }`}
                    >
                      {isCancelling === booking.id ? 'Cancelling...' : booking.status === 'cancelled' ? 'Appointment Cancelled' : 'Cancel Appointment'}
                    </button>
                  </div>
                </div>
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

  if (activeView === 'admin') {
    return <AdminPortal />;
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
      <Navbar user={user} onSignInClick={() => setIsAuthModalOpen(true)} />
      
      <AnimatePresence mode="wait">
        {activeView === 'home' ? (
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
