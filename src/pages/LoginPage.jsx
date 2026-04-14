import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 min-h-screen flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-10 max-w-sm w-full text-center"
      >
        <motion.span
          className="text-6xl block mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 4 }}
        >
          🎬
        </motion.span>

        <h1 className="text-2xl font-extrabold mb-2">
          FilmBul'a Hoş Geldin
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Giriş yap, favorilerini kaydet ve kişiselleştirilmiş öneriler al.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          <FcGoogle size={22} />
          Google ile Giriş Yap
        </motion.button>

        <p className="text-[11px] text-gray-600 mt-6">
          Giriş yaparak kullanım koşullarını kabul etmiş olursun.
        </p>
      </motion.div>
    </motion.div>
  );
}

