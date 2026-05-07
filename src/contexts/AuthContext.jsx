import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

function mapAuthError(err) {
  switch (err?.code) {
    case 'auth/configuration-not-found':
      return 'Google giriş ayarı bulunamadı. Firebase Console > Authentication > Sign-in method bölümünde Google sağlayıcısını etkinleştir.';
    case 'auth/unauthorized-domain':
      return 'Bu domain yetkili değil. Firebase Console > Authentication > Settings > Authorized domains listesine localhost ekleyin.';
    case 'auth/popup-closed-by-user':
      return 'Giriş penceresi kapatıldı. Tekrar deneyin.';
    default:
      return err?.message || 'Giriş sırasında beklenmeyen bir hata oluştu.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        const data = {
          uid: u.uid,
          lastLoginAt: serverTimestamp(),
          provider: u.providerData?.[0]?.providerId || 'unknown',
        };
        if (u.displayName) data.displayName = u.displayName;
        if (u.photoURL) data.photoURL = u.photoURL;
        if (u.email) data.email = u.email;
        if (u.metadata?.creationTime) data.createdAt = new Date(u.metadata.creationTime);
        setDoc(doc(db, 'users', u.uid), data, { merge: true }).catch(() => {});
      }
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Hoş geldin! 🎬');
    } catch (err) {
      console.error('Google login failed:', err?.code, err?.message);
      toast.error('Giriş başarısız: ' + mapAuthError(err));
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Çıkış yapıldı');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

