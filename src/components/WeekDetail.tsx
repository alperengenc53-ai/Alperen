import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Lock,
  Check,
  X,
  Heart,
  Share2,
} from 'lucide-react';
import { JournalData, WeekItem, WeekStatus, TOTAL_WEEKS } from '../types/journal';
import { ItemCard } from './ItemCard';
import { useAuth } from '../context/AuthContext';
import { isWeekLiked } from '../services/journalService';

interface WeekDetailProps {
  weekNumber: number;
  journalData: JournalData;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: WeekItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onUpdateWeekStatus: (weekNum: number, status: WeekStatus) => Promise<void>;
  onLikeWeek: (weekNum: number) => Promise<{ likes: number; isLiked: boolean }>;
}

export function WeekDetail({
  weekNumber,
  journalData,
  onSelectWeek,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteItem,
  onUpdateWeekStatus,
  onLikeWeek,
}: WeekDetailProps) {
  const { isAdmin, openLoginModal } = useAuth();
  const [hasLiked, setHasLiked] = useState(() => isWeekLiked(weekNumber));
  const [isLiking, setIsLiking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setHasLiked(isWeekLiked(weekNumber));
  }, [weekNumber]);

  const currentWeekMeta = journalData.weeks[weekNumber] || {
    weekNumber,
    status: 'not_started',
    likes: 0,
  };

  const likeCount = journalData.likes?.[weekNumber] || currentWeekMeta.likes || 0;

  const weekItems = (journalData.items || [])
    .filter(item => Number(item.weekNumber) === Number(weekNumber))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePrev = () => {
    if (weekNumber > 1) {
      onSelectWeek(weekNumber - 1);
    }
  };

  const handleNext = () => {
    if (weekNumber < TOTAL_WEEKS) {
      onSelectWeek(weekNumber + 1);
    }
  };

  const handleToggleStatus = async () => {
    if (!isAdmin) {
      openLoginModal();
      return;
    }
    const nextStatus: WeekStatus = currentWeekMeta.status === 'completed' ? 'not_started' : 'completed';
    await onUpdateWeekStatus(weekNumber, nextStatus);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await onLikeWeek(weekNumber);
      setHasLiked(res.isLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#week-${weekNumber}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isCompleted = currentWeekMeta.status === 'completed';
  const allWeeksList = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  return (
    <section id="week-detail-section" className="py-6 sm:py-8 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Box for Selected Week */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
          {/* Week Detail Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
            {/* Left: Week title & switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={weekNumber <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Önceki Hafta"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={weekNumber >= TOTAL_WEEKS}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Sonraki Hafta"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {weekNumber}. Hafta Detayları
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">/ {TOTAL_WEEKS} Hafta</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {weekItems.length} kayıtlı çalışma · Google Drive ve Proje Dosyaları
                </p>
              </div>
            </div>

            {/* Right: Like Button + Yapıldı/Yapılmadı + Add Button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Like / Beğeni Butonu (Tüm ziyaretçiler beğenebilir) */}
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                title={`${weekNumber}. Haftayı Beğen`}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                  hasLiked
                    ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 ring-2 ring-rose-500/20 scale-105'
                    : 'bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-200 ${
                    hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 group-hover:text-rose-500'
                  }`}
                />
                <span>Beğen</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-mono">
                  {likeCount}
                </span>
              </button>

              {/* Paylaş / Bağlantıyı Kopyala */}
              <button
                type="button"
                onClick={handleShare}
                title="Hafta bağlantısını kopyala"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 dark:text-emerald-400">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Paylaş</span>
                  </>
                )}
              </button>

              {/* Yapıldı / Yapılmadı Toggle */}
              <button
                type="button"
                onClick={handleToggleStatus}
                title={
                  !isAdmin
                    ? 'Durumu değiştirmek için Yönetici Girişi yapın'
                    : isCompleted
                    ? 'Durumu Yapılmadı olarak değiştir'
                    : 'Haftayı Onaylı / Yapıldı olarak işaretle'
                }
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Yapıldı</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-500" />
                    <span>Yapılmadı</span>
                  </>
                )}
                {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
              </button>

              {/* Direct Add Button for Current Week (Admin Only) */}
              {isAdmin ? (
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bu Haftaya Ekle</span>
                </button>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                  title="Yenilik veya dosya eklemek için Yönetici girişi yapın"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin ile Ekle</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Jump Timeline Ribbon (1..38) - High-contrast, vivid numbers, absolutely NO white */}
          <div className="px-4 py-3 bg-slate-300/80 dark:bg-slate-900 border-b border-slate-350 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider shrink-0 pr-1">
              Hızlı Geçiş (1-38):
            </span>
            {allWeeksList.map(num => {
              const isCur = num === weekNumber;
              const hasItem = (journalData.items || []).some(it => Number(it.weekNumber) === num);
              const isDone = journalData.weeks[num]?.status === 'completed';

              return (
                <button
                  key={num}
                  onClick={() => onSelectWeek(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1 relative ${
                    isCur
                      ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-blue-500/50 z-10'
                      : isDone
                      ? 'bg-emerald-200 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-300 dark:hover:bg-emerald-900 border border-emerald-400 dark:border-emerald-700'
                      : hasItem
                      ? 'bg-blue-200 dark:bg-blue-950 text-blue-950 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-900 border border-blue-400 dark:border-blue-700'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-100 hover:bg-slate-400/40 dark:hover:bg-slate-700 border border-slate-400/70 dark:border-slate-650'
                  }`}
                  title={`${num}. Hafta ${isDone ? '(Tamamlandı)' : hasItem ? '(Çalışma Var)' : '(Boş)'}`}
                >
                  <span className="font-black text-xs leading-none">{num}</span>
                  {isDone ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                  ) : hasItem ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Week Items Content */}
          <div className="p-4 sm:p-6">
            {weekItems.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-850/40">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  {weekNumber}. Hafta için Henüz Kayıt Bulunmuyor
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  Öğretmeninizin incelemesi için projenizin bu haftadaki ilerlemesini veya Google Drive bağlantısını ekleyebilirsiniz.
                </p>
                {isAdmin ? (
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ İlk İçeriği veya Drive Linkini Ekle</span>
                  </button>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>İçerik Eklemek İçin Yönetici Girişi Yapın</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {weekItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onEdit={onOpenEditModal}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
