import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileText,
  Link2,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  ChevronRight,
  Copy,
  Check,
  Heart,
  MessageSquare,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { JournalData, WeekItem, TOTAL_WEEKS } from '../types/journal';
import { useAuth } from '../context/AuthContext';
import { WeekCommentsModal } from './WeekCommentsModal';

interface AllWeeksListProps {
  journalData: JournalData;
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
  onOpenAddModalForWeek: (weekNum: number) => void;
  onOpenEditModal: (item: WeekItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onAddComment: (payload: { weekNumber: number; authorName: string; content: string }) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

type FilterType = 'all' | 'has_items' | 'drive' | 'completed';

export function AllWeeksList({
  journalData,
  selectedWeek,
  onSelectWeek,
  onOpenAddModalForWeek,
  onOpenEditModal,
  onDeleteItem,
  onAddComment,
  onDeleteComment,
}: AllWeeksListProps) {
  const { isAdmin } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [commentModalWeek, setCommentModalWeek] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const allWeeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered weeks based on search query and filterType
  const filteredWeeks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allWeeks.filter(weekNum => {
      const items = (journalData.items || []).filter(it => Number(it.weekNumber) === Number(weekNum));
      const weekMeta = journalData.weeks[weekNum] || { status: 'not_started' };

      // Type filter
      if (filterType === 'has_items' && items.length === 0) return false;
      if (filterType === 'drive' && !items.some(it => it.type === 'drive' || it.driveUrl)) return false;
      if (filterType === 'completed' && weekMeta.status !== 'completed') return false;

      // Search query filter
      if (q) {
        const matchesWeekNum = String(weekNum).includes(q) || `hafta ${weekNum}`.includes(q);
        const matchesItems = items.some(it =>
          it.title.toLowerCase().includes(q) ||
          it.content.toLowerCase().includes(q) ||
          (it.driveUrl && it.driveUrl.toLowerCase().includes(q))
        );
        return matchesWeekNum || matchesItems;
      }

      return true;
    });
  }, [allWeeks, journalData, searchQuery, filterType]);

  return (
    <section id="all-weeks-record-section" className="py-8 sm:py-10 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Title & Search/Filter Controls */}
        <div className="mb-6 space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded">
                  Eksiksiz Süreç Kaydı
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">1 — 38. Hafta</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Bütün Haftalık Gelişim Kayıtları
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Tüm dönem boyunca eklenen çalışmalar, linkler ve dokümanlar liste halinde
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Gösterilen: <strong className="text-slate-900 dark:text-white font-bold">{filteredWeeks.length}</strong> / {TOTAL_WEEKS} Hafta
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white dark:bg-slate-850 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Hafta numarası, proje adı veya konuda ara..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Tümü ({TOTAL_WEEKS})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('has_items')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  filterType === 'has_items'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Çalışması Olanlar
              </button>
              <button
                type="button"
                onClick={() => setFilterType('drive')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  filterType === 'drive'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Google Drive
              </button>
              <button
                type="button"
                onClick={() => setFilterType('completed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  filterType === 'completed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Onaylananlar
              </button>
            </div>
          </div>
        </div>

        {/* Empty Search Result Fallback */}
        {filteredWeeks.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Aramanıza uygun hafta bulunamadı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Farklı bir kelime arayabilir veya filtreyi sıfırlayabilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          /* Vertical Feed for filtered weeks */
          <div className="space-y-4">
            {filteredWeeks.map(weekNum => {
            const items = (journalData.items || [])
              .filter(it => Number(it.weekNumber) === Number(weekNum))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const weekMeta = journalData.weeks[weekNum] || { status: 'not_started' };
            const isSelected = selectedWeek === weekNum;
            const weekCommentsCount = (journalData.comments || []).filter(c => Number(c.weekNumber) === Number(weekNum)).length;

            return (
              <div
                key={weekNum}
                className={`bg-white dark:bg-slate-850 border rounded-xl overflow-hidden transition-all duration-200 shadow-2xs ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Week Feed Header */}
                <div className="p-3.5 sm:p-4 bg-slate-50/50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onSelectWeek(weekNum)}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{weekNum}. Hafta</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {weekMeta.status === 'completed' ? (
                      <span className="flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                        Tamamlandı
                      </span>
                    ) : weekMeta.status === 'in_progress' || items.length > 0 ? (
                      <span className="flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <Clock className="w-3 h-3 mr-1 inline" />
                        Devam Ediyor
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <CircleDot className="w-3 h-3 mr-1 inline text-slate-400" />
                        Henüz Boş
                      </span>
                    )}

                    {(journalData.likes?.[weekNum] || weekMeta.likes || 0) > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        <span>{journalData.likes?.[weekNum] || weekMeta.likes}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Yorum Yap / Görüntüle Butonu */}
                    <button
                      onClick={() => setCommentModalWeek(weekNum)}
                      title={`${weekNum}. Hafta Yorumlarını Oku & Yorum Yap`}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>Yorumlar</span>
                      {weekCommentsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
                          {weekCommentsCount}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenAddModalForWeek(weekNum)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ekle</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Week Items Feed Body */}
                <div className="p-3.5 sm:p-5">
                  {items.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                      Bu haftaya ait henüz bir doküman veya kayıt girilmemiş.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map(it => (
                        <div
                          key={it.id}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {it.type === 'drive' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                  <Link2 className="w-3 h-3" />
                                  Google Drive
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                  <FileText className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                  Not / Çalışma
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                {it.formattedDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyText(it.id, `${it.title}\n\n${it.content}`)}
                                title="Metni kopyala"
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                              >
                                {copiedId === it.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => onOpenEditModal(it)}
                                    title="Düzenle"
                                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteItem(it.id)}
                                    title="Sil"
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">
                            {it.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-3">
                            {it.content}
                          </p>

                          {it.type === 'drive' && it.driveUrl && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                              <span className="text-xs text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                                {it.driveUrl}
                              </span>
                              <a
                                href={it.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <span>Drive Dosyasını Aç</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Week Comments Popup Modal */}
      {commentModalWeek !== null && (
        <WeekCommentsModal
          isOpen={true}
          weekNumber={commentModalWeek}
          comments={journalData.comments || []}
          onClose={() => setCommentModalWeek(null)}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </section>
  );
}
