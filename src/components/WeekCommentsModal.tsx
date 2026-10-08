import React, { useState } from 'react';
import { MessageSquare, Send, User, Trash2, X, ShieldCheck, Lock, LogIn, UserPlus, LogOut } from 'lucide-react';
import { WeekComment } from '../types/journal';
import { useAuth } from '../context/AuthContext';

interface WeekCommentsModalProps {
  isOpen: boolean;
  weekNumber: number;
  comments: WeekComment[];
  onClose: () => void;
  onAddComment: (payload: { weekNumber: number; authorName: string; content: string }) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export function WeekCommentsModal({
  isOpen,
  weekNumber,
  comments,
  onClose,
  onAddComment,
  onDeleteComment,
}: WeekCommentsModalProps) {
  const {
    isAdmin,
    isLoggedIn,
    activeUserName,
    openUserAuthModal,
    logoutUser,
  } = useAuth();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const weekComments = (comments || [])
    .filter(c => Number(c.weekNumber) === Number(weekNumber))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isLoggedIn || !activeUserName) {
      setErrorMsg('Yorum yapabilmek için lütfen giriş yapınız.');
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setErrorMsg('Lütfen yorumunuzu yazınız.');
      return;
    }
    if (trimmedContent.length < 2) {
      setErrorMsg('Yorum çok kısa.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment({
        weekNumber,
        authorName: activeUserName,
        content: trimmedContent,
      });
      setContent('');
    } catch {
      setErrorMsg('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {weekNumber}. Hafta Yorumları
              </h3>
              <p className="text-xs text-blue-100">
                {weekComments.length === 0
                  ? 'Henüz yorum yapılmamış'
                  : `${weekComments.length} yorum yapıldı`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 min-h-[160px] max-h-[360px]">
          {weekComments.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Bu haftaya ait henüz yorum yok
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                İlk değerlendirmeyi veya tebriki siz bırakabilirsiniz.
              </p>
            </div>
          ) : (
            weekComments.map(c => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      {c.authorName}
                      {c.authorName.toLowerCase().includes('alperen') && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.formattedDate}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Yorumu sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-8">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bottom Area: Either Auth Required Callout OR Comment Submission Form */}
        {!isLoggedIn ? (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-center space-y-2.5 shrink-0">
            <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              <Lock className="w-3.5 h-3.5" />
              <span>Yorum yapmak için hesap gereklidir</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Öğretmeniniz, arkadaşlarınız veya ziyaretçiler değerlendirme bırakabilmek için giriş yapmalı veya hesap oluşturmalıdır.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openUserAuthModal('login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>
              <button
                type="button"
                onClick={() => openUserAuthModal('register')}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                <span>Hesap Oluştur</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
            {errorMsg && (
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Logged in User Bar */}
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {activeUserName?.charAt(0).toUpperCase()}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-xs">
                  Yorum yapan:{' '}
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {activeUserName}
                  </strong>
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Admin
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={logoutUser}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Farklı bir hesapla giriş yapın"
              >
                <LogOut className="w-3 h-3" />
                <span>Çıkış</span>
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`${weekNumber}. Hafta için yorumunuz veya tebrikiniz...`}
                disabled={isSubmitting}
                required
                autoFocus
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gönder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
