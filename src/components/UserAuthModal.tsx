import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, X, Mail, Lock, AlertCircle, Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function UserAuthModal() {
  const {
    isUserAuthModalOpen,
    userAuthModalTab,
    closeUserAuthModal,
    openUserAuthModal,
    loginUser,
    registerUser,
  } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isUserAuthModalOpen) {
      setError(null);
      setPassword('');
    }
  }, [isUserAuthModalOpen, userAuthModalTab]);

  if (!isUserAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (userAuthModalTab === 'register') {
        const res = await registerUser(firstName, lastName, email, password);
        if (!res.success) {
          setError(res.error || 'Hesap oluşturulurken hata oluştu.');
        } else {
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
        }
      } else {
        const res = await loginUser(email, password);
        if (!res.success) {
          setError(res.error || 'Giriş yapılırken hata oluştu.');
        } else {
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              {userAuthModalTab === 'register' ? (
                <UserPlus className="w-5 h-5 text-white" />
              ) : (
                <LogIn className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                {userAuthModalTab === 'register' ? 'Hesap Oluştur' : 'Giriş Yap'}
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                {userAuthModalTab === 'register'
                  ? 'Yorum yapmak ve değerlendirme bırakmak için kaydolun'
                  : 'Hesabınızla giriş yaparak yorumlarınızı paylaşın'}
              </p>
            </div>
          </div>
          <button
            onClick={closeUserAuthModal}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => openUserAuthModal('login')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              userAuthModalTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </button>
          <button
            type="button"
            onClick={() => openUserAuthModal('register')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              userAuthModalTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Hesap Oluştur</span>
          </button>
        </div>

        {/* Form Body: Separate boxes stacked vertically */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Fields: Separate Ad and Soyad in vertical stacked boxes */}
          {userAuthModalTab === 'register' && (
            <>
              {/* Box 1: Ad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adınız
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Adınızı giriniz (Örn: Ahmet)"
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Box 2: Soyad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Soyadınız
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Soyadınızı giriniz (Örn: Yılmaz)"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Box 3: E-posta Adresi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@gmail.com veya okul e-postanız"
                required
                autoFocus={userAuthModalTab === 'login'}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            {userAuthModalTab === 'register' && (
              <p className="text-[10px] text-slate-400 mt-1">
                Giriş yaparken bu e-posta adresinizi kullanacaksınız.
              </p>
            )}
          </div>

          {/* Box 4: Şifre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={userAuthModalTab === 'register' ? 'En az 4 karakterli bir şifre belirleyin' : 'Şifrenizi girin'}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>İşlem Yapılıyor...</span>
                </>
              ) : userAuthModalTab === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Hesap Oluştur</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1.5 text-center">
            {userAuthModalTab === 'login' ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => openUserAuthModal('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Hesap Oluşturun
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zaten bir hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => openUserAuthModal('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Giriş Yapın
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
