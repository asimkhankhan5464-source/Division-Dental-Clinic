import { auth, db } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

export const syncUserProfile = async (user: FirebaseUser) => {
  if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
    console.warn('syncUserProfile: Auth mismatch or not ready', { 
      currentUser: auth.currentUser?.uid, 
      passedUser: user.uid 
    });
    return;
  }

  const path = `users/${user.uid}`;
  console.log('Syncing user profile:', path);
  
  try {
    const userDoc = doc(db, 'users', user.uid);
    // Use getDoc instead of getDocFromServer for better cache handling
    let snapshot = null;
    try {
      snapshot = await getDoc(userDoc);
    } catch (e) {
      console.warn('Initial getDoc failed (possibly new user), proceeding to creation:', e);
    }
    
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      updatedAt: serverTimestamp(),
    };

    if (!snapshot || !snapshot.exists()) {
      console.log('Creating new user profile:', path);
      await setDoc(userDoc, {
        ...data,
        createdAt: serverTimestamp(),
      });
    } else {
      console.log('Updating existing user profile:', path);
      await setDoc(userDoc, data, { merge: true });
    }
    console.log('User profile sync: SUCCESS');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const testFirestoreConnection = async () => {
  const path = 'test/connection';
  try {
    const testDoc = doc(db, path);
    await getDocFromServer(testDoc);
    console.log('Firestore connection: SUCCESS');
    return true;
  } catch (error) {
    console.error('Firestore connection: FAILED', error);
    return false;
  }
};

export const getBookingsByDate = async (date: string) => {
  const path = 'bookings';
  try {
    const q = query(collection(db, path), where('date', '==', date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const createBooking = async (bookingData: any) => {
  const path = 'bookings';
  if (!auth.currentUser) throw new Error('Authentication required');
  
  const payload = {
    status: 'pending', // Default status
    ...bookingData,
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    createdAt: serverTimestamp(),
  };
  
  console.log('Creating booking with payload:', payload);

  try {
    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserBookings = async () => {
  const path = 'bookings';
  if (!auth.currentUser) {
    console.warn('getUserBookings: No user authenticated');
    return [];
  }
  console.log('Fetching bookings for user:', auth.currentUser.uid);
  try {
    // Removed orderBy to avoid requiring a composite index in Firestore
    const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getAllBookings = async () => {
  const path = 'bookings';
  if (!auth.currentUser) return [];
  try {
    // Removed orderBy to avoid index issues on large collections
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  const path = `bookings/${bookingId}`;
  if (!auth.currentUser) throw new Error('Authentication required');
  
  try {
    const bookingDoc = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDoc);
    console.log('Booking cancelled successfully:', bookingId);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
