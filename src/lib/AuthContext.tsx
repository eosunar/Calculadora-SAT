import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Unsubscribe from previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              isPro: false,
              createdAt: new Date().toISOString(),
            };
            setDoc(userDocRef, newProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
            setProfile(newProfile);
          }
          setLoading(false);
        }, (err) => {
          // Ignore permission errors if they happen during logout (auth.currentUser becomes null)
          if (err.code === 'permission-denied' && !auth.currentUser) {
            return;
          }
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('¡Sesión iniciada con éxito!');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('La ventana de inicio de sesión fue cerrada. Intenta de nuevo.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore or handle
      } else {
        toast.error(`Error al iniciar sesión: ${error.code || error.message || 'Error desconocido'}`);
        console.error("Login failed", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
